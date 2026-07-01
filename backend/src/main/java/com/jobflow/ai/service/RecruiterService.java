package com.jobflow.ai.service;

import com.jobflow.ai.dto.request.RecruiterRequest;
import com.jobflow.ai.dto.response.PageResponse;
import com.jobflow.ai.dto.response.RecruiterDto;
import com.jobflow.ai.entity.Company;
import com.jobflow.ai.entity.Recruiter;
import com.jobflow.ai.entity.User;
import com.jobflow.ai.exception.ResourceNotFoundException;
import com.jobflow.ai.repository.CompanyRepository;
import com.jobflow.ai.repository.RecruiterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class RecruiterService {

    private final RecruiterRepository recruiterRepository;
    private final CompanyRepository companyRepository;

    public PageResponse<RecruiterDto> getAll(User user, String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Recruiter> recruiters = StringUtils.hasText(query)
                ? recruiterRepository.search(user.getId(), query, pageable)
                : recruiterRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), pageable);
        return PageResponse.from(recruiters.map(this::toDto));
    }

    public RecruiterDto getById(User user, Long id) {
        return toDto(findByIdAndUser(user, id));
    }

    public RecruiterDto create(User user, RecruiterRequest req) {
        // Duplicate email detection warning (still allow creation)
        if (StringUtils.hasText(req.getEmail())) {
            List<Recruiter> existing = recruiterRepository.findByUserIdAndEmailIgnoreCase(user.getId(), req.getEmail());
            if (!existing.isEmpty()) {
                // Will still create but front-end gets notified via 'duplicateWarning'
            }
        }

        Company company = null;
        if (req.getCompanyId() != null) {
            company = companyRepository.findByIdAndUserId(req.getCompanyId(), user.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Company not found"));
        }

        Recruiter recruiter = Recruiter.builder()
                .user(user)
                .company(company)
                .firstName(req.getFirstName())
                .lastName(req.getLastName())
                .email(req.getEmail())
                .phone(req.getPhone())
                .linkedinUrl(req.getLinkedinUrl())
                .role(req.getRole())
                .notes(req.getNotes())
                .currentStatus(StringUtils.hasText(req.getCurrentStatus()) ? req.getCurrentStatus() : "ACTIVE")
                .build();

        return toDto(recruiterRepository.save(recruiter));
    }

    public RecruiterDto update(User user, Long id, RecruiterRequest req) {
        Recruiter recruiter = findByIdAndUser(user, id);

        Company company = null;
        if (req.getCompanyId() != null) {
            company = companyRepository.findByIdAndUserId(req.getCompanyId(), user.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Company not found"));
        }

        recruiter.setFirstName(req.getFirstName());
        recruiter.setLastName(req.getLastName());
        recruiter.setCompany(company);
        recruiter.setEmail(req.getEmail());
        recruiter.setPhone(req.getPhone());
        recruiter.setLinkedinUrl(req.getLinkedinUrl());
        recruiter.setRole(req.getRole());
        recruiter.setNotes(req.getNotes());
        if (StringUtils.hasText(req.getCurrentStatus())) {
            recruiter.setCurrentStatus(req.getCurrentStatus());
        }

        return toDto(recruiterRepository.save(recruiter));
    }

    public void delete(User user, Long id) {
        Recruiter recruiter = findByIdAndUser(user, id);
        recruiterRepository.delete(recruiter);
    }

    public boolean checkDuplicate(User user, String email) {
        if (!StringUtils.hasText(email)) return false;
        return !recruiterRepository.findByUserIdAndEmailIgnoreCase(user.getId(), email).isEmpty();
    }

    private Recruiter findByIdAndUser(User user, Long id) {
        return recruiterRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Recruiter not found: " + id));
    }

    public RecruiterDto toDto(Recruiter r) {
        RecruiterDto dto = new RecruiterDto();
        dto.setId(r.getId());
        dto.setFirstName(r.getFirstName());
        dto.setLastName(r.getLastName());
        dto.setFullName(r.getFullName());
        dto.setEmail(r.getEmail());
        dto.setPhone(r.getPhone());
        dto.setLinkedinUrl(r.getLinkedinUrl());
        dto.setRole(r.getRole());
        dto.setNotes(r.getNotes());
        dto.setLastContactAt(r.getLastContactAt());
        dto.setLastReplyAt(r.getLastReplyAt());
        dto.setCurrentStatus(r.getCurrentStatus());
        dto.setApplicationsSent(r.getApplicationsSent());
        dto.setCreatedAt(r.getCreatedAt());
        dto.setUpdatedAt(r.getUpdatedAt());
        if (r.getCompany() != null) {
            dto.setCompanyId(r.getCompany().getId());
            dto.setCompanyName(r.getCompany().getName());
        }
        return dto;
    }
}
