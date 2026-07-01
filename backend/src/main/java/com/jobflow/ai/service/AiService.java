package com.jobflow.ai.service;

import com.jobflow.ai.entity.User;
import com.jobflow.ai.enums.AiProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiService {

    @Value("${app.ai.gemini.api-key}")
    private String defaultGeminiKey;

    @Value("${app.ai.gemini.model}")
    private String geminiModel;

    @Value("${app.ai.openai.model}")
    private String openaiModel;

    @Value("${app.ai.claude.model}")
    private String claudeModel;

    public String generateText(User user, String prompt) {
        AiProvider provider = user.getAiProvider() != null ? user.getAiProvider() : AiProvider.GEMINI;
        try {
            return switch (provider) {
                case OPENAI -> callOpenAI(getKey(user.getOpenaiApiKey(), null), prompt);
                case CLAUDE -> callClaude(getKey(user.getClaudeApiKey(), null), prompt);
                default -> callGemini(getKey(user.getGeminiApiKey(), defaultGeminiKey), prompt);
            };
        } catch (Exception e) {
            log.error("AI error ({}): {}", provider, e.getMessage());
            throw new RuntimeException("AI generation failed: " + e.getMessage());
        }
    }

    private String getKey(String userKey, String fallback) {
        return (userKey != null && !userKey.isBlank()) ? userKey : fallback;
    }

    @SuppressWarnings("unchecked")
    private String callGemini(String apiKey, String prompt) {
        if (apiKey == null || apiKey.isBlank()) throw new RuntimeException("Gemini API key not configured");

        WebClient client = WebClient.create("https://generativelanguage.googleapis.com");
        Map<String, Object> body = Map.of(
                "contents", List.of(Map.of("parts", List.of(Map.of("text", prompt))))
        );

        Map<String, Object> response = client.post()
                .uri("/v1beta/models/" + geminiModel + ":generateContent?key=" + apiKey)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        if (response == null) throw new RuntimeException("Empty response from Gemini");
        List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
        if (candidates == null || candidates.isEmpty()) throw new RuntimeException("No candidates in Gemini response");
        Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
        List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
        return (String) parts.get(0).get("text");
    }

    @SuppressWarnings("unchecked")
    private String callOpenAI(String apiKey, String prompt) {
        if (apiKey == null || apiKey.isBlank()) throw new RuntimeException("OpenAI API key not configured");

        WebClient client = WebClient.create("https://api.openai.com");
        Map<String, Object> body = Map.of(
                "model", openaiModel,
                "messages", List.of(Map.of("role", "user", "content", prompt))
        );

        Map<String, Object> response = client.post()
                .uri("/v1/chat/completions")
                .header("Authorization", "Bearer " + apiKey)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        if (response == null) throw new RuntimeException("Empty response from OpenAI");
        List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
        Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
        return (String) message.get("content");
    }

    @SuppressWarnings("unchecked")
    private String callClaude(String apiKey, String prompt) {
        if (apiKey == null || apiKey.isBlank()) throw new RuntimeException("Claude API key not configured");

        WebClient client = WebClient.create("https://api.anthropic.com");
        Map<String, Object> body = Map.of(
                "model", claudeModel,
                "max_tokens", 2048,
                "messages", List.of(Map.of("role", "user", "content", prompt))
        );

        Map<String, Object> response = client.post()
                .uri("/v1/messages")
                .header("x-api-key", apiKey)
                .header("anthropic-version", "2023-06-01")
                .bodyValue(body)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        if (response == null) throw new RuntimeException("Empty response from Claude");
        List<Map<String, Object>> content = (List<Map<String, Object>>) response.get("content");
        return (String) content.get(0).get("text");
    }

    // --- Prompt Builders ---

    public String generateColdEmail(User user, String recruiterName, String companyName,
                                     String role, String resumeSummary, String customInstructions) {
        String prompt = String.format("""
                Write a professional cold email to a recruiter for a job opportunity.
                
                Recruiter Name: %s
                Company: %s
                Role: %s
                My Background: %s
                Additional Instructions: %s
                
                Guidelines:
                - Keep it concise (150-200 words)
                - Professional but personable tone
                - Clear subject line at the top (format: Subject: ...)
                - Show genuine interest in the company
                - End with a clear call-to-action
                - Do NOT use placeholders like [Your Name] - use natural language
                
                Output only the email content with subject line.
                """, recruiterName, companyName, role, resumeSummary, customInstructions);
        return generateText(user, prompt);
    }

    public String generateCoverLetter(User user, String jobTitle, String companyName,
                                       String jobDescription, String resumeSummary) {
        String prompt = String.format("""
                Write a compelling cover letter for the following position.
                
                Job Title: %s
                Company: %s
                Job Description: %s
                My Background: %s
                
                Guidelines:
                - Professional tone
                - 3-4 paragraphs
                - Highlight relevant skills from my background
                - Show enthusiasm for the company
                - Strong opening and closing
                
                Output only the cover letter content.
                """, jobTitle, companyName, jobDescription, resumeSummary);
        return generateText(user, prompt);
    }

    public String generateFollowUp(User user, String recruiterName, String companyName,
                                    String role, String previousEmailDate) {
        String prompt = String.format("""
                Write a professional follow-up email.
                
                Recruiter: %s
                Company: %s
                Role: %s
                Previous Email Sent: %s
                
                Guidelines:
                - Brief and respectful (100-150 words)
                - Reference the previous application
                - Reaffirm interest
                - Clear subject line (format: Subject: ...)
                - Not pushy
                
                Output only the email with subject line.
                """, recruiterName, companyName, role, previousEmailDate);
        return generateText(user, prompt);
    }

    public String generateInterviewQuestions(User user, String jobTitle, String jobDescription, String level) {
        String prompt = String.format("""
                Generate 15 likely interview questions for this role.
                
                Job Title: %s
                Job Description: %s
                Level: %s
                
                Format as a numbered list with these sections:
                ## Technical Questions (7-8)
                ## Behavioral Questions (4-5)
                ## Company/Role Questions (2-3)
                
                Keep questions realistic and specific to the role.
                """, jobTitle, jobDescription, level);
        return generateText(user, prompt);
    }

    public String analyzeJobDescription(User user, String jobDescription) {
        String prompt = String.format("""
                Analyze this job description and extract key information.
                
                Job Description:
                %s
                
                Output in this exact JSON format:
                {
                  "requiredSkills": ["skill1", "skill2"],
                  "niceToHaveSkills": ["skill1"],
                  "experienceRequired": "X years",
                  "keyResponsibilities": ["resp1", "resp2"],
                  "salaryRange": "if mentioned",
                  "workMode": "Remote/Hybrid/On-site",
                  "seniorityLevel": "Junior/Mid/Senior"
                }
                """, jobDescription);
        return generateText(user, prompt);
    }

    public String calculateResumeMatch(User user, String jobDescription, String resumeContent) {
        String prompt = String.format("""
                Calculate how well this resume matches the job description.
                
                Job Description:
                %s
                
                Resume:
                %s
                
                Output in this exact JSON format:
                {
                  "score": 75,
                  "matchingSkills": ["skill1", "skill2"],
                  "missingSkills": ["skill1"],
                  "suggestions": ["suggestion1", "suggestion2"],
                  "summary": "Brief match summary"
                }
                
                Score should be 0-100.
                """, jobDescription, resumeContent);
        return generateText(user, prompt);
    }

    public String improveSalaryNegotiation(User user, String role, String currentOffer, String targetSalary, String experience) {
        String prompt = String.format("""
                Write a professional salary negotiation email.
                
                Role: %s
                Current Offer: %s
                Target Salary: %s
                My Experience: %s
                
                Guidelines:
                - Professional and confident tone
                - Justify the ask with value
                - Keep a positive tone
                - Include subject line (format: Subject: ...)
                
                Output only the email.
                """, role, currentOffer, targetSalary, experience);
        return generateText(user, prompt);
    }

    public String rewriteEmail(User user, String emailContent, String instruction) {
        String prompt = String.format("""
                Rewrite the following email with this instruction: %s
                
                Original Email:
                %s
                
                Output only the rewritten email.
                """, instruction, emailContent);
        return generateText(user, prompt);
    }
}
