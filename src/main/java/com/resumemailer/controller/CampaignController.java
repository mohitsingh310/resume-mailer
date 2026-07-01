package com.resumemailer.controller;

import com.resumemailer.entity.*;
import com.resumemailer.repository.*;
import com.resumemailer.service.GmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/campaigns")
@RequiredArgsConstructor
@Slf4j
public class CampaignController {
    private final UserRepository userRepository;
    private final ResumeRepository resumeRepository;
    private final EmailTemplateRepository templateRepository;
    private final SentEmailRepository sentEmailRepository;
    private final ScheduledEmailRepository scheduledEmailRepository;
    private final GmailService gmailService;

    @PostMapping("/send")
    public ResponseEntity<?> send(@AuthenticationPrincipal UserDetails ud,
                                  @RequestBody Map<String, Object> req) {
        User user = getUser(ud);
        if (!Boolean.TRUE.equals(user.getGmailConnected()))
            return ResponseEntity.badRequest().body(Map.of("error", "Gmail not connected. Please connect Gmail in Settings."));

        String to = (String) req.get("recruiterEmail");
        String cc = (String) req.getOrDefault("cc", null);
        String bcc = (String) req.getOrDefault("bcc", null);
        String subject = (String) req.get("subject");
        String body = (String) req.get("body");
        Long resumeId = req.get("resumeId") != null ? Long.parseLong(req.get("resumeId").toString()) : null;

        Resume resume = null;
        byte[] pdfData = null;
        String pdfName = null;
        if (resumeId != null) {
            resume = resumeRepository.findByIdAndUserId(resumeId, user.getId()).orElse(null);
            if (resume != null) {
                pdfData = resume.getFileData();
                pdfName = resume.getOriginalFileName();
            }
        }

        try {
            gmailService.sendEmail(user, to, cc, bcc, subject, body, pdfName, pdfData);

            SentEmail sent = SentEmail.builder()
                    .user(user).resume(resume)
                    .recruiterName((String) req.getOrDefault("recruiterName", null))
                    .recruiterEmail(to)
                    .company((String) req.getOrDefault("company", null))
                    .role((String) req.getOrDefault("role", null))
                    .subject(subject).body(body).cc(cc).bcc(bcc)
                    .status("SENT").sentAt(LocalDateTime.now())
                    .build();

            if (req.get("templateId") != null) {
                Long tplId = Long.parseLong(req.get("templateId").toString());
                templateRepository.findByIdAndUserId(tplId, user.getId()).ifPresent(t -> {
                    sent.setTemplate(t);
                    int count = t.getUsageCount() != null ? t.getUsageCount() : 0;
                    t.setUsageCount(count + 1);
                    templateRepository.save(t);
                });
            }
            if (resume != null) {
                int count = resume.getUsageCount() != null ? resume.getUsageCount() : 0;
                resume.setUsageCount(count + 1);
                resumeRepository.save(resume);
            }
            sentEmailRepository.save(sent);
            return ResponseEntity.ok(Map.of("message", "Email sent successfully", "id", sent.getId()));
        } catch (Exception e) {
            log.error("Send failed: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/schedule")
    public ResponseEntity<?> schedule(@AuthenticationPrincipal UserDetails ud,
                                      @RequestBody Map<String, Object> req) {
        User user = getUser(ud);
        String scheduledAtStr = (String) req.get("scheduledAt");
        LocalDateTime scheduledAt = LocalDateTime.parse(scheduledAtStr);

        Long resumeId = req.get("resumeId") != null ? Long.parseLong(req.get("resumeId").toString()) : null;
        Resume resume = resumeId != null ? resumeRepository.findByIdAndUserId(resumeId, user.getId()).orElse(null) : null;

        ScheduledEmail s = ScheduledEmail.builder()
                .user(user).resume(resume)
                .recruiterName((String) req.getOrDefault("recruiterName", null))
                .recruiterEmail((String) req.get("recruiterEmail"))
                .company((String) req.getOrDefault("company", null))
                .role((String) req.getOrDefault("role", null))
                .subject((String) req.get("subject"))
                .body((String) req.get("body"))
                .cc((String) req.getOrDefault("cc", null))
                .bcc((String) req.getOrDefault("bcc", null))
                .scheduledAt(scheduledAt)
                .timezone((String) req.getOrDefault("timezone", "Asia/Kolkata"))
                .status("SCHEDULED")
                .build();

        if (req.get("templateId") != null) {
            Long tplId = Long.parseLong(req.get("templateId").toString());
            templateRepository.findByIdAndUserId(tplId, user.getId()).ifPresent(s::setTemplate);
        }
        scheduledEmailRepository.save(s);
        return ResponseEntity.ok(toScheduledMap(s));
    }

    @GetMapping("/scheduled")
    public ResponseEntity<?> listScheduled(@AuthenticationPrincipal UserDetails ud) {
        User user = getUser(ud);
        return ResponseEntity.ok(scheduledEmailRepository.findByUserIdOrderByScheduledAtDesc(user.getId())
                .stream().map(this::toScheduledMap).collect(Collectors.toList()));
    }

    @PutMapping("/scheduled/{id}")
    public ResponseEntity<?> updateScheduled(@AuthenticationPrincipal UserDetails ud,
                                             @PathVariable Long id,
                                             @RequestBody Map<String, Object> req) {
        User user = getUser(ud);
        return scheduledEmailRepository.findByIdAndUserId(id, user.getId()).map(s -> {
            if (req.containsKey("scheduledAt")) s.setScheduledAt(LocalDateTime.parse((String) req.get("scheduledAt")));
            if (req.containsKey("status")) s.setStatus((String) req.get("status"));
            if (req.containsKey("subject")) s.setSubject((String) req.get("subject"));
            if (req.containsKey("body")) s.setBody((String) req.get("body"));
            scheduledEmailRepository.save(s);
            return ResponseEntity.ok(toScheduledMap(s));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/scheduled/{id}")
    public ResponseEntity<Void> deleteScheduled(@AuthenticationPrincipal UserDetails ud, @PathVariable Long id) {
        User user = getUser(ud);
        scheduledEmailRepository.findByIdAndUserId(id, user.getId()).ifPresent(scheduledEmailRepository::delete);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/sent")
    public ResponseEntity<?> sentHistory(@AuthenticationPrincipal UserDetails ud,
                                         @RequestParam(defaultValue = "0") int page,
                                         @RequestParam(defaultValue = "20") int size,
                                         @RequestParam(required = false) String q) {
        User user = getUser(ud);
        Pageable pageable = PageRequest.of(page, size);
        Page<SentEmail> result = (q != null && !q.isBlank())
                ? sentEmailRepository.search(user.getId(), q, pageable)
                : sentEmailRepository.findByUserIdOrderBySentAtDesc(user.getId(), pageable);
        return ResponseEntity.ok(Map.of(
            "content", result.getContent().stream().map(this::toSentMap).collect(Collectors.toList()),
            "totalPages", result.getTotalPages(),
            "totalElements", result.getTotalElements()
        ));
    }

    @DeleteMapping("/sent/{id}")
    public ResponseEntity<Void> deleteSent(@AuthenticationPrincipal UserDetails ud, @PathVariable Long id) {
        User user = getUser(ud);
        sentEmailRepository.findByIdAndUserId(id, user.getId()).ifPresent(sentEmailRepository::delete);
        return ResponseEntity.noContent().build();
    }

    private Map<String, Object> toScheduledMap(ScheduledEmail s) {
        var m = new LinkedHashMap<String, Object>();
        m.put("id", s.getId());
        m.put("recruiterName", s.getRecruiterName());
        m.put("recruiterEmail", s.getRecruiterEmail());
        m.put("company", s.getCompany());
        m.put("role", s.getRole());
        m.put("subject", s.getSubject());
        m.put("scheduledAt", s.getScheduledAt());
        m.put("timezone", s.getTimezone());
        m.put("status", s.getStatus());
        m.put("errorMessage", s.getErrorMessage());
        m.put("sentAt", s.getSentAt());
        m.put("resumeName", s.getResume() != null ? s.getResume().getName() : null);
        m.put("templateName", s.getTemplate() != null ? s.getTemplate().getName() : null);
        m.put("createdAt", s.getCreatedAt());
        return m;
    }

    private Map<String, Object> toSentMap(SentEmail s) {
        var m = new LinkedHashMap<String, Object>();
        m.put("id", s.getId());
        m.put("recruiterName", s.getRecruiterName());
        m.put("recruiterEmail", s.getRecruiterEmail());
        m.put("company", s.getCompany());
        m.put("role", s.getRole());
        m.put("subject", s.getSubject());
        m.put("status", s.getStatus());
        m.put("sentAt", s.getSentAt());
        m.put("resumeName", s.getResume() != null ? s.getResume().getName() : null);
        m.put("templateName", s.getTemplate() != null ? s.getTemplate().getName() : null);
        return m;
    }

    private User getUser(UserDetails ud) {
        return userRepository.findByEmail(ud.getUsername()).orElseThrow();
    }
}
