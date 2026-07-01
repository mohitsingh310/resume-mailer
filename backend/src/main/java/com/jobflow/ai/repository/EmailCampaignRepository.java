package com.jobflow.ai.repository;

import com.jobflow.ai.entity.EmailCampaign;
import com.jobflow.ai.enums.CampaignStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface EmailCampaignRepository extends JpaRepository<EmailCampaign, Long> {
    Page<EmailCampaign> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    Optional<EmailCampaign> findByIdAndUserId(Long id, Long userId);
    List<EmailCampaign> findByUserIdAndStatus(Long userId, CampaignStatus status);
}
