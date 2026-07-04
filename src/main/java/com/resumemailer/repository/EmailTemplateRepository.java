package com.resumemailer.repository;
import com.resumemailer.entity.EmailTemplate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface EmailTemplateRepository extends JpaRepository<EmailTemplate, Long> {
    Page<EmailTemplate> findByUserId(Long userId, Pageable pageable);
    @Query("SELECT t FROM EmailTemplate t WHERE t.user.id = :userId AND (LOWER(t.name) LIKE LOWER(CONCAT('%',:q,'%')) OR LOWER(t.subject) LIKE LOWER(CONCAT('%',:q,'%')))")
    Page<EmailTemplate> search(@Param("userId") Long userId, @Param("q") String q, Pageable pageable);
    Optional<EmailTemplate> findByIdAndUserId(Long id, Long userId);
    List<EmailTemplate> findByUserIdAndIsFavoriteTrueOrderByUpdatedAtDesc(Long userId);
}
