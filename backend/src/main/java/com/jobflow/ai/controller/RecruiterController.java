package com.jobflow.ai.controller;

import com.jobflow.ai.dto.request.RecruiterRequest;
import com.jobflow.ai.dto.response.PageResponse;
import com.jobflow.ai.dto.response.RecruiterDto;
import com.jobflow.ai.entity.User;
import com.jobflow.ai.repository.UserRepository;
import com.jobflow.ai.service.RecruiterService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/recruiters")
@RequiredArgsConstructor
@Tag(name = "Recruiters")
public class RecruiterController {

    private final RecruiterService recruiterService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<PageResponse<RecruiterDto>> getAll(
            @AuthenticationPrincipal UserDetails ud,
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(recruiterService.getAll(getUser(ud), query, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RecruiterDto> getById(@AuthenticationPrincipal UserDetails ud, @PathVariable Long id) {
        return ResponseEntity.ok(recruiterService.getById(getUser(ud), id));
    }

    @PostMapping
    public ResponseEntity<RecruiterDto> create(@AuthenticationPrincipal UserDetails ud, @Valid @RequestBody RecruiterRequest req) {
        User user = getUser(ud);
        boolean isDuplicate = recruiterService.checkDuplicate(user, req.getEmail());
        RecruiterDto dto = recruiterService.create(user, req);
        if (isDuplicate) {
            // Add header to warn front-end
            return ResponseEntity.ok()
                    .header("X-Duplicate-Warning", "true")
                    .body(dto);
        }
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RecruiterDto> update(@AuthenticationPrincipal UserDetails ud, @PathVariable Long id, @Valid @RequestBody RecruiterRequest req) {
        return ResponseEntity.ok(recruiterService.update(getUser(ud), id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(@AuthenticationPrincipal UserDetails ud, @PathVariable Long id) {
        recruiterService.delete(getUser(ud), id);
        return ResponseEntity.ok(Map.of("message", "Recruiter deleted"));
    }

    @GetMapping("/check-duplicate")
    public ResponseEntity<Map<String, Boolean>> checkDuplicate(@AuthenticationPrincipal UserDetails ud, @RequestParam String email) {
        boolean isDup = recruiterService.checkDuplicate(getUser(ud), email);
        return ResponseEntity.ok(Map.of("isDuplicate", isDup));
    }

    private User getUser(UserDetails ud) {
        return userRepository.findByEmail(ud.getUsername()).orElseThrow();
    }
}
