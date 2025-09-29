package com.example.insur.service;

import com.example.insur.entity.Policy;
import com.example.insur.entity.User;
import com.example.insur.dto.PolicyApplicationRequest;
import com.example.insur.dto.ClaimSubmissionRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

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

        // Try a few common endpoint variants in order: /api/nlp/analyze, /nlp/analyze
        String[] endpoints = new String[]{"/api/nlp/analyze", "/nlp/analyze"};
        for (String ep : endpoints) {
            try {
                ResponseEntity<String> response = restTemplate.postForEntity(
                        aiServiceUrl + ep, request, String.class);
                if (response != null && response.getStatusCode().is2xxSuccessful()) {
                    return response.getBody();
                }
            } catch (Exception ex) {
                // try next endpoint
            }
        }

        // Fallback: some AI services expose a chat/query endpoint. Attempt to call it with the text as the question query param.
        try {
            String encoded = URLEncoder.encode(text, StandardCharsets.UTF_8.toString());
            String url = aiServiceUrl + "/api/chat/query?question=" + encoded;
            HttpEntity<Void> empty = new HttpEntity<>(headers);
            ResponseEntity<String> chatResp = restTemplate.postForEntity(url, empty, String.class);
            if (chatResp != null && chatResp.getStatusCode().is2xxSuccessful()) {
                String body = chatResp.getBody();
                // Try to extract a 'response' field if the chat endpoint returned JSON
                try {
                    ObjectMapper mapper = new ObjectMapper();
                    @SuppressWarnings("unchecked")
                    Map<String, Object> parsed = (Map<String, Object>) mapper.readValue(body, Map.class);
                    if (parsed.containsKey("risk_level")) {
                        return body; // Return the full JSON response
                    }
                } catch (Exception parseEx) {
                    // If JSON parsing fails, return original body
                }
                return body;
            }
        } catch (Exception e) {
            return "AI analysis failed: " + e.getMessage();
        }

        return "AI analysis failed: no reachable AI endpoint responded";
    }

    public String assessApplicationRisk(PolicyApplicationRequest applicationRequest) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        // Create user_data object as expected by Python service
        Map<String, Object> userData = new HashMap<>();
        userData.put("age", applicationRequest.getAge());
        userData.put("occupation", applicationRequest.getOccupation());
        userData.put("medicalHistory", applicationRequest.getMedicalHistory());
        userData.put("previousClaims", applicationRequest.getPreviousClaims());
        userData.put("hasExistingPolicies", applicationRequest.getHasExistingPolicies());
        userData.put("firstName", applicationRequest.getFirstName());
        userData.put("lastName", applicationRequest.getLastName());
        userData.put("email", applicationRequest.getEmail());
        if (applicationRequest.getAnnualSalary() != null) {
            userData.put("annualSalary", applicationRequest.getAnnualSalary().doubleValue());
        }
        
        // Create request body in format expected by Python service
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("user_data", userData);
        requestBody.put("policy_type", "GENERAL"); // Default policy type
        requestBody.put("coverage_amount", 50000.0); // Default coverage
        
        // Add additional info if available
        Map<String, Object> additionalInfo = new HashMap<>();
        if (applicationRequest.getPhoneNumber() != null) {
            additionalInfo.put("phoneNumber", applicationRequest.getPhoneNumber());
        }
        if (applicationRequest.getAddress() != null) {
            additionalInfo.put("address", applicationRequest.getAddress());
        }
        requestBody.put("additional_info", additionalInfo);
        
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(
                aiServiceUrl + "/api/risk/assess", request, String.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            } else {
                // Fallback to local risk assessment
                return performLocalRiskAssessment(applicationRequest);
            }
        } catch (Exception e) {
            // If AI service is not available, use local assessment
            return performLocalRiskAssessment(applicationRequest);
        }
    }
    
    private String performLocalRiskAssessment(PolicyApplicationRequest applicationRequest) {
        int riskScore = calculateBasicRiskScore(applicationRequest);
        String riskLevel;
        String approvalStatus;
        
        if (riskScore >= 70) {
            riskLevel = "HIGH_RISK";
            approvalStatus = "AUTO_APPROVED"; // High risk gets auto-approved as per requirement
        } else if (riskScore >= 40) {
            riskLevel = "MEDIUM_RISK"; 
            approvalStatus = "PENDING_REVIEW";
        } else {
            riskLevel = "LOW_RISK";
            approvalStatus = "AUTO_APPROVED";
        }
        
        // Create a JSON response similar to AI service format
        return String.format(
            "{\"risk_level\":\"%s\",\"risk_score\":%d,\"approval_status\":\"%s\",\"assessment_method\":\"local_fallback\"}",
            riskLevel, riskScore, approvalStatus
        );
    }
    
    private int calculateBasicRiskScore(PolicyApplicationRequest applicationRequest) {
        int score = 0;
        
        // Age factor (0-20 points)
        if (applicationRequest.getAge() < 25) {
            score += 15; // Young drivers/applicants are higher risk
        } else if (applicationRequest.getAge() > 65) {
            score += 10; // Elderly applicants have higher risk
        } else {
            score += 5; // Middle age is lower risk
        }
        
        // Occupation factor (0-15 points)
        String occupation = applicationRequest.getOccupation().toLowerCase();
        if (occupation.contains("driver") || occupation.contains("construction") || 
            occupation.contains("mining") || occupation.contains("pilot")) {
            score += 15; // High-risk occupations
        } else if (occupation.contains("doctor") || occupation.contains("lawyer") || 
                   occupation.contains("teacher") || occupation.contains("engineer")) {
            score += 5; // Low-risk professional occupations
        } else {
            score += 10; // Medium risk for other occupations
        }
        
        // Medical history factor (0-25 points)
        String medicalHistory = applicationRequest.getMedicalHistory().toLowerCase();
        if (medicalHistory.contains("diabetes") || medicalHistory.contains("heart") || 
            medicalHistory.contains("cancer") || medicalHistory.contains("chronic")) {
            score += 25; // Significant medical conditions
        } else if (medicalHistory.contains("minor") || medicalHistory.contains("allergies")) {
            score += 10; // Minor medical issues
        } else if (medicalHistory.contains("none") || medicalHistory.isEmpty()) {
            score += 0; // No medical issues
        } else {
            score += 15; // Unknown or other medical history
        }
        
        // Previous claims factor (0-20 points)
        try {
            int claimsCount = Integer.parseInt(applicationRequest.getPreviousClaims());
            if (claimsCount >= 3) {
                score += 20; // Multiple claims indicate high risk
            } else if (claimsCount >= 1) {
                score += 10; // Some claims
            } else {
                score += 0; // No previous claims
            }
        } catch (NumberFormatException e) {
            // If not a number, treat as text and assess accordingly
            String claims = applicationRequest.getPreviousClaims().toLowerCase();
            if (claims.contains("many") || claims.contains("multiple") || claims.contains("several")) {
                score += 20;
            } else if (claims.contains("few") || claims.contains("some") || claims.contains("1") || claims.contains("2")) {
                score += 10;
            } else if (claims.contains("none") || claims.contains("zero") || claims.contains("0")) {
                score += 0;
            } else {
                score += 15; // Unknown format
            }
        }
        
        // Existing policies factor (0-10 points)
        if (applicationRequest.getHasExistingPolicies()) {
            score -= 5; // Having existing policies can be a good sign (negative points = lower risk)
        } else {
            score += 5; // New to insurance
        }
        
        // Salary factor (0-10 points)
        if (applicationRequest.getAnnualSalary() != null) {
            if (applicationRequest.getAnnualSalary().doubleValue() < 30000) {
                score += 10; // Lower income may indicate higher risk
            } else if (applicationRequest.getAnnualSalary().doubleValue() > 100000) {
                score += 0; // Higher income typically lower risk
            } else {
                score += 5; // Middle income
            }
        } else {
            score += 8; // No salary info provided
        }
        
        // Ensure score is within 0-100 range
        return Math.max(0, Math.min(100, score));
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

    public String assessUserRisk(User user, Policy policy) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("age", user.getDateOfBirth() != null ? 
            java.time.Period.between(user.getDateOfBirth(), java.time.LocalDate.now()).getYears() : 30);
        requestBody.put("policyType", policy.getType());
        requestBody.put("coverage", policy.getCoverage());
        requestBody.put("premium", policy.getMonthlyPremium());
        requestBody.put("userCity", user.getCity());
        requestBody.put("userState", user.getState());
        
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(
                aiServiceUrl + "/risk/assess-user", request, String.class);
            return response.getBody();
        } catch (Exception e) {
            return "MEDIUM_RISK - AI user risk assessment failed: " + e.getMessage();
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