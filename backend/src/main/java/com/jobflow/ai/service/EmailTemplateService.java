package com.jobflow.ai.service;

import com.jobflow.ai.dto.request.EmailTemplateRequest;
import com.jobflow.ai.dto.response.EmailTemplateDto;
import com.jobflow.ai.dto.response.PageResponse;
import com.jobflow.ai.entity.EmailTemplate;
import com.jobflow.ai.entity.User;
import com.jobflow.ai.exception.ResourceNotFoundException;
import com.jobflow.ai.repository.EmailTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class EmailTemplateService {

    private final EmailTemplateRepository emailTemplateRepository;

    public PageResponse<EmailTemplateDto> getAll(User user, String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<EmailTemplate> templates = StringUtils.hasText(query)
                ? emailTemplateRepository.search(user.getId(), query, pageable)
                : emailTemplateRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), pageable);
        return PageResponse.from(templates.map(this::toDto));
    }

    public List<EmailTemplateDto> getFavorites(User user) {
        return emailTemplateRepository.findByUserIdAndIsFavoriteTrueOrderByUsageCountDesc(user.getId())
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public EmailTemplateDto getById(User user, Long id) {
        return toDto(findByIdAndUser(user, id));
    }

    public EmailTemplateDto create(User user, EmailTemplateRequest req) {
        EmailTemplate t = EmailTemplate.builder()
                .user(user)
                .name(req.getName())
                .category(req.getCategory())
                .subject(req.getSubject())
                .body(req.getBody())
                .variables(req.getVariables())
                .isFavorite(req.getIsFavorite() != null ? req.getIsFavorite() : false)
                .build();
        return toDto(emailTemplateRepository.save(t));
    }

    public EmailTemplateDto update(User user, Long id, EmailTemplateRequest req) {
        EmailTemplate t = findByIdAndUser(user, id);
        t.setName(req.getName());
        t.setCategory(req.getCategory());
        t.setSubject(req.getSubject());
        t.setBody(req.getBody());
        t.setVariables(req.getVariables());
        if (req.getIsFavorite() != null) t.setIsFavorite(req.getIsFavorite());
        return toDto(emailTemplateRepository.save(t));
    }

    public EmailTemplateDto duplicate(User user, Long id) {
        EmailTemplate original = findByIdAndUser(user, id);
        EmailTemplate copy = EmailTemplate.builder()
                .user(user).name(original.getName() + " (Copy)")
                .category(original.getCategory()).subject(original.getSubject())
                .body(original.getBody()).variables(original.getVariables())
                .isFavorite(false).usageCount(0).build();
        return toDto(emailTemplateRepository.save(copy));
    }

    public EmailTemplateDto toggleFavorite(User user, Long id) {
        EmailTemplate t = findByIdAndUser(user, id);
        t.setIsFavorite(!t.getIsFavorite());
        return toDto(emailTemplateRepository.save(t));
    }

    public void delete(User user, Long id) {
        EmailTemplate t = findByIdAndUser(user, id);
        emailTemplateRepository.delete(t);
    }

    private EmailTemplate findByIdAndUser(User user, Long id) {
        return emailTemplateRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Template not found: " + id));
    }

    public EmailTemplateDto toDto(EmailTemplate t) {
        EmailTemplateDto dto = new EmailTemplateDto();
        dto.setId(t.getId());
        dto.setName(t.getName());
        dto.setCategory(t.getCategory());
        dto.setSubject(t.getSubject());
        dto.setBody(t.getBody());
        dto.setVariables(t.getVariables());
        dto.setIsFavorite(t.getIsFavorite());
        dto.setUsageCount(t.getUsageCount());
        dto.setCreatedAt(t.getCreatedAt());
        dto.setUpdatedAt(t.getUpdatedAt());
        return dto;
    }
}
