package com.resumemailer.controller;

import com.resumemailer.entity.*;
import com.resumemailer.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/templates")
@RequiredArgsConstructor
public class EmailTemplateController {
    private final EmailTemplateRepository templateRepository;
    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<?> list(@AuthenticationPrincipal UserDetails ud,
                                  @RequestParam(defaultValue = "0") int page,
                                  @RequestParam(defaultValue = "20") int size,
                                  @RequestParam(required = false) String q) {
        User user = getUser(ud);
        Pageable pageable = PageRequest.of(page, size, Sort.by("updatedAt").descending());
        Page<EmailTemplate> result = (q != null && !q.isBlank())
                ? templateRepository.search(user.getId(), q, pageable)
                : templateRepository.findByUserId(user.getId(), pageable);
        return ResponseEntity.ok(Map.of(
                "content", result.getContent().stream().map(this::toMap).collect(Collectors.toList()),
                "totalPages", result.getTotalPages(),
                "totalElements", result.getTotalElements()
        ));
    }

    @GetMapping("/favorites")
    public ResponseEntity<?> favorites(@AuthenticationPrincipal UserDetails ud) {
        User user = getUser(ud);
        return ResponseEntity.ok(templateRepository.findByUserIdAndIsFavoriteTrueOrderByUpdatedAtDesc(user.getId())
                .stream().map(this::toMap).collect(Collectors.toList()));
    }

    @PostMapping
    public ResponseEntity<?> create(@AuthenticationPrincipal UserDetails ud,
                                    @RequestBody Map<String, Object> req) {
        User user = getUser(ud);
        EmailTemplate t = new EmailTemplate();
        t.setUser(user);
        t.setName((String) req.get("name"));
        t.setCategory((String) req.getOrDefault("category", "COLD_EMAIL"));
        t.setSubject((String) req.get("subject"));
        t.setBody((String) req.get("body"));
        if (req.get("fieldsJson") != null) t.setFieldsJson(req.get("fieldsJson").toString());
        if (req.get("designId") != null) t.setDesignId(req.get("designId").toString());
        t.setIsFavorite(Boolean.TRUE.equals(req.get("isFavorite")));

        if (req.get("defaultResumeId") != null) {
            Long resumeId = Long.parseLong(req.get("defaultResumeId").toString());
            resumeRepository.findByIdAndUserId(resumeId, user.getId()).ifPresent(t::setDefaultResume);
        }
        templateRepository.save(t);
        return ResponseEntity.ok(toMap(t));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@AuthenticationPrincipal UserDetails ud,
                                    @PathVariable Long id,
                                    @RequestBody Map<String, Object> req) {
        User user = getUser(ud);
        return templateRepository.findByIdAndUserId(id, user.getId()).map(t -> {
            if (req.containsKey("name")) t.setName((String) req.get("name"));
            if (req.containsKey("category")) t.setCategory((String) req.get("category"));
            if (req.containsKey("subject")) t.setSubject((String) req.get("subject"));
            if (req.containsKey("body")) t.setBody((String) req.get("body"));
            if (req.containsKey("fieldsJson")) t.setFieldsJson(req.get("fieldsJson") != null ? req.get("fieldsJson").toString() : null);
            if (req.containsKey("designId")) t.setDesignId(req.get("designId") != null ? req.get("designId").toString() : null);
            if (req.containsKey("isFavorite")) t.setIsFavorite(Boolean.TRUE.equals(req.get("isFavorite")));
            if (req.containsKey("defaultResumeId")) {
                if (req.get("defaultResumeId") == null) {
                    t.setDefaultResume(null);
                } else {
                    Long resumeId = Long.parseLong(req.get("defaultResumeId").toString());
                    resumeRepository.findByIdAndUserId(resumeId, user.getId()).ifPresent(t::setDefaultResume);
                }
            }
            templateRepository.save(t);
            return ResponseEntity.ok(toMap(t));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/toggle-favorite")
    public ResponseEntity<?> toggleFavorite(@AuthenticationPrincipal UserDetails ud, @PathVariable Long id) {
        User user = getUser(ud);
        return templateRepository.findByIdAndUserId(id, user.getId()).map(t -> {
            t.setIsFavorite(!Boolean.TRUE.equals(t.getIsFavorite()));
            templateRepository.save(t);
            return ResponseEntity.ok(toMap(t));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/duplicate")
    public ResponseEntity<?> duplicate(@AuthenticationPrincipal UserDetails ud, @PathVariable Long id) {
        User user = getUser(ud);
        return templateRepository.findByIdAndUserId(id, user.getId()).map(t -> {
            EmailTemplate copy = new EmailTemplate();
            copy.setUser(user);
            copy.setName(t.getName() + " (Copy)");
            copy.setCategory(t.getCategory());
            copy.setSubject(t.getSubject());
            copy.setBody(t.getBody());
            copy.setFieldsJson(t.getFieldsJson());
            copy.setDesignId(t.getDesignId());
            copy.setDefaultResume(t.getDefaultResume());
            copy.setIsFavorite(false);
            templateRepository.save(copy);
            return ResponseEntity.ok(toMap(copy));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal UserDetails ud, @PathVariable Long id) {
        User user = getUser(ud);
        templateRepository.findByIdAndUserId(id, user.getId()).ifPresent(templateRepository::delete);
        return ResponseEntity.noContent().build();
    }

    private Map<String, Object> toMap(EmailTemplate t) {
        var map = new LinkedHashMap<String, Object>();
        map.put("id", t.getId());
        map.put("name", t.getName());
        map.put("category", t.getCategory());
        map.put("subject", t.getSubject());
        map.put("body", t.getBody());
        map.put("fieldsJson", t.getFieldsJson());
        map.put("designId", t.getDesignId());
        map.put("isFavorite", t.getIsFavorite());
        map.put("usageCount", t.getUsageCount());
        map.put("createdAt", t.getCreatedAt());
        map.put("updatedAt", t.getUpdatedAt());
        if (t.getDefaultResume() != null) {
            map.put("defaultResumeId", t.getDefaultResume().getId());
            map.put("defaultResumeName", t.getDefaultResume().getName());
            map.put("defaultResumeFileName", t.getDefaultResume().getOriginalFileName());
        } else {
            map.put("defaultResumeId", null);
            map.put("defaultResumeName", null);
            map.put("defaultResumeFileName", null);
        }
        return map;
    }

    private User getUser(UserDetails ud) {
        return userRepository.findByEmail(ud.getUsername()).orElseThrow();
    }
}