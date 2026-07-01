package com.jobflow.ai.repository;

import com.jobflow.ai.entity.Company;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.Optional;

public interface CompanyRepository extends JpaRepository<Company, Long> {
    Page<Company> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    @Query("SELECT c FROM Company c WHERE c.user.id = :userId AND (LOWER(c.name) LIKE LOWER(CONCAT('%',:q,'%')) OR LOWER(c.industry) LIKE LOWER(CONCAT('%',:q,'%')) OR LOWER(c.location) LIKE LOWER(CONCAT('%',:q,'%')))")
    Page<Company> search(Long userId, String q, Pageable pageable);

    Optional<Company> findByIdAndUserId(Long id, Long userId);
    Optional<Company> findByUserIdAndNameIgnoreCase(Long userId, String name);
    long countByUserId(Long userId);
}
