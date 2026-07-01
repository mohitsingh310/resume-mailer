package com.jobflow.ai.service;

import com.jobflow.ai.dto.request.CompanyRequest;
import com.jobflow.ai.dto.response.CompanyDto;
import com.jobflow.ai.dto.response.PageResponse;
import com.jobflow.ai.entity.Company;
import com.jobflow.ai.entity.User;
import com.jobflow.ai.exception.ResourceNotFoundException;
import com.jobflow.ai.repository.CompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
@Transactional
public class CompanyService {

    private final CompanyRepository companyRepository;

    public PageResponse<CompanyDto> getAll(User user, String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Company> companies = StringUtils.hasText(query)
                ? companyRepository.search(user.getId(), query, pageable)
                : companyRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), pageable);
        return PageResponse.from(companies.map(this::toDto));
    }

    public CompanyDto getById(User user, Long id) {
        return toDto(findByIdAndUser(user, id));
    }

    public CompanyDto create(User user, CompanyRequest req) {
        Company company = Company.builder()
                .user(user)
                .name(req.getName())
                .website(req.getWebsite())
                .careerPage(req.getCareerPage())
                .linkedinUrl(req.getLinkedinUrl())
                .location(req.getLocation())
                .industry(req.getIndustry())
                .size(req.getSize())
                .notes(req.getNotes())
                .logoUrl(req.getLogoUrl())
                .build();
        return toDto(companyRepository.save(company));
    }

    public CompanyDto update(User user, Long id, CompanyRequest req) {
        Company company = findByIdAndUser(user, id);
        company.setName(req.getName());
        company.setWebsite(req.getWebsite());
        company.setCareerPage(req.getCareerPage());
        company.setLinkedinUrl(req.getLinkedinUrl());
        company.setLocation(req.getLocation());
        company.setIndustry(req.getIndustry());
        company.setSize(req.getSize());
        company.setNotes(req.getNotes());
        company.setLogoUrl(req.getLogoUrl());
        return toDto(companyRepository.save(company));
    }

    public void delete(User user, Long id) {
        Company company = findByIdAndUser(user, id);
        companyRepository.delete(company);
    }

    private Company findByIdAndUser(User user, Long id) {
        return companyRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Company not found: " + id));
    }

    private CompanyDto toDto(Company c) {
        CompanyDto dto = new CompanyDto();
        dto.setId(c.getId());
        dto.setName(c.getName());
        dto.setWebsite(c.getWebsite());
        dto.setCareerPage(c.getCareerPage());
        dto.setLinkedinUrl(c.getLinkedinUrl());
        dto.setLocation(c.getLocation());
        dto.setIndustry(c.getIndustry());
        dto.setSize(c.getSize());
        dto.setNotes(c.getNotes());
        dto.setLogoUrl(c.getLogoUrl());
        dto.setCreatedAt(c.getCreatedAt());
        dto.setUpdatedAt(c.getUpdatedAt());
        return dto;
    }

    public Company findOrCreate(User user, String name) {
        return companyRepository.findByUserIdAndNameIgnoreCase(user.getId(), name)
                .orElseGet(() -> companyRepository.save(
                        Company.builder().user(user).name(name).build()));
    }
}
