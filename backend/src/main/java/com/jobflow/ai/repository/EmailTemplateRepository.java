package com.jobflow.ai.repository;

import com.jobflow.ai.entity.EmailTemplate;
import com.jobflow.ai.enums.TemplateCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface EmailTemplateRepository extends JpaRepository<EmailTemplate, Long> {
    Page<EmailTemplate> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    List<EmailTemplate> findByUserIdAndCategoryOrderByUsageCountDesc(Long userId, TemplateCategory category);
    List<EmailTemplate> findByUserIdAndIsFavoriteTrueOrderByUsageCountDesc(Long userId);
    Optional<EmailTemplate> findByIdAndUserId(Long id, Long userId);

    @Query("SELECT t FROM EmailTemplate t WHERE t.user.id = :userId AND (LOWER(t.name) LIKE LOWER(CONCAT('%',:q,'%')) OR LOWER(t.subject) LIKE LOWER(CONCAT('%',:q,'%')))")
    Page<EmailTemplate> search(Long userId, String q, Pageable pageable);
}
