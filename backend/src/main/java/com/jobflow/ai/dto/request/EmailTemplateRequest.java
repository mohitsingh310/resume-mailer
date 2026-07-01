package com.jobflow.ai.dto.request;

import com.jobflow.ai.enums.TemplateCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class EmailTemplateRequest {
    @NotBlank
    private String name;
    @NotNull
    private TemplateCategory category;
    private String subject;
    @NotBlank
    private String body;
    private String variables;
    private Boolean isFavorite;
}
