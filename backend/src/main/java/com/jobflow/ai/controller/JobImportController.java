package com.jobflow.ai.controller;

import com.jobflow.ai.dto.request.JobApplicationRequest;
import com.jobflow.ai.dto.response.JobApplicationDto;
import com.jobflow.ai.entity.User;
import com.jobflow.ai.enums.ApplicationStatus;
import com.jobflow.ai.repository.UserRepository;
import com.jobflow.ai.service.AiService;
import com.jobflow.ai.service.JobApplicationService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/import")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Job Import (Chrome Extension)")
public class JobImportController {

    private final JobApplicationService jobApplicationService;
    private final AiService aiService;
    private final UserRepository userRepository;

    @PostMapping("/job")
    public ResponseEntity<JobApplicationDto> importJob(
            @AuthenticationPrincipal UserDetails ud,
            @RequestBody Map<String, Object> importData) {

        User user = getUser(ud);

        String jobTitle = (String) importData.getOrDefault("jobTitle", "Untitled Position");
        String companyName = (String) importData.getOrDefault("company", "");
        String location = (String) importData.getOrDefault("location", "");
        String jobDescription = (String) importData.getOrDefault("description", "");
        String jobUrl = (String) importData.getOrDefault("jobUrl", "");
        String source = (String) importData.getOrDefault("source", "CHROME_EXTENSION");

        // Build the application request
        JobApplicationRequest req = new JobApplicationRequest();
        req.setJobTitle(jobTitle);
        req.setCompanyName(companyName);
        req.setLocation(location);
        req.setJobDescription(jobDescription);
        req.setJobUrl(jobUrl);
        req.setSource(source);
        req.setStatus(ApplicationStatus.WISHLIST);

        // Try to extract skills via AI
        if (!jobDescription.isBlank()) {
            try {
                String analysis = aiService.analyzeJobDescription(user, jobDescription);
                req.setExtractedSkills(analysis);
            } catch (Exception e) {
                log.warn("AI analysis failed during import: {}", e.getMessage());
            }
        }

        JobApplicationDto created = jobApplicationService.create(user, req);
        return ResponseEntity.ok(created);
    }

    @PostMapping("/job/{id}/generate-email")
    public ResponseEntity<Map<String, String>> generateEmailForJob(
            @AuthenticationPrincipal UserDetails ud,
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        User user = getUser(ud);
        JobApplicationDto app = jobApplicationService.getById(user, id);

        String email = aiService.generateColdEmail(user,
                body.getOrDefault("recruiterName", "Hiring Manager"),
                app.getCompanyName() != null ? app.getCompanyName() : "",
                app.getJobTitle(),
                body.getOrDefault("resumeSummary", ""),
                body.getOrDefault("customInstructions", ""));

        return ResponseEntity.ok(Map.of("content", email, "applicationId", String.valueOf(id)));
    }

    private User getUser(UserDetails ud) {
        return userRepository.findByEmail(ud.getUsername()).orElseThrow();
    }
}
