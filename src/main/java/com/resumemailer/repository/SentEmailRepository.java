package com.resumemailer.repository;
import com.resumemailer.entity.SentEmail;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface SentEmailRepository extends JpaRepository<SentEmail, Long> {
    Page<SentEmail> findByUserIdOrderBySentAtDesc(Long userId, Pageable pageable);
    @Query("SELECT s FROM SentEmail s WHERE s.user.id = :userId AND (LOWER(s.recruiterEmail) LIKE LOWER(CONCAT('%',:q,'%')) OR LOWER(s.company) LIKE LOWER(CONCAT('%',:q,'%')) OR LOWER(s.subject) LIKE LOWER(CONCAT('%',:q,'%')))")
    Page<SentEmail> search(@Param("userId") Long userId, @Param("q") String q, Pageable pageable);
    Optional<SentEmail> findByIdAndUserId(Long id, Long userId);
}
