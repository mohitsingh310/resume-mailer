package com.jobflow.ai.entity;

import com.jobflow.ai.enums.AiProvider;
import com.jobflow.ai.enums.UserRole;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.data.annotation.CreatedDate;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    private String password;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role = UserRole.USER;

    @Column(name = "google_id")
    private String googleId;

    @Column(name = "google_access_token", columnDefinition = "TEXT")
    private String googleAccessToken;

    @Column(name = "google_refresh_token", columnDefinition = "TEXT")
    private String googleRefreshToken;

    @Column(name = "gmail_connected")
    private Boolean gmailConnected = false;

    @Column(name = "email_signature", columnDefinition = "TEXT")
    private String emailSignature;

    @Column(name = "preferred_roles")
    private String preferredRoles;

    @Column(name = "preferred_locations")
    private String preferredLocations;

    @Column(name = "preferred_salary")
    private String preferredSalary;

    @Enumerated(EnumType.STRING)
    @Column(name = "ai_provider")
    private AiProvider aiProvider = AiProvider.GEMINI;

    @Column(name = "gemini_api_key")
    private String geminiApiKey;

    @Column(name = "openai_api_key")
    private String openaiApiKey;

    @Column(name = "claude_api_key")
    private String claudeApiKey;

    @Column(name = "theme")
    private String theme = "DARK";

    @Column(name = "active")
    private Boolean active = true;

    @Column(name = "email_verified")
    private Boolean emailVerified = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public String getFullName() {
        return firstName + (lastName != null ? " " + lastName : "");
    }
}
