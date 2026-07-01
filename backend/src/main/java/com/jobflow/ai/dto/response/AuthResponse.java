package com.jobflow.ai.dto.response;

import com.jobflow.ai.enums.UserRole;
import lombok.Builder;
import lombok.Data;

@Data @Builder
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private String tokenType;
    private UserDto user;

    @Data @Builder
    public static class UserDto {
        private Long id;
        private String email;
        private String firstName;
        private String lastName;
        private String avatarUrl;
        private UserRole role;
        private Boolean gmailConnected;
        private String theme;
        private String aiProvider;
    }
}
