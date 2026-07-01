package com.jobflow.ai.controller;

import com.jobflow.ai.entity.User;
import com.jobflow.ai.enums.AiProvider;
import com.jobflow.ai.repository.UserRepository;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
@Tag(name = "Settings")
public class UserSettingsController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getSettings(@AuthenticationPrincipal UserDetails ud) {
        User user = getUser(ud);
        return ResponseEntity.ok(Map.of(
                "email", user.getEmail(),
                "firstName", user.getFirstName(),
                "lastName", user.getLastName() != null ? user.getLastName() : "",
                "avatarUrl", user.getAvatarUrl() != null ? user.getAvatarUrl() : "",
                "emailSignature", user.getEmailSignature() != null ? user.getEmailSignature() : "",
                "preferredRoles", user.getPreferredRoles() != null ? user.getPreferredRoles() : "",
                "preferredLocations", user.getPreferredLocations() != null ? user.getPreferredLocations() : "",
                "preferredSalary", user.getPreferredSalary() != null ? user.getPreferredSalary() : "",
                "aiProvider", user.getAiProvider() != null ? user.getAiProvider().name() : "GEMINI",
                "hasGeminiKey", user.getGeminiApiKey() != null && !user.getGeminiApiKey().isBlank(),
                "hasOpenaiKey", user.getOpenaiApiKey() != null && !user.getOpenaiApiKey().isBlank(),
                "hasClaudeKey", user.getClaudeApiKey() != null && !user.getClaudeApiKey().isBlank(),
                "theme", user.getTheme() != null ? user.getTheme() : "DARK",
                "gmailConnected", user.getGmailConnected()
        ));
    }

    @PutMapping("/profile")
    public ResponseEntity<Map<String, String>> updateProfile(
            @AuthenticationPrincipal UserDetails ud,
            @RequestBody Map<String, String> body) {
        User user = getUser(ud);
        if (body.containsKey("firstName") && !body.get("firstName").isBlank())
            user.setFirstName(body.get("firstName"));
        if (body.containsKey("lastName")) user.setLastName(body.get("lastName"));
        if (body.containsKey("avatarUrl")) user.setAvatarUrl(body.get("avatarUrl"));
        if (body.containsKey("emailSignature")) user.setEmailSignature(body.get("emailSignature"));
        if (body.containsKey("preferredRoles")) user.setPreferredRoles(body.get("preferredRoles"));
        if (body.containsKey("preferredLocations")) user.setPreferredLocations(body.get("preferredLocations"));
        if (body.containsKey("preferredSalary")) user.setPreferredSalary(body.get("preferredSalary"));
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Profile updated"));
    }

    @PutMapping("/theme")
    public ResponseEntity<Map<String, String>> updateTheme(
            @AuthenticationPrincipal UserDetails ud,
            @RequestBody Map<String, String> body) {
        User user = getUser(ud);
        String theme = body.get("theme");
        if (theme != null && (theme.equals("DARK") || theme.equals("LIGHT"))) {
            user.setTheme(theme);
            userRepository.save(user);
        }
        return ResponseEntity.ok(Map.of("message", "Theme updated"));
    }

    @PutMapping("/ai")
    public ResponseEntity<Map<String, String>> updateAiSettings(
            @AuthenticationPrincipal UserDetails ud,
            @RequestBody Map<String, String> body) {
        User user = getUser(ud);
        if (body.containsKey("aiProvider")) {
            try { user.setAiProvider(AiProvider.valueOf(body.get("aiProvider"))); } catch (Exception ignored) {}
        }
        if (body.containsKey("geminiApiKey")) user.setGeminiApiKey(body.get("geminiApiKey"));
        if (body.containsKey("openaiApiKey")) user.setOpenaiApiKey(body.get("openaiApiKey"));
        if (body.containsKey("claudeApiKey")) user.setClaudeApiKey(body.get("claudeApiKey"));
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "AI settings updated"));
    }

    @PutMapping("/password")
    public ResponseEntity<Map<String, String>> changePassword(
            @AuthenticationPrincipal UserDetails ud,
            @RequestBody Map<String, String> body) {
        User user = getUser(ud);
        String current = body.get("currentPassword");
        String newPass = body.get("newPassword");

        if (user.getPassword() != null && !passwordEncoder.matches(current, user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }

        if (newPass == null || newPass.length() < 6) {
            throw new IllegalArgumentException("New password must be at least 6 characters");
        }

        user.setPassword(passwordEncoder.encode(newPass));
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }

    private User getUser(UserDetails ud) {
        return userRepository.findByEmail(ud.getUsername()).orElseThrow();
    }
}
