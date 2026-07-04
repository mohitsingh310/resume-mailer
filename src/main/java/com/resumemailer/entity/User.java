package com.resumemailer.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name = "users")
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

    @Column(name = "sender_name")
    private String senderName;

    @Column(name = "reply_to")
    private String replyTo;

    private String timezone = "Asia/Kolkata";
    private String theme = "DARK";

    @Column(name = "email_signature", columnDefinition = "TEXT")
    private String emailSignature;

    @Column(name = "gmail_access_token", columnDefinition = "TEXT")
    private String gmailAccessToken;

    @Column(name = "gmail_refresh_token", columnDefinition = "TEXT")
    private String gmailRefreshToken;

    @Column(name = "gmail_connected")
    private Boolean gmailConnected = false;

    @Column(name = "gmail_email")
    private String gmailEmail;

    private Boolean active = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist protected void onCreate() { createdAt = updatedAt = LocalDateTime.now(); }
    @PreUpdate protected void onUpdate() { updatedAt = LocalDateTime.now(); }

    public String getFullName() {
        return firstName + (lastName != null ? " " + lastName : "");
    }
}
