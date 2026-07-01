package com.jobflow.ai.repository;

import com.jobflow.ai.entity.Recruiter;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface RecruiterRepository extends JpaRepository<Recruiter, Long> {
    Page<Recruiter> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    @Query("SELECT r FROM Recruiter r WHERE r.user.id = :userId AND (LOWER(r.firstName) LIKE LOWER(CONCAT('%',:q,'%')) OR LOWER(r.lastName) LIKE LOWER(CONCAT('%',:q,'%')) OR LOWER(r.email) LIKE LOWER(CONCAT('%',:q,'%')) OR LOWER(r.role) LIKE LOWER(CONCAT('%',:q,'%')))")
    Page<Recruiter> search(Long userId, String q, Pageable pageable);

    Optional<Recruiter> findByIdAndUserId(Long id, Long userId);
    List<Recruiter> findByUserIdAndEmailIgnoreCase(Long userId, String email);
    List<Recruiter> findByUserIdAndCompanyId(Long userId, Long companyId);
    long countByUserId(Long userId);
}
