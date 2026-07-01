package com.jobflow.ai.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CompanyRequest {
    @NotBlank
    private String name;
    private String website;
    private String careerPage;
    private String linkedinUrl;
    private String location;
    private String industry;
    private String size;
    private String notes;
    private String logoUrl;
}
