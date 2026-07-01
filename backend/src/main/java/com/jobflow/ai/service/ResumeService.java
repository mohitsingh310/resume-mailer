package com.jobflow.ai.service;

import com.jobflow.ai.dto.response.ResumeDto;
import com.jobflow.ai.entity.Resume;
import com.jobflow.ai.entity.User;
import com.jobflow.ai.enums.ResumeCategory;
import com.jobflow.ai.exception.ResourceNotFoundException;
import com.jobflow.ai.repository.ResumeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ResumeService {

    private final ResumeRepository resumeRepository;

    @Value("${app.upload.dir:./uploads/resumes}")
    private String uploadDir;

    public List<ResumeDto> getAll(User user) {
        return resumeRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public ResumeDto getById(User user, Long id) {
        return toDto(findByIdAndUser(user, id));
    }

    public ResumeDto upload(User user, MultipartFile file, String name, String category, String notes) throws IOException {
        Path uploadPath = Paths.get(uploadDir, String.valueOf(user.getId()));
        Files.createDirectories(uploadPath);

        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null && originalFilename.contains(".")
                ? originalFilename.substring(originalFilename.lastIndexOf('.'))
                : ".pdf";
        String storedFileName = UUID.randomUUID() + extension;
        Path filePath = uploadPath.resolve(storedFileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // If first resume, set as default
        boolean isDefault = resumeRepository.findByUserIdAndIsDefaultTrue(user.getId()).isEmpty();

        ResumeCategory cat = null;
        if (category != null) {
            try { cat = ResumeCategory.valueOf(category); } catch (Exception ignored) {}
        }

        Resume resume = Resume.builder()
                .user(user)
                .name(name != null ? name : originalFilename)
                .fileName(originalFilename)
                .filePath(filePath.toString())
                .fileSize(file.getSize())
                .category(cat)
                .notes(notes)
                .isDefault(isDefault)
                .usageCount(0)
                .build();

        return toDto(resumeRepository.save(resume));
    }

    public ResumeDto rename(User user, Long id, String name) {
        Resume resume = findByIdAndUser(user, id);
        resume.setName(name);
        return toDto(resumeRepository.save(resume));
    }

    public ResumeDto setDefault(User user, Long id) {
        // Remove existing default
        resumeRepository.findByUserIdAndIsDefaultTrue(user.getId())
                .ifPresent(r -> { r.setIsDefault(false); resumeRepository.save(r); });

        Resume resume = findByIdAndUser(user, id);
        resume.setIsDefault(true);
        return toDto(resumeRepository.save(resume));
    }

    public ResumeDto duplicate(User user, Long id) throws IOException {
        Resume original = findByIdAndUser(user, id);
        Path originalPath = Paths.get(original.getFilePath());
        Path uploadPath = Paths.get(uploadDir, String.valueOf(user.getId()));

        String extension = original.getFileName().contains(".")
                ? original.getFileName().substring(original.getFileName().lastIndexOf('.'))
                : ".pdf";
        String newFileName = UUID.randomUUID() + extension;
        Path newPath = uploadPath.resolve(newFileName);
        Files.copy(originalPath, newPath, StandardCopyOption.REPLACE_EXISTING);

        Resume copy = Resume.builder()
                .user(user)
                .name(original.getName() + " (Copy)")
                .fileName(original.getFileName())
                .filePath(newPath.toString())
                .fileSize(original.getFileSize())
                .category(original.getCategory())
                .notes(original.getNotes())
                .isDefault(false)
                .usageCount(0)
                .build();

        return toDto(resumeRepository.save(copy));
    }

    public void delete(User user, Long id) throws IOException {
        Resume resume = findByIdAndUser(user, id);
        try {
            Files.deleteIfExists(Paths.get(resume.getFilePath()));
        } catch (IOException e) {
            log.warn("Could not delete file: {}", resume.getFilePath());
        }
        resumeRepository.delete(resume);
    }

    public Path getFilePath(User user, Long id) {
        Resume resume = findByIdAndUser(user, id);
        return Paths.get(resume.getFilePath());
    }

    private Resume findByIdAndUser(User user, Long id) {
        return resumeRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found: " + id));
    }

    public ResumeDto toDto(Resume r) {
        ResumeDto dto = new ResumeDto();
        dto.setId(r.getId());
        dto.setName(r.getName());
        dto.setFileName(r.getFileName());
        dto.setFileSize(r.getFileSize());
        dto.setCategory(r.getCategory() != null ? r.getCategory().name() : null);
        dto.setIsDefault(r.getIsDefault());
        dto.setUsageCount(r.getUsageCount());
        dto.setNotes(r.getNotes());
        dto.setCreatedAt(r.getCreatedAt());
        dto.setUpdatedAt(r.getUpdatedAt());
        return dto;
    }

    public Resume findEntityById(User user, Long id) {
        return findByIdAndUser(user, id);
    }
}
