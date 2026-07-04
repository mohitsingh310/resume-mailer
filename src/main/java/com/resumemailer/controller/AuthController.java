package com.resumemailer.controller;

import com.resumemailer.entity.User;
import com.resumemailer.repository.UserRepository;
import com.resumemailer.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authManager;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> req) {
        String email = req.get("email");
        if (userRepository.existsByEmail(email))
            return ResponseEntity.badRequest().body(Map.of("message", "Email already exists"));

        User user = User.builder()
                .email(email)
                .password(passwordEncoder.encode(req.get("password")))
                .firstName(req.get("firstName"))
                .lastName(req.get("lastName"))
                .senderName(req.getOrDefault("firstName", "") + " " + req.getOrDefault("lastName", ""))
                .build();
        userRepository.save(user);
        String token = jwtUtils.generateToken(email);
        return ResponseEntity.ok(Map.of("token", token, "user", userToMap(user)));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> req) {
        try {
            authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.get("email"), req.get("password"))
            );
            User user = userRepository.findByEmail(req.get("email")).orElseThrow();
            String token = jwtUtils.generateToken(user.getEmail());
            return ResponseEntity.ok(Map.of("token", token, "user", userToMap(user)));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid credentials"));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(
            @org.springframework.security.core.annotation.AuthenticationPrincipal
            org.springframework.security.core.userdetails.UserDetails ud) {
        User user = userRepository.findByEmail(ud.getUsername()).orElseThrow();
        return ResponseEntity.ok(userToMap(user));
    }

    private Map<String, Object> userToMap(User u) {
        var m = new java.util.LinkedHashMap<String, Object>();
        m.put("id", u.getId());
        m.put("email", u.getEmail());
        m.put("firstName", u.getFirstName() != null ? u.getFirstName() : "");
        m.put("lastName", u.getLastName() != null ? u.getLastName() : "");
        m.put("senderName", u.getSenderName() != null ? u.getSenderName() : "");
        m.put("gmailConnected", Boolean.TRUE.equals(u.getGmailConnected()));
        m.put("theme", u.getTheme() != null ? u.getTheme() : "DARK");
        return m;
    }
}