package com.jobflow.ai.dto.response;

import com.jobflow.ai.enums.ApplicationStatus;
import com.jobflow.ai.enums.Priority;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class JobApplicationDto {
    private Long id;
    private Long companyId;
    private String companyName;
    private Long recruiterId;
    private String recruiterName;
    private Long resumeId;
    private String resumeName;
    private String jobTitle;
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
    private LocalDateTime rejectedAt;
    private LocalDateTime followUpAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
