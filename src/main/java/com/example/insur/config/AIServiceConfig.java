package com.example.insur.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
@Slf4j
public class AIServiceConfig {

    @Value("${ai.service.url:http://localhost:8003}")
    private String aiServiceUrl;

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    public String getAiServiceUrl() {
        return aiServiceUrl;
    }
}
