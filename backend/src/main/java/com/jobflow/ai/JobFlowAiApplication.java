package com.jobflow.ai;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class JobFlowAiApplication {
    public static void main(String[] args) {
        SpringApplication.run(JobFlowAiApplication.class, args);
    }
}
