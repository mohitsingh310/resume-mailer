package com.resumemailer;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ResumeMailerApplication {
    public static void main(String[] args) {
        SpringApplication.run(ResumeMailerApplication.class, args);
    }
}
