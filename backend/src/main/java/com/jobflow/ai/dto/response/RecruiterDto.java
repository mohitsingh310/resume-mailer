package com.jobflow.ai.dto.response;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class RecruiterDto {
    private Long id;
    private Long companyId;
    private String companyName;
    private String firstName;
    private String lastName;
    private String fullName;
    private String email;
    private String phone;
    private String linkedinUrl;
    private String role;
    private String notes;
    private LocalDateTime lastContactAt;
    private LocalDateTime lastReplyAt;
    private String currentStatus;
    private Integer applicationsSent;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
