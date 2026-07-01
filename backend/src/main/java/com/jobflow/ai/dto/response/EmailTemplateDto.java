package com.jobflow.ai.dto.response;

import com.jobflow.ai.enums.TemplateCategory;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class EmailTemplateDto {
    private Long id;
    private String name;
    private TemplateCategory category;
    private String subject;
    private String body;
    private String variables;
    private Boolean isFavorite;
    private Integer usageCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
