package com.jobflow.ai.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RecruiterRequest {
    @NotBlank
    private String firstName;
    private String lastName;
    private Long companyId;
    private String email;
    private String phone;
    private String linkedinUrl;
    private String role;
    private String notes;
    private String currentStatus;
}
