package com.resumemailer.controller;

import com.resumemailer.entity.*;
import com.resumemailer.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/resumes")
@RequiredArgsConstructor
public class ResumeController {
    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> list(@AuthenticationPrincipal UserDetails ud) {
        User user = getUser(ud);
        return ResponseEntity.ok(resumeRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream().map(this::toMap).collect(Collectors.toList()));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> upload(@AuthenticationPrincipal UserDetails ud,
                                    @RequestParam("file") MultipartFile file,
                                    @RequestParam("name") String name,
                                    @RequestParam(value = "category", defaultValue = "GENERIC") String category,
                                    @RequestParam(value = "notes", required = false) String notes) {
        try {
            User user = getUser(ud);
            Resume resume = Resume.builder()
                    .user(user)
                    .name(name)
                    .originalFileName(file.getOriginalFilename())
                    .fileData(file.getBytes())
                    .fileSize(file.getSize())
                    .category(category)
                    .notes(notes)
                    .isDefault(false)
                    .build();
            resumeRepository.save(resume);
            return ResponseEntity.ok(toMap(resume));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@AuthenticationPrincipal UserDetails ud,
                                    @PathVariable Long id,
                                    @RequestBody Map<String, String> req) {
        User user = getUser(ud);
        return resumeRepository.findByIdAndUserId(id, user.getId()).map(r -> {
            if (req.containsKey("name")) r.setName(req.get("name"));
            if (req.containsKey("category")) r.setCategory(req.get("category"));
            if (req.containsKey("notes")) r.setNotes(req.get("notes"));
            resumeRepository.save(r);
            return ResponseEntity.ok(toMap(r));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/set-default")
    public ResponseEntity<?> setDefault(@AuthenticationPrincipal UserDetails ud, @PathVariable Long id) {
        User user = getUser(ud);
        // Unset all defaults
        resumeRepository.findByUserIdAndIsDefaultTrue(user.getId()).forEach(r -> {
            r.setIsDefault(false);
            resumeRepository.save(r);
        });
        return resumeRepository.findByIdAndUserId(id, user.getId()).map(r -> {
            r.setIsDefault(true);
            resumeRepository.save(r);
            return ResponseEntity.ok(toMap(r));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> download(@AuthenticationPrincipal UserDetails ud, @PathVariable Long id) {
        User user = getUser(ud);
        return resumeRepository.findByIdAndUserId(id, user.getId()).map(r -> {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", r.getOriginalFileName());
            return ResponseEntity.ok().headers(headers).body(r.getFileData());
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/duplicate")
    public ResponseEntity<?> duplicate(@AuthenticationPrincipal UserDetails ud, @PathVariable Long id) {
        User user = getUser(ud);
        return resumeRepository.findByIdAndUserId(id, user.getId()).map(r -> {
            Resume copy = Resume.builder()
                    .user(user).name(r.getName() + " (Copy)")
                    .originalFileName(r.getOriginalFileName())
                    .fileData(r.getFileData()).fileSize(r.getFileSize())
                    .category(r.getCategory()).notes(r.getNotes())
                    .isDefault(false).build();
            resumeRepository.save(copy);
            return ResponseEntity.ok(toMap(copy));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal UserDetails ud, @PathVariable Long id) {
        User user = getUser(ud);
        resumeRepository.findByIdAndUserId(id, user.getId()).ifPresent(resumeRepository::delete);
        return ResponseEntity.noContent().build();
    }

    private Map<String, Object> toMap(Resume r) {
        var map = new LinkedHashMap<String, Object>();
        map.put("id", r.getId());
        map.put("name", r.getName());
        map.put("originalFileName", r.getOriginalFileName());
        map.put("fileSize", r.getFileSize());
        map.put("category", r.getCategory());
        map.put("notes", r.getNotes() != null ? r.getNotes() : "");
        map.put("isDefault", r.getIsDefault());
        map.put("usageCount", r.getUsageCount());
        map.put("createdAt", r.getCreatedAt());
        map.put("updatedAt", r.getUpdatedAt());
        return map;
    }

    private User getUser(UserDetails ud) {
        return userRepository.findByEmail(ud.getUsername()).orElseThrow();
    }
}
