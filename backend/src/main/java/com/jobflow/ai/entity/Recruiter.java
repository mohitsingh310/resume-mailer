package com.jobflow.ai.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "recruiters")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Recruiter {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id")
    private Company company;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    private String email;
    private String phone;

    @Column(name = "linkedin_url")
    private String linkedinUrl;

    private String role;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "last_contact_at")
    private LocalDateTime lastContactAt;

    @Column(name = "last_reply_at")
    private LocalDateTime lastReplyAt;

    @Column(name = "current_status")
    private String currentStatus = "ACTIVE";

    @Column(name = "applications_sent")
    private Integer applicationsSent = 0;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() { createdAt = LocalDateTime.now(); updatedAt = LocalDateTime.now(); }

    @PreUpdate
    protected void onUpdate() { updatedAt = LocalDateTime.now(); }

    public String getFullName() {
        return firstName + (lastName != null ? " " + lastName : "");
    }
}
