package com.jobflow.ai.repository;

import com.jobflow.ai.entity.JobApplication;
import com.jobflow.ai.enums.ApplicationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {
    Page<JobApplication> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    List<JobApplication> findByUserIdAndStatusOrderByUpdatedAtDesc(Long userId, ApplicationStatus status);

    @Query("SELECT ja FROM JobApplication ja WHERE ja.user.id = :userId AND " +
           "(LOWER(ja.jobTitle) LIKE LOWER(CONCAT('%',:q,'%')) OR LOWER(ja.company.name) LIKE LOWER(CONCAT('%',:q,'%')) OR LOWER(ja.location) LIKE LOWER(CONCAT('%',:q,'%')))")
    Page<JobApplication> search(Long userId, String q, Pageable pageable);

    Optional<JobApplication> findByIdAndUserId(Long id, Long userId);

    long countByUserId(Long userId);
    long countByUserIdAndStatus(Long userId, ApplicationStatus status);

    @Query("SELECT COUNT(ja) FROM JobApplication ja WHERE ja.user.id = :userId AND ja.appliedAt >= :since")
    long countByUserIdAndAppliedAtAfter(Long userId, LocalDateTime since);

    @Query("SELECT ja FROM JobApplication ja WHERE ja.user.id = :userId AND ja.followUpAt <= :before AND ja.status NOT IN ('REJECTED', 'JOINED', 'OFFER') ORDER BY ja.followUpAt ASC")
    List<JobApplication> findFollowUpsDue(Long userId, LocalDateTime before);

    @Query("SELECT ja FROM JobApplication ja WHERE ja.user.id = :userId AND ja.interviewAt BETWEEN :from AND :to")
    List<JobApplication> findInterviewsInRange(Long userId, LocalDateTime from, LocalDateTime to);

    @Query("SELECT ja FROM JobApplication ja WHERE ja.user.id = :userId ORDER BY ja.updatedAt DESC")
    List<JobApplication> findRecentByUserId(Long userId, Pageable pageable);
}
