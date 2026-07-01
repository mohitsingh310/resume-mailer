package com.jobflow.ai.controller;

import com.jobflow.ai.dto.request.CompanyRequest;
import com.jobflow.ai.dto.response.CompanyDto;
import com.jobflow.ai.dto.response.PageResponse;
import com.jobflow.ai.entity.User;
import com.jobflow.ai.repository.UserRepository;
import com.jobflow.ai.service.CompanyService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/companies")
@RequiredArgsConstructor
@Tag(name = "Companies")
public class CompanyController {

    private final CompanyService companyService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<PageResponse<CompanyDto>> getAll(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        User user = getUser(userDetails);
        return ResponseEntity.ok(companyService.getAll(user, query, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompanyDto> getById(@AuthenticationPrincipal UserDetails userDetails, @PathVariable Long id) {
        return ResponseEntity.ok(companyService.getById(getUser(userDetails), id));
    }

    @PostMapping
    public ResponseEntity<CompanyDto> create(@AuthenticationPrincipal UserDetails userDetails, @Valid @RequestBody CompanyRequest req) {
        return ResponseEntity.ok(companyService.create(getUser(userDetails), req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CompanyDto> update(@AuthenticationPrincipal UserDetails userDetails, @PathVariable Long id, @Valid @RequestBody CompanyRequest req) {
        return ResponseEntity.ok(companyService.update(getUser(userDetails), id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(@AuthenticationPrincipal UserDetails userDetails, @PathVariable Long id) {
        companyService.delete(getUser(userDetails), id);
        return ResponseEntity.ok(Map.of("message", "Company deleted"));
    }

    private User getUser(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
    }
}
