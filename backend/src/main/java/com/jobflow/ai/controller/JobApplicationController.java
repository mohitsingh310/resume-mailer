package com.jobflow.ai.controller;

import com.jobflow.ai.dto.request.JobApplicationRequest;
import com.jobflow.ai.dto.response.JobApplicationDto;
import com.jobflow.ai.dto.response.PageResponse;
import com.jobflow.ai.entity.User;
import com.jobflow.ai.enums.ApplicationStatus;
import com.jobflow.ai.repository.UserRepository;
import com.jobflow.ai.service.JobApplicationService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
@Tag(name = "Job Applications")
public class JobApplicationController {

    private final JobApplicationService jobApplicationService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<PageResponse<JobApplicationDto>> getAll(
            @AuthenticationPrincipal UserDetails ud,
            @RequestParam(required = false) String query,
            @RequestParam(required = false) ApplicationStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(jobApplicationService.getAll(getUser(ud), query, status, page, size));
    }

    @GetMapping("/kanban")
    public ResponseEntity<List<JobApplicationDto>> getKanban(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(jobApplicationService.getKanban(getUser(ud)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobApplicationDto> getById(@AuthenticationPrincipal UserDetails ud, @PathVariable Long id) {
        return ResponseEntity.ok(jobApplicationService.getById(getUser(ud), id));
    }

    @PostMapping
    public ResponseEntity<JobApplicationDto> create(@AuthenticationPrincipal UserDetails ud, @Valid @RequestBody JobApplicationRequest req) {
        return ResponseEntity.ok(jobApplicationService.create(getUser(ud), req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<JobApplicationDto> update(@AuthenticationPrincipal UserDetails ud, @PathVariable Long id, @Valid @RequestBody JobApplicationRequest req) {
        return ResponseEntity.ok(jobApplicationService.update(getUser(ud), id, req));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<JobApplicationDto> updateStatus(
            @AuthenticationPrincipal UserDetails ud,
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        ApplicationStatus newStatus = ApplicationStatus.valueOf(body.get("status"));
        return ResponseEntity.ok(jobApplicationService.updateStatus(getUser(ud), id, newStatus));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(@AuthenticationPrincipal UserDetails ud, @PathVariable Long id) {
        jobApplicationService.delete(getUser(ud), id);
        return ResponseEntity.ok(Map.of("message", "Application deleted"));
    }

    private User getUser(UserDetails ud) {
        return userRepository.findByEmail(ud.getUsername()).orElseThrow();
    }
}
