package com.jobflow.ai.scheduler;

import com.jobflow.ai.entity.Notification;
import com.jobflow.ai.entity.User;
import com.jobflow.ai.enums.NotificationType;
import com.jobflow.ai.repository.JobApplicationRepository;
import com.jobflow.ai.repository.NotificationRepository;
import com.jobflow.ai.repository.UserRepository;
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
public class NotificationScheduler {

    private final UserRepository userRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final NotificationRepository notificationRepository;

    @Scheduled(cron = "0 0 8 * * *") // Every day at 8 AM
    @Transactional
    public void checkInterviewsTomorrow() {
        log.info("Checking interviews scheduled for tomorrow...");
        List<User> users = userRepository.findAll();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime tomorrowStart = now.plusDays(1).withHour(0).withMinute(0);
        LocalDateTime tomorrowEnd = now.plusDays(1).withHour(23).withMinute(59);

        for (User user : users) {
            List<var> interviews = jobApplicationRepository.findInterviewsInRange(user.getId(), tomorrowStart, tomorrowEnd);
            for (var app : interviews) {
                notificationRepository.save(Notification.builder()
                        .user(user)
                        .type(NotificationType.INTERVIEW_TOMORROW)
                        .title("Interview Tomorrow!")
                        .message("You have an interview for " + app.getJobTitle() +
                                (app.getCompany() != null ? " at " + app.getCompany().getName() : "") +
                                " tomorrow at " + app.getInterviewAt().toLocalTime())
                        .relatedEntityType("JOB_APPLICATION")
                        .relatedEntityId(app.getId())
                        .build());
            }
        }
    }

    @Scheduled(cron = "0 0 9 * * *") // Every day at 9 AM
    @Transactional
    public void checkFollowUpsDue() {
        log.info("Checking follow-ups due...");
        List<User> users = userRepository.findAll();

        for (User user : users) {
            var followUps = jobApplicationRepository.findFollowUpsDue(user.getId(), LocalDateTime.now());
            for (var app : followUps) {
                notificationRepository.save(Notification.builder()
                        .user(user)
                        .type(NotificationType.FOLLOW_UP_DUE)
                        .title("Follow-up Due")
                        .message("Time to follow up on " + app.getJobTitle() +
                                (app.getCompany() != null ? " at " + app.getCompany().getName() : ""))
                        .relatedEntityType("JOB_APPLICATION")
                        .relatedEntityId(app.getId())
                        .build());
            }
        }
    }
}
