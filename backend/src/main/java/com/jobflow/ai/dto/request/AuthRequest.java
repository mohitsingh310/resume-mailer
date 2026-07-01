package com.jobflow.ai.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

public class AuthRequest {

    @Data
    public static class Register {
        @NotBlank @Email
        private String email;
        @NotBlank @Size(min = 6)
        private String password;
        @NotBlank
        private String firstName;
        private String lastName;
    }

    @Data
    public static class Login {
        @NotBlank @Email
        private String email;
        @NotBlank
        private String password;
    }

    @Data
    public static class RefreshToken {
        @NotBlank
        private String refreshToken;
    }

    @Data
    public static class ForgotPassword {
        @NotBlank @Email
        private String email;
    }

    @Data
    public static class ResetPassword {
        @NotBlank
        private String token;
        @NotBlank @Size(min = 6)
        private String newPassword;
    }
}
