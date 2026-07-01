package com.jobflow.ai.controller;

import com.jobflow.ai.dto.response.ResumeDto;
import com.jobflow.ai.entity.User;
import com.jobflow.ai.repository.UserRepository;
import com.jobflow.ai.service.ResumeService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/resumes")
@RequiredArgsConstructor
@Tag(name = "Resumes")
public class ResumeController {

    private final ResumeService resumeService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<ResumeDto>> getAll(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(resumeService.getAll(getUser(ud)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResumeDto> getById(@AuthenticationPrincipal UserDetails ud, @PathVariable Long id) {
        return ResponseEntity.ok(resumeService.getById(getUser(ud), id));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ResumeDto> upload(
            @AuthenticationPrincipal UserDetails ud,
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String notes) throws Exception {
        return ResponseEntity.ok(resumeService.upload(getUser(ud), file, name, category, notes));
    }

    @PatchMapping("/{id}/rename")
    public ResponseEntity<ResumeDto> rename(@AuthenticationPrincipal UserDetails ud, @PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(resumeService.rename(getUser(ud), id, body.get("name")));
    }

    @PatchMapping("/{id}/set-default")
    public ResponseEntity<ResumeDto> setDefault(@AuthenticationPrincipal UserDetails ud, @PathVariable Long id) {
        return ResponseEntity.ok(resumeService.setDefault(getUser(ud), id));
    }

    @PostMapping("/{id}/duplicate")
    public ResponseEntity<ResumeDto> duplicate(@AuthenticationPrincipal UserDetails ud, @PathVariable Long id) throws Exception {
        return ResponseEntity.ok(resumeService.duplicate(getUser(ud), id));
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> download(@AuthenticationPrincipal UserDetails ud, @PathVariable Long id) throws Exception {
        Path filePath = resumeService.getFilePath(getUser(ud), id);
        Resource resource = new UrlResource(filePath.toUri());
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filePath.getFileName() + "\"")
                .body(resource);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(@AuthenticationPrincipal UserDetails ud, @PathVariable Long id) throws Exception {
        resumeService.delete(getUser(ud), id);
        return ResponseEntity.ok(Map.of("message", "Resume deleted"));
    }

    private User getUser(UserDetails ud) {
        return userRepository.findByEmail(ud.getUsername()).orElseThrow();
    }
}
