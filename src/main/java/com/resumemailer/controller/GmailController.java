package com.resumemailer.controller;

import com.resumemailer.entity.User;
import com.resumemailer.repository.UserRepository;
import com.resumemailer.service.GmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class GmailController {
    private final GmailService gmailService;
    private final UserRepository userRepository;

    @GetMapping("/api/gmail/auth-url")
    public ResponseEntity<?> authUrl(@AuthenticationPrincipal UserDetails ud) {
        User user = getUser(ud);
        return ResponseEntity.ok(Map.of("url", gmailService.getAuthUrl(user.getId().toString())));
    }

    @GetMapping("/api/gmail/callback")
    public ResponseEntity<Void> callback(@RequestParam String code, @RequestParam String state) {
        try {
            Map<String, Object> tokens = gmailService.exchangeCode(code);
            Long userId = Long.parseLong(state);
            userRepository.findById(userId).ifPresent(user -> {
                user.setGmailAccessToken((String) tokens.get("access_token"));
                user.setGmailRefreshToken((String) tokens.get("refresh_token"));
                user.setGmailConnected(true);
                userRepository.save(user);
            });
        } catch (Exception e) { /* log */ }
        return ResponseEntity.status(HttpStatus.FOUND)
                .header("Location", "http://localhost:3000/settings?gmail=connected").build();
    }

    @PostMapping("/api/gmail/disconnect")
    public ResponseEntity<?> disconnect(@AuthenticationPrincipal UserDetails ud) {
        User user = getUser(ud);
        user.setGmailAccessToken(null);
        user.setGmailRefreshToken(null);
        user.setGmailConnected(false);
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Disconnected"));
    }

    @GetMapping("/api/gmail/status")
    public ResponseEntity<?> status(@AuthenticationPrincipal UserDetails ud) {
        User user = getUser(ud);
        return ResponseEntity.ok(Map.of("connected", Boolean.TRUE.equals(user.getGmailConnected())));
    }

    private User getUser(UserDetails ud) {
        return userRepository.findByEmail(ud.getUsername()).orElseThrow();
    }
}
