package com.jobflow.ai.repository;

import com.jobflow.ai.entity.CampaignRecipient;
import com.jobflow.ai.enums.RecipientStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CampaignRecipientRepository extends JpaRepository<CampaignRecipient, Long> {
    List<CampaignRecipient> findByCampaignIdOrderByCreatedAtAsc(Long campaignId);
    List<CampaignRecipient> findByCampaignIdAndStatus(Long campaignId, RecipientStatus status);
    boolean existsByCampaignIdAndEmail(Long campaignId, String email);
    long countByCampaignIdAndStatus(Long campaignId, RecipientStatus status);
}
