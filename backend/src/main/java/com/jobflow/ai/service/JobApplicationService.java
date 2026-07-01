package com.jobflow.ai.service;

import com.jobflow.ai.dto.request.JobApplicationRequest;
import com.jobflow.ai.dto.response.JobApplicationDto;
import com.jobflow.ai.dto.response.PageResponse;
import com.jobflow.ai.entity.*;
import com.jobflow.ai.enums.ApplicationStatus;
import com.jobflow.ai.enums.Priority;
import com.jobflow.ai.exception.ResourceNotFoundException;
import com.jobflow.ai.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class JobApplicationService {

    private final JobApplicationRepository jobApplicationRepository;
    private final CompanyRepository companyRepository;
    private final RecruiterRepository recruiterRepository;
    private final ResumeRepository resumeRepository;
    private final CompanyService companyService;
    private final ActivityRepository activityRepository;

    public PageResponse<JobApplicationDto> getAll(User user, String query, ApplicationStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("updatedAt").descending());
        Page<JobApplication> apps;
        if (StringUtils.hasText(query)) {
            apps = jobApplicationRepository.search(user.getId(), query, pageable);
        } else if (status != null) {
            List<JobApplication> list = jobApplicationRepository.findByUserIdAndStatusOrderByUpdatedAtDesc(user.getId(), status);
            int start = page * size;
            int end = Math.min(start + size, list.size());
            List<JobApplication> slice = start < list.size() ? list.subList(start, end) : List.of();
            return PageResponse.<JobApplicationDto>builder()
                    .content(slice.stream().map(this::toDto).collect(Collectors.toList()))
                    .page(page).size(size).totalElements(list.size())
                    .totalPages((int) Math.ceil((double) list.size() / size))
                    .last(end >= list.size()).build();
        } else {
            apps = jobApplicationRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), pageable);
        }
        return PageResponse.from(apps.map(this::toDto));
    }

    public List<JobApplicationDto> getKanban(User user) {
        Pageable p = PageRequest.of(0, 500, Sort.by("updatedAt").descending());
        return jobApplicationRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), p)
                .getContent().stream().map(this::toDto).collect(Collectors.toList());
    }

    public JobApplicationDto getById(User user, Long id) {
        return toDto(findByIdAndUser(user, id));
    }

    public JobApplicationDto create(User user, JobApplicationRequest req) {
        Company company = resolveCompany(user, req);
        Recruiter recruiter = req.getRecruiterId() != null
                ? recruiterRepository.findByIdAndUserId(req.getRecruiterId(), user.getId()).orElse(null)
                : null;
        Resume resume = req.getResumeId() != null
                ? resumeRepository.findByIdAndUserId(req.getResumeId(), user.getId()).orElse(null)
                : null;

        JobApplication app = JobApplication.builder()
                .user(user)
                .company(company)
                .recruiter(recruiter)
                .resume(resume)
                .jobTitle(req.getJobTitle())
                .jobUrl(req.getJobUrl())
                .location(req.getLocation())
                .jobType(req.getJobType())
                .workMode(req.getWorkMode())
                .status(req.getStatus() != null ? req.getStatus() : ApplicationStatus.WISHLIST)
                .priority(req.getPriority() != null ? req.getPriority() : Priority.MEDIUM)
                .salaryMin(req.getSalaryMin())
                .salaryMax(req.getSalaryMax())
                .salaryCurrency(StringUtils.hasText(req.getSalaryCurrency()) ? req.getSalaryCurrency() : "INR")
                .coverLetter(req.getCoverLetter())
                .notes(req.getNotes())
                .jobDescription(req.getJobDescription())
                .requiredSkills(req.getRequiredSkills())
                .extractedSkills(req.getExtractedSkills())
                .resumeMatchScore(req.getResumeMatchScore())
                .source(req.getSource())
                .appliedAt(req.getAppliedAt())
                .interviewAt(req.getInterviewAt())
                .offerAt(req.getOfferAt())
                .followUpAt(req.getFollowUpAt())
                .build();

        app = jobApplicationRepository.save(app);
        logActivity(user, "APPLICATION_CREATED", "New application: " + app.getJobTitle() + " at " + (company != null ? company.getName() : "Unknown"), "JOB_APPLICATION", app.getId());
        return toDto(app);
    }

    public JobApplicationDto update(User user, Long id, JobApplicationRequest req) {
        JobApplication app = findByIdAndUser(user, id);
        ApplicationStatus oldStatus = app.getStatus();

        Company company = resolveCompany(user, req);
        app.setCompany(company);

        if (req.getRecruiterId() != null) {
            app.setRecruiter(recruiterRepository.findByIdAndUserId(req.getRecruiterId(), user.getId()).orElse(null));
        }
        if (req.getResumeId() != null) {
            app.setResume(resumeRepository.findByIdAndUserId(req.getResumeId(), user.getId()).orElse(null));
        }

        app.setJobTitle(req.getJobTitle());
        app.setJobUrl(req.getJobUrl());
        app.setLocation(req.getLocation());
        app.setJobType(req.getJobType());
        app.setWorkMode(req.getWorkMode());
        if (req.getStatus() != null) app.setStatus(req.getStatus());
        if (req.getPriority() != null) app.setPriority(req.getPriority());
        app.setSalaryMin(req.getSalaryMin());
        app.setSalaryMax(req.getSalaryMax());
        if (StringUtils.hasText(req.getSalaryCurrency())) app.setSalaryCurrency(req.getSalaryCurrency());
        app.setCoverLetter(req.getCoverLetter());
        app.setNotes(req.getNotes());
        app.setJobDescription(req.getJobDescription());
        app.setRequiredSkills(req.getRequiredSkills());
        app.setExtractedSkills(req.getExtractedSkills());
        if (req.getResumeMatchScore() != null) app.setResumeMatchScore(req.getResumeMatchScore());
        if (req.getAppliedAt() != null) app.setAppliedAt(req.getAppliedAt());
        if (req.getInterviewAt() != null) app.setInterviewAt(req.getInterviewAt());
        if (req.getOfferAt() != null) app.setOfferAt(req.getOfferAt());
        if (req.getFollowUpAt() != null) app.setFollowUpAt(req.getFollowUpAt());

        if (req.getStatus() != null && req.getStatus() != oldStatus) {
            logActivity(user, "STATUS_CHANGED",
                    app.getJobTitle() + " moved from " + oldStatus + " → " + req.getStatus(),
                    "JOB_APPLICATION", app.getId());
        }

        return toDto(jobApplicationRepository.save(app));
    }

    public JobApplicationDto updateStatus(User user, Long id, ApplicationStatus newStatus) {
        JobApplication app = findByIdAndUser(user, id);
        ApplicationStatus old = app.getStatus();
        app.setStatus(newStatus);

        if (newStatus == ApplicationStatus.APPLIED && app.getAppliedAt() == null) {
            app.setAppliedAt(LocalDateTime.now());
        } else if (newStatus == ApplicationStatus.OFFER && app.getOfferAt() == null) {
            app.setOfferAt(LocalDateTime.now());
        } else if (newStatus == ApplicationStatus.REJECTED && app.getRejectedAt() == null) {
            app.setRejectedAt(LocalDateTime.now());
        }

        logActivity(user, "STATUS_CHANGED",
                app.getJobTitle() + " moved " + old + " → " + newStatus, "JOB_APPLICATION", app.getId());

        return toDto(jobApplicationRepository.save(app));
    }

    public void delete(User user, Long id) {
        JobApplication app = findByIdAndUser(user, id);
        jobApplicationRepository.delete(app);
    }

    private Company resolveCompany(User user, JobApplicationRequest req) {
        if (req.getCompanyId() != null) {
            return companyRepository.findByIdAndUserId(req.getCompanyId(), user.getId()).orElse(null);
        } else if (StringUtils.hasText(req.getCompanyName())) {
            return companyService.findOrCreate(user, req.getCompanyName());
        }
        return null;
    }

    private JobApplication findByIdAndUser(User user, Long id) {
        return jobApplicationRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Application not found: " + id));
    }

    private void logActivity(User user, String type, String description, String entityType, Long entityId) {
        activityRepository.save(Activity.builder()
                .user(user).type(type).description(description)
                .entityType(entityType).entityId(entityId).build());
    }

    public JobApplicationDto toDto(JobApplication a) {
        JobApplicationDto dto = new JobApplicationDto();
        dto.setId(a.getId());
        dto.setJobTitle(a.getJobTitle());
        dto.setJobUrl(a.getJobUrl());
        dto.setLocation(a.getLocation());
        dto.setJobType(a.getJobType());
        dto.setWorkMode(a.getWorkMode());
        dto.setStatus(a.getStatus());
        dto.setPriority(a.getPriority());
        dto.setSalaryMin(a.getSalaryMin());
        dto.setSalaryMax(a.getSalaryMax());
        dto.setSalaryCurrency(a.getSalaryCurrency());
        dto.setCoverLetter(a.getCoverLetter());
        dto.setNotes(a.getNotes());
        dto.setJobDescription(a.getJobDescription());
        dto.setRequiredSkills(a.getRequiredSkills());
        dto.setExtractedSkills(a.getExtractedSkills());
        dto.setResumeMatchScore(a.getResumeMatchScore());
        dto.setSource(a.getSource());
        dto.setAppliedAt(a.getAppliedAt());
        dto.setInterviewAt(a.getInterviewAt());
        dto.setOfferAt(a.getOfferAt());
        dto.setRejectedAt(a.getRejectedAt());
        dto.setFollowUpAt(a.getFollowUpAt());
        dto.setCreatedAt(a.getCreatedAt());
        dto.setUpdatedAt(a.getUpdatedAt());
        if (a.getCompany() != null) { dto.setCompanyId(a.getCompany().getId()); dto.setCompanyName(a.getCompany().getName()); }
        if (a.getRecruiter() != null) { dto.setRecruiterId(a.getRecruiter().getId()); dto.setRecruiterName(a.getRecruiter().getFullName()); }
        if (a.getResume() != null) { dto.setResumeId(a.getResume().getId()); dto.setResumeName(a.getResume().getName()); }
        return dto;
    }
}
