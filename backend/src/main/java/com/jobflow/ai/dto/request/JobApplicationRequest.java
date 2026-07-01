package com.jobflow.ai.dto.request;

import com.jobflow.ai.enums.ApplicationStatus;
import com.jobflow.ai.enums.Priority;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class JobApplicationRequest {
    @NotBlank
    private String jobTitle;
    private Long companyId;
    private String companyName; // to auto-create company
    private Long recruiterId;
    private Long resumeId;
    private String jobUrl;
    private String location;
    private String jobType;
    private String workMode;
    private ApplicationStatus status;
    private Priority priority;
    private Long salaryMin;
    private Long salaryMax;
    private String salaryCurrency;
    private String coverLetter;
    private String notes;
    private String jobDescription;
    private String requiredSkills;
    private String extractedSkills;
    private Integer resumeMatchScore;
    private String source;
    private LocalDateTime appliedAt;
    private LocalDateTime interviewAt;
    private LocalDateTime offerAt;
    private LocalDateTime followUpAt;
}
