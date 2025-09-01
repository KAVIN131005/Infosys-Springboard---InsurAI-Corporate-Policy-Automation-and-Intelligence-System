package com.example.insur.service;

import com.example.insur.entity.Policy;
import com.example.insur.dto.PolicyApplicationRequest;
import com.example.insur.dto.ClaimSubmissionRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AiOrchestrationService {

    @Value("${ai.service.url}")
    private String aiServiceUrl;

    private final RestTemplate restTemplate;

    public String analyzePolicy(String text) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        Map<String, String> requestBody = new HashMap<>();
        requestBody.put("text", text);
        
        HttpEntity<Map<String, String>> request = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(
                aiServiceUrl + "/nlp/analyze", request, String.class);
            return response.getBody();
        } catch (Exception e) {
            return "AI analysis failed: " + e.getMessage();
        }
    }

    public String assessApplicationRisk(PolicyApplicationRequest applicationRequest) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("age", applicationRequest.getAge());
        requestBody.put("occupation", applicationRequest.getOccupation());
        requestBody.put("medicalHistory", applicationRequest.getMedicalHistory());
        requestBody.put("previousClaims", applicationRequest.getPreviousClaims());
        requestBody.put("hasExistingPolicies", applicationRequest.getHasExistingPolicies());
        
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(
                aiServiceUrl + "/risk/assess", request, String.class);
            return response.getBody();
        } catch (Exception e) {
            return "MEDIUM_RISK - AI assessment failed: " + e.getMessage();
        }
    }

    public String analyzeClaim(ClaimSubmissionRequest claimRequest) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("type", claimRequest.getType());
        requestBody.put("amount", claimRequest.getClaimAmount());
        requestBody.put("description", claimRequest.getIncidentDescription());
        requestBody.put("location", claimRequest.getIncidentLocation());
        requestBody.put("supportingDocuments", claimRequest.getSupportingDocuments());
        
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(
                aiServiceUrl + "/claims/analyze", request, String.class);
            return response.getBody();
        } catch (Exception e) {
            return "AI claim analysis failed: " + e.getMessage();
        }
    }

    public String extractDocumentData(String filePath) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        Map<String, String> requestBody = new HashMap<>();
        requestBody.put("file_path", filePath);
        
        HttpEntity<Map<String, String>> request = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(
                aiServiceUrl + "/document/extract", request, String.class);
            return response.getBody();
        } catch (Exception e) {
            return "Document extraction failed: " + e.getMessage();
        }
    }

    public String chatWithAI(String message, String context) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        Map<String, String> requestBody = new HashMap<>();
        requestBody.put("message", message);
        requestBody.put("context", context);
        
        HttpEntity<Map<String, String>> request = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(
                aiServiceUrl + "/chat/respond", request, String.class);
            return response.getBody();
        } catch (Exception e) {
            return "I'm sorry, I'm currently unavailable. Please try again later.";
        }
    }
}