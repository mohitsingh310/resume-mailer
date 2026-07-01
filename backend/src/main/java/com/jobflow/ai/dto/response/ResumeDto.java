package com.jobflow.ai.dto.response;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ResumeDto {
    private Long id;
    private String name;
    private String fileName;
    private Long fileSize;
    private String category;
    private Boolean isDefault;
    private Integer usageCount;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
