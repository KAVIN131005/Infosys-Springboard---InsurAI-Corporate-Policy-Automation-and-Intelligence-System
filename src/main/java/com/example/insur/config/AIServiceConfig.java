package com.example.insur.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
@Slf4j
public class AIServiceConfig {

    @Value("${ai.service.url:http://localhost:8000}")
    private String aiServiceUrl;

    public String getAiServiceUrl() {
        return aiServiceUrl;
    }
}
