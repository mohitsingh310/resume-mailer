package com.jobflow.ai.dto.response;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CompanyDto {
    private Long id;
    private String name;
    private String website;
    private String careerPage;
    private String linkedinUrl;
    private String location;
    private String industry;
    private String size;
    private String notes;
    private String logoUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
