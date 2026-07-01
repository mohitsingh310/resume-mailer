package com.jobflow.ai.controller;

import com.jobflow.ai.entity.User;
import com.jobflow.ai.enums.ApplicationStatus;
import com.jobflow.ai.repository.*;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard")
public class DashboardController {

    private final UserRepository userRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final RecruiterRepository recruiterRepository;
    private final CompanyRepository companyRepository;
    private final ActivityRepository activityRepository;
    private final NotificationRepository notificationRepository;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats(@AuthenticationPrincipal UserDetails ud) {
        User user = getUser(ud);
        Long userId = user.getId();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime thirtyDaysAgo = now.minusDays(30);
        LocalDateTime tomorrow = now.plusDays(1);

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalApplications", jobApplicationRepository.countByUserId(userId));
        stats.put("appliedCount", jobApplicationRepository.countByUserIdAndStatus(userId, ApplicationStatus.APPLIED));
        stats.put("interviewCount", jobApplicationRepository.countByUserIdAndStatus(userId, ApplicationStatus.INTERVIEW));
        stats.put("offerCount", jobApplicationRepository.countByUserIdAndStatus(userId, ApplicationStatus.OFFER));
        stats.put("rejectedCount", jobApplicationRepository.countByUserIdAndStatus(userId, ApplicationStatus.REJECTED));
        stats.put("wishlistCount", jobApplicationRepository.countByUserIdAndStatus(userId, ApplicationStatus.WISHLIST));
        stats.put("appliedLast30Days", jobApplicationRepository.countByUserIdAndAppliedAtAfter(userId, thirtyDaysAgo));
        stats.put("totalRecruiters", recruiterRepository.countByUserId(userId));
        stats.put("totalCompanies", companyRepository.countByUserId(userId));
        stats.put("followUpsDue", jobApplicationRepository.findFollowUpsDue(userId, now).size());
        stats.put("interviewsTomorrow", jobApplicationRepository.findInterviewsInRange(userId, now, tomorrow).size());
        stats.put("unreadNotifications", notificationRepository.countByUserIdAndIsReadFalse(userId));
        stats.put("userName", user.getFirstName());

        // Response rate
        long applied = (long) stats.get("appliedCount");
        long responded = (long) stats.get("interviewCount") + (long) stats.get("offerCount");
        stats.put("responseRate", applied > 0 ? Math.round((double) responded / applied * 100) : 0);

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/recent-activity")
    public ResponseEntity<List<Map<String, Object>>> getRecentActivity(@AuthenticationPrincipal UserDetails ud) {
        User user = getUser(ud);
        Pageable pageable = PageRequest.of(0, 10);
        return ResponseEntity.ok(
                activityRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), pageable)
                        .getContent().stream()
                        .map(a -> {
                            Map<String, Object> m = new LinkedHashMap<>();
                            m.put("id", a.getId());
                            m.put("type", a.getType());
                            m.put("description", a.getDescription());
                            m.put("entityType", a.getEntityType());
                            m.put("entityId", a.getEntityId());
                            m.put("createdAt", a.getCreatedAt());
                            return m;
                        })
                        .collect(Collectors.toList())
        );
    }

    @GetMapping("/upcoming-interviews")
    public ResponseEntity<List<Map<String, Object>>> getUpcomingInterviews(@AuthenticationPrincipal UserDetails ud) {
        User user = getUser(ud);
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime sevenDaysLater = now.plusDays(7);
        return ResponseEntity.ok(
                jobApplicationRepository.findInterviewsInRange(user.getId(), now, sevenDaysLater)
                        .stream().map(a -> {
                            Map<String, Object> m = new LinkedHashMap<>();
                            m.put("id", a.getId());
                            m.put("jobTitle", a.getJobTitle());
                            m.put("companyName", a.getCompany() != null ? a.getCompany().getName() : "");
                            m.put("interviewAt", a.getInterviewAt());
                            return m;
                        }).collect(Collectors.toList())
        );
    }

    @GetMapping("/follow-ups-due")
    public ResponseEntity<List<Map<String, Object>>> getFollowUpsDue(@AuthenticationPrincipal UserDetails ud) {
        User user = getUser(ud);
        return ResponseEntity.ok(
                jobApplicationRepository.findFollowUpsDue(user.getId(), LocalDateTime.now())
                        .stream().map(a -> {
                            Map<String, Object> m = new LinkedHashMap<>();
                            m.put("id", a.getId());
                            m.put("jobTitle", a.getJobTitle());
                            m.put("companyName", a.getCompany() != null ? a.getCompany().getName() : "");
                            m.put("followUpAt", a.getFollowUpAt());
                            m.put("status", a.getStatus());
                            return m;
                        }).collect(Collectors.toList())
        );
    }

    @GetMapping("/notifications")
    public ResponseEntity<List<Map<String, Object>>> getNotifications(@AuthenticationPrincipal UserDetails ud) {
        User user = getUser(ud);
        Pageable pageable = PageRequest.of(0, 20);
        return ResponseEntity.ok(
                notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), pageable)
                        .getContent().stream().map(n -> {
                            Map<String, Object> m = new LinkedHashMap<>();
                            m.put("id", n.getId());
                            m.put("type", n.getType());
                            m.put("title", n.getTitle());
                            m.put("message", n.getMessage());
                            m.put("isRead", n.getIsRead());
                            m.put("createdAt", n.getCreatedAt());
                            return m;
                        }).collect(Collectors.toList())
        );
    }

    @PatchMapping("/notifications/read-all")
    public ResponseEntity<Map<String, String>> markAllRead(@AuthenticationPrincipal UserDetails ud) {
        User user = getUser(ud);
        notificationRepository.markAllReadByUserId(user.getId());
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }

    private User getUser(UserDetails ud) {
        return userRepository.findByEmail(ud.getUsername()).orElseThrow();
    }
}
