package com.resumemailer.service;

import com.resumemailer.entity.User;
import com.resumemailer.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class GmailService {
    private final UserRepository userRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${app.gmail.client-id}")
    private String clientId;
    @Value("${app.gmail.client-secret}")
    private String clientSecret;

    public void sendEmail(User user, String to, String cc, String bcc,
                          String subject, String htmlBody,
                          String attachmentName, byte[] attachmentData) {
        String token = user.getGmailAccessToken();
        if (token == null) throw new RuntimeException("Gmail not connected");

        try {
            String raw = buildMimeEmail(user, to, cc, bcc, subject, htmlBody, attachmentName, attachmentData);
            String encoded = Base64.getUrlEncoder().withoutPadding().encodeToString(raw.getBytes(StandardCharsets.UTF_8));
            sendRaw(token, encoded);
        } catch (Exception e) {
            if (e.getMessage() != null && (e.getMessage().contains("401") || e.getMessage().contains("unauthorized"))) {
                String newToken = refreshToken(user);
                String raw = buildMimeEmail(user, to, cc, bcc, subject, htmlBody, attachmentName, attachmentData);
                String encoded = Base64.getUrlEncoder().withoutPadding().encodeToString(raw.getBytes(StandardCharsets.UTF_8));
                sendRaw(newToken, encoded);
            } else {
                throw e;
            }
        }
    }

    private void sendRaw(String token, String encoded) {
        var headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(token);
        var body = Map.of("raw", encoded);
        var entity = new HttpEntity<>(body, headers);
        restTemplate.postForEntity("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", entity, Map.class);
    }

    private String buildMimeEmail(User user, String to, String cc, String bcc,
                                   String subject, String htmlBody,
                                   String attachmentName, byte[] attachmentData) {
        String boundary = "boundary_" + UUID.randomUUID().toString().replace("-", "");
        String from = user.getSenderName() != null ? user.getSenderName() + " <" + user.getEmail() + ">" : user.getEmail();
        String encodedSubject = "=?UTF-8?B?" + Base64.getEncoder().encodeToString(subject.getBytes(StandardCharsets.UTF_8)) + "?=";

        StringBuilder sb = new StringBuilder();
        sb.append("MIME-Version: 1.0\r\n");
        sb.append("From: ").append(from).append("\r\n");
        sb.append("To: ").append(to).append("\r\n");
        if (cc != null && !cc.isBlank()) sb.append("CC: ").append(cc).append("\r\n");
        if (bcc != null && !bcc.isBlank()) sb.append("BCC: ").append(bcc).append("\r\n");
        if (user.getReplyTo() != null) sb.append("Reply-To: ").append(user.getReplyTo()).append("\r\n");
        sb.append("Subject: ").append(encodedSubject).append("\r\n");
        sb.append("Content-Type: multipart/mixed; boundary=\"").append(boundary).append("\"\r\n");
        sb.append("\r\n");

        // HTML body
        sb.append("--").append(boundary).append("\r\n");
        sb.append("Content-Type: text/html; charset=UTF-8\r\n");
        sb.append("Content-Transfer-Encoding: base64\r\n\r\n");

        // Add signature if present
        String fullBody = htmlBody;
        if (user.getEmailSignature() != null && !user.getEmailSignature().isBlank()) {
            fullBody = htmlBody + "<br><br>" + user.getEmailSignature();
        }
        sb.append(Base64.getMimeEncoder(76, "\r\n".getBytes()).encodeToString(fullBody.getBytes(StandardCharsets.UTF_8)));
        sb.append("\r\n");

        // PDF attachment
        if (attachmentData != null && attachmentName != null) {
            sb.append("--").append(boundary).append("\r\n");
            sb.append("Content-Type: application/pdf\r\n");
            sb.append("Content-Transfer-Encoding: base64\r\n");
            sb.append("Content-Disposition: attachment; filename=\"").append(attachmentName).append("\"\r\n\r\n");
            sb.append(Base64.getMimeEncoder(76, "\r\n".getBytes()).encodeToString(attachmentData));
            sb.append("\r\n");
        }

        sb.append("--").append(boundary).append("--\r\n");
        return sb.toString();
    }

    public String refreshToken(User user) {
        var headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        var body = new LinkedMultiValueMap<String, String>();
        body.add("refresh_token", user.getGmailRefreshToken());
        body.add("client_id", clientId);
        body.add("client_secret", clientSecret);
        body.add("grant_type", "refresh_token");
        var resp = restTemplate.postForEntity("https://oauth2.googleapis.com/token", new HttpEntity<>(body, headers), Map.class);
        String newToken = (String) resp.getBody().get("access_token");
        user.setGmailAccessToken(newToken);
        userRepository.save(user);
        return newToken;
    }

    public String getAuthUrl(String state) {
        return "https://accounts.google.com/o/oauth2/v2/auth" +
                "?client_id=" + clientId +
                "&redirect_uri=" + "https://resume-mailer-438v.onrender.com/api/gmail/callback" +
                "&response_type=code" +
                "&scope=https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/userinfo.email" +
                "&access_type=offline&prompt=consent&state=" + state;
    }

    public Map<String, Object> exchangeCode(String code) {
        var headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        var body = new LinkedMultiValueMap<String, String>();
        body.add("code", code);
        body.add("client_id", clientId);
        body.add("client_secret", clientSecret);
        body.add("redirect_uri", "https://resume-mailer-438v.onrender.com/api/gmail/callback");
        body.add("grant_type", "authorization_code");
        var resp = restTemplate.postForEntity("https://oauth2.googleapis.com/token", new HttpEntity<>(body, headers), Map.class);
        return resp.getBody();
    }
}
