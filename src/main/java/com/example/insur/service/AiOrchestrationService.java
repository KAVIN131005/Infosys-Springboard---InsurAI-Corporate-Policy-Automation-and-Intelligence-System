package com.example.insur.service;

// import com.insurai.entity.Policy;
// TODO: Update the import to the correct package if Policy is needed, e.g.:
// import com.example.insur.entity.Policy;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.example.insur.entity.Policy;

@Service
@RequiredArgsConstructor
public class AiOrchestrationService {

    @Value("${ai.service.url}")
    private String aiServiceUrl;

    private final RestTemplate restTemplate;

    public String analyzePolicy(String text) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<String> request = new HttpEntity<>(text, headers);

        ResponseEntity<String> response = restTemplate.postForEntity(aiServiceUrl + "/nlp/analyze", request, String.class);
        return response.getBody();
    }

    public String analyzeClaim(String filePath, Policy policy) {
        // Simplified, call AI claims_api
        // For example
        return "Claim analyzed: Valid";
    }
}