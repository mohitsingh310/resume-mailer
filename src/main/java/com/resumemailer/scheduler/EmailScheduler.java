package com.resumemailer.scheduler;

import com.resumemailer.entity.*;
import com.resumemailer.repository.*;
import com.resumemailer.service.GmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class EmailScheduler {
    private final ScheduledEmailRepository scheduledEmailRepository;
    private final SentEmailRepository sentEmailRepository;
    private final GmailService gmailService;

    @Scheduled(fixedDelay = 60000)
    @Transactional
    public void processScheduledEmails() {
        List<ScheduledEmail> due = scheduledEmailRepository.findDueEmails(LocalDateTime.now());
        if (!due.isEmpty()) log.info("Processing {} scheduled emails", due.size());

        for (ScheduledEmail s : due) {
            s.setStatus("SENDING");
            scheduledEmailRepository.save(s);
            try {
                byte[] pdfData = s.getResume() != null ? s.getResume().getFileData() : null;
                String pdfName = s.getResume() != null ? s.getResume().getOriginalFileName() : null;
                gmailService.sendEmail(s.getUser(), s.getRecruiterEmail(), s.getCc(), s.getBcc(),
                        s.getSubject(), s.getBody(), pdfName, pdfData);

                s.setStatus("SENT");
                s.setSentAt(LocalDateTime.now());

                // Save to sent history
                SentEmail sent = SentEmail.builder()
                        .user(s.getUser()).template(s.getTemplate()).resume(s.getResume())
                        .recruiterName(s.getRecruiterName()).recruiterEmail(s.getRecruiterEmail())
                        .company(s.getCompany()).role(s.getRole())
                        .subject(s.getSubject()).body(s.getBody()).cc(s.getCc()).bcc(s.getBcc())
                        .status("SENT").sentAt(LocalDateTime.now())
                        .build();
                sentEmailRepository.save(sent);
                log.info("Scheduled email sent to: {}", s.getRecruiterEmail());
            } catch (Exception e) {
                log.error("Failed scheduled email {}: {}", s.getId(), e.getMessage());
                s.setStatus("FAILED");
                s.setErrorMessage(e.getMessage());
                s.setRetryCount(s.getRetryCount() + 1);
            }
            scheduledEmailRepository.save(s);
        }
    }
}
