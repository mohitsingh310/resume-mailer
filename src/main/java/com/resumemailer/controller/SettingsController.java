package com.resumemailer.controller;

import com.resumemailer.entity.User;
import com.resumemailer.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
public class SettingsController {
    private final UserRepository userRepository;
    private final ResumeRepository resumeRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping
    public ResponseEntity<?> get(@AuthenticationPrincipal UserDetails ud) {
        User user = getUser(ud);
        return ResponseEntity.ok(toMap(user));
    }

    @PutMapping
    public ResponseEntity<?> update(@AuthenticationPrincipal UserDetails ud,
                                    @RequestBody Map<String, Object> req) {
        User user = getUser(ud);
        if (req.containsKey("firstName")) user.setFirstName((String) req.get("firstName"));
        if (req.containsKey("lastName")) user.setLastName((String) req.get("lastName"));
        if (req.containsKey("senderName")) user.setSenderName((String) req.get("senderName"));
        if (req.containsKey("replyTo")) user.setReplyTo((String) req.get("replyTo"));
        if (req.containsKey("timezone")) user.setTimezone((String) req.get("timezone"));
        if (req.containsKey("theme")) user.setTheme((String) req.get("theme"));
        if (req.containsKey("emailSignature")) user.setEmailSignature((String) req.get("emailSignature"));
        userRepository.save(user);
        return ResponseEntity.ok(toMap(user));
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@AuthenticationPrincipal UserDetails ud,
                                            @RequestBody Map<String, String> req) {
        User user = getUser(ud);
        if (!passwordEncoder.matches(req.get("currentPassword"), user.getPassword()))
            return ResponseEntity.badRequest().body(Map.of("message", "Current password incorrect"));
        user.setPassword(passwordEncoder.encode(req.get("newPassword")));
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Password changed"));
    }

    private Map<String, Object> toMap(User u) {
        var m = new LinkedHashMap<String, Object>();
        m.put("id", u.getId());
        m.put("email", u.getEmail());
        m.put("firstName", u.getFirstName() != null ? u.getFirstName() : "");
        m.put("lastName", u.getLastName() != null ? u.getLastName() : "");
        m.put("senderName", u.getSenderName() != null ? u.getSenderName() : "");
        m.put("replyTo", u.getReplyTo() != null ? u.getReplyTo() : "");
        m.put("timezone", u.getTimezone() != null ? u.getTimezone() : "Asia/Kolkata");
        m.put("theme", u.getTheme() != null ? u.getTheme() : "DARK");
        m.put("emailSignature", u.getEmailSignature() != null ? u.getEmailSignature() : "");
        m.put("gmailConnected", Boolean.TRUE.equals(u.getGmailConnected()));
        m.put("gmailEmail", u.getGmailEmail() != null ? u.getGmailEmail() : "");
        return m;
    }

    private User getUser(UserDetails ud) {
        return userRepository.findByEmail(ud.getUsername()).orElseThrow();
    }
}
