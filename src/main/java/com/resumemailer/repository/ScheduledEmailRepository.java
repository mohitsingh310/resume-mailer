package com.resumemailer.repository;
import com.resumemailer.entity.ScheduledEmail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ScheduledEmailRepository extends JpaRepository<ScheduledEmail, Long> {
    List<ScheduledEmail> findByUserIdOrderByScheduledAtDesc(Long userId);
    Optional<ScheduledEmail> findByIdAndUserId(Long id, Long userId);
    @Query("SELECT s FROM ScheduledEmail s WHERE s.status = 'SCHEDULED' AND s.scheduledAt <= :now")
    List<ScheduledEmail> findDueEmails(@Param("now") LocalDateTime now);
}
