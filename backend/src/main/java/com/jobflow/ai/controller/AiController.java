package com.jobflow.ai.controller;

import com.jobflow.ai.entity.User;
import com.jobflow.ai.repository.UserRepository;
import com.jobflow.ai.service.AiService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Tag(name = "AI Features")
public class AiController {

    private final AiService aiService;
    private final UserRepository userRepository;

    @PostMapping("/cold-email")
    public ResponseEntity<Map<String, String>> generateColdEmail(
            @AuthenticationPrincipal UserDetails ud,
            @RequestBody Map<String, String> body) {
        User user = getUser(ud);
        String result = aiService.generateColdEmail(user,
                body.getOrDefault("recruiterName", ""),
                body.getOrDefault("companyName", ""),
                body.getOrDefault("role", ""),
                body.getOrDefault("resumeSummary", ""),
                body.getOrDefault("customInstructions", ""));
        return ResponseEntity.ok(Map.of("content", result));
    }

    @PostMapping("/cover-letter")
    public ResponseEntity<Map<String, String>> generateCoverLetter(
            @AuthenticationPrincipal UserDetails ud,
            @RequestBody Map<String, String> body) {
        User user = getUser(ud);
        String result = aiService.generateCoverLetter(user,
                body.getOrDefault("jobTitle", ""),
                body.getOrDefault("companyName", ""),
                body.getOrDefault("jobDescription", ""),
                body.getOrDefault("resumeSummary", ""));
        return ResponseEntity.ok(Map.of("content", result));
    }

    @PostMapping("/follow-up")
    public ResponseEntity<Map<String, String>> generateFollowUp(
            @AuthenticationPrincipal UserDetails ud,
            @RequestBody Map<String, String> body) {
        User user = getUser(ud);
        String result = aiService.generateFollowUp(user,
                body.getOrDefault("recruiterName", ""),
                body.getOrDefault("companyName", ""),
                body.getOrDefault("role", ""),
                body.getOrDefault("previousEmailDate", ""));
        return ResponseEntity.ok(Map.of("content", result));
    }

    @PostMapping("/interview-questions")
    public ResponseEntity<Map<String, String>> generateInterviewQuestions(
            @AuthenticationPrincipal UserDetails ud,
            @RequestBody Map<String, String> body) {
        User user = getUser(ud);
        String result = aiService.generateInterviewQuestions(user,
                body.getOrDefault("jobTitle", ""),
                body.getOrDefault("jobDescription", ""),
                body.getOrDefault("level", "Mid"));
        return ResponseEntity.ok(Map.of("content", result));
    }

    @PostMapping("/analyze-job")
    public ResponseEntity<Map<String, String>> analyzeJob(
            @AuthenticationPrincipal UserDetails ud,
            @RequestBody Map<String, String> body) {
        User user = getUser(ud);
        String result = aiService.analyzeJobDescription(user, body.getOrDefault("jobDescription", ""));
        return ResponseEntity.ok(Map.of("content", result));
    }

    @PostMapping("/resume-match")
    public ResponseEntity<Map<String, String>> resumeMatch(
            @AuthenticationPrincipal UserDetails ud,
            @RequestBody Map<String, String> body) {
        User user = getUser(ud);
        String result = aiService.calculateResumeMatch(user,
                body.getOrDefault("jobDescription", ""),
                body.getOrDefault("resumeContent", ""));
        return ResponseEntity.ok(Map.of("content", result));
    }

    @PostMapping("/rewrite-email")
    public ResponseEntity<Map<String, String>> rewriteEmail(
            @AuthenticationPrincipal UserDetails ud,
            @RequestBody Map<String, String> body) {
        User user = getUser(ud);
        String result = aiService.rewriteEmail(user,
                body.getOrDefault("emailContent", ""),
                body.getOrDefault("instruction", "Make it more professional"));
        return ResponseEntity.ok(Map.of("content", result));
    }

    @PostMapping("/salary-negotiation")
    public ResponseEntity<Map<String, String>> salarynegotiation(
            @AuthenticationPrincipal UserDetails ud,
            @RequestBody Map<String, String> body) {
        User user = getUser(ud);
        String result = aiService.improveSalaryNegotiation(user,
                body.getOrDefault("role", ""),
                body.getOrDefault("currentOffer", ""),
                body.getOrDefault("targetSalary", ""),
                body.getOrDefault("experience", ""));
        return ResponseEntity.ok(Map.of("content", result));
    }

    private User getUser(UserDetails ud) {
        return userRepository.findByEmail(ud.getUsername()).orElseThrow();
    }
}
