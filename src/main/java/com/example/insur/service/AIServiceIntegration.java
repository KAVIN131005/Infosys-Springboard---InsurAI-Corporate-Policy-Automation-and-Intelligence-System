package com.example.insur.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.core.ParameterizedTypeReference;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;

@Service
public class AIServiceIntegration {

    private static final Logger log = LoggerFactory.getLogger(AIServiceIntegration.class);
    
    private final RestTemplate restTemplate;
    
    @Value("${ai.service.url:http://localhost:8000}")
    private String aiServiceBaseUrl;
    
    public AIServiceIntegration(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Analyze claim using AI service
     */
    public Map<String, Object> analyzeClaim(Map<String, Object> claimData) {
        try {
            String url = aiServiceBaseUrl + "/api/claims/analyze";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(claimData, headers);
            
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                url, HttpMethod.POST, entity,
                new ParameterizedTypeReference<Map<String, Object>>() {}
            );
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> result = response.getBody();
                log.info("Claim analysis completed successfully. Risk score: {}", 
                    result.getOrDefault("risk_score", "N/A"));
                return result;
            } else {
                log.warn("Claim analysis returned empty response");
                return createFallbackClaimAnalysis();
            }
        } catch (HttpClientErrorException | HttpServerErrorException e) {
            log.error("HTTP error during claim analysis: {} - {}", e.getStatusCode(), e.getMessage());
            return createFallbackClaimAnalysis();
        } catch (Exception e) {
            log.error("Unexpected error during claim analysis", e);
            return createFallbackClaimAnalysis();
        }
    }

    /**
     * Assess risk using AI service
     */
    public Map<String, Object> assessRisk(Map<String, Object> data) {
        try {
            String url = aiServiceBaseUrl + "/api/risk/assess";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(data, headers);
            
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                url, HttpMethod.POST, entity,
                new ParameterizedTypeReference<Map<String, Object>>() {}
            );
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> result = response.getBody();
                log.info("Risk assessment completed successfully. Risk level: {}", 
                    result.getOrDefault("risk_level", "N/A"));
                return result;
            } else {
                log.warn("Risk assessment returned empty response");
                return createFallbackRiskAssessment();
            }
        } catch (HttpClientErrorException | HttpServerErrorException e) {
            log.error("HTTP error during risk assessment: {} - {}", e.getStatusCode(), e.getMessage());
            return createFallbackRiskAssessment();
        } catch (Exception e) {
            log.error("Unexpected error during risk assessment", e);
            return createFallbackRiskAssessment();
        }
    }

    /**
     * Analyze text using NLP service
     */
    public Map<String, Object> analyzeText(String text) {
        try {
            String url = aiServiceBaseUrl + "/analyze-text";
            
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("text", text);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                url, HttpMethod.POST, entity,
                new ParameterizedTypeReference<Map<String, Object>>() {}
            );
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> result = response.getBody();
                log.info("NLP analysis completed successfully. Sentiment: {}", 
                    result.getOrDefault("sentiment", "N/A"));
                return result;
            } else {
                log.warn("Text analysis returned empty response");
                return createFallbackTextAnalysis();
            }
        } catch (HttpClientErrorException | HttpServerErrorException e) {
            log.error("HTTP error during text analysis: {} - {}", e.getStatusCode(), e.getMessage());
            return createFallbackTextAnalysis();
        } catch (Exception e) {
            log.error("Unexpected error during text analysis", e);
            return createFallbackTextAnalysis();
        }
    }

    /**
     * Chat with AI assistant
     */
    public Map<String, Object> chatQuery(String query, String context) {
        try {
            String url = aiServiceBaseUrl + "/api/chat/query";
            
            Map<String, Object> request = new HashMap<>();
            request.put("query", query != null ? query : "");
            request.put("context", context != null ? context : "");
            request.put("timestamp", System.currentTimeMillis());
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);
            
            log.info("Sending chat query to: {}", url);
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                url, HttpMethod.POST, entity,
                new ParameterizedTypeReference<Map<String, Object>>() {}
            );
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> result = response.getBody();
                System.out.println("Chat query successful: " + query);
                return result;
            } else {
                log.warn("AI service returned empty response for chat query");
                return createDefaultChatResponse();
            }
        } catch (HttpClientErrorException | HttpServerErrorException e) {
            log.error("HTTP error calling AI chat service: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
            return createDefaultChatResponse();
        } catch (Exception e) {
            log.error("Error calling AI chat service: {}", e.getMessage(), e);
            return createDefaultChatResponse();
        }
    }

    /**
     * Process document using OCR and analysis
     */
    public Map<String, Object> processDocument(String documentText, String documentType) {
        try {
            String url = aiServiceBaseUrl + "/api/document/extract";
            
            Map<String, Object> request = new HashMap<>();
            request.put("document_text", documentText != null ? documentText : "");
            request.put("document_type", documentType != null ? documentType : "general");
            request.put("timestamp", System.currentTimeMillis());
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);
            
            log.info("Sending document processing request to: {}", url);
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                url, HttpMethod.POST, entity,
                new ParameterizedTypeReference<Map<String, Object>>() {}
            );
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> result = response.getBody();
                log.info("Document processing completed successfully");
                return result;
            } else {
                log.warn("AI service returned empty response for document processing");
                return createDefaultDocumentAnalysis();
            }
        } catch (HttpClientErrorException | HttpServerErrorException e) {
            log.error("HTTP error calling document processing service: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
            return createDefaultDocumentAnalysis();
        } catch (Exception e) {
            log.error("Error calling document processing service: {}", e.getMessage(), e);
            return createDefaultDocumentAnalysis();
        }
    }

    /**
     * Check AI service health
     */
    public Map<String, Object> checkAIServiceHealth() {
        try {
            String url = aiServiceBaseUrl + "/health";
            log.info("Checking AI service health at: {}", url);
            
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                url, HttpMethod.GET, null,
                new ParameterizedTypeReference<Map<String, Object>>() {}
            );
            
            if (response.getStatusCode() == HttpStatus.OK) {
                Map<String, Object> result = response.getBody();
                log.info("AI service health check successful");
                return result != null ? result : createDefaultHealthResponse();
            } else {
                log.warn("AI service health check failed with status: {}", response.getStatusCode());
                return createDefaultHealthResponse();
            }
        } catch (Exception e) {
            log.error("Error checking AI service health: {}", e.getMessage());
            return createDefaultHealthResponse();
        }
    }

    /**
     * Get AI service status with enhanced connection checking
     */
    public Map<String, Object> getServiceStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("service_url", aiServiceBaseUrl);
        status.put("timestamp", System.currentTimeMillis());
        
        try {
            String url = aiServiceBaseUrl + "/health";
            
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                url, HttpMethod.GET, null,
                new ParameterizedTypeReference<Map<String, Object>>() {}
            );
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> healthData = response.getBody();
                status.putAll(healthData);
                status.put("connection_status", "connected");
            } else {
                status.put("connection_status", "disconnected");
                status.put("error", "Empty response from health endpoint");
            }
        } catch (Exception e) {
            log.error("Error getting service status: {}", e.getMessage());
            status.put("connection_status", "error");
            status.put("error", e.getMessage());
        }
        
        return status;
    }

    /**
     * Check if AI service is healthy
     */
    public boolean isAIServiceHealthy() {
        try {
            Map<String, Object> health = checkAIServiceHealth();
            String status = (String) health.getOrDefault("status", "unavailable");
            return !"unavailable".equals(status) && !"error".equals(status);
        } catch (Exception e) {
            log.error("Error checking AI service health: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Get AI service status
     */
    public Map<String, Object> getAIServiceStatus() {
        return getServiceStatus();
    }

    // Fallback methods for error scenarios
    private Map<String, Object> createFallbackClaimAnalysis() {
        Map<String, Object> result = new HashMap<>();
        result.put("risk_score", 0.5);
        result.put("fraud_probability", 0.1);
        result.put("status", "processed_offline");
        result.put("indicators", Arrays.asList("Standard processing recommended"));
        result.put("confidence", 0.3);
        result.put("timestamp", System.currentTimeMillis());
        return result;
    }

    private Map<String, Object> createFallbackRiskAssessment() {
        Map<String, Object> result = new HashMap<>();
        result.put("risk_level", "medium");
        result.put("risk_score", 0.5);
        result.put("factors", Arrays.asList("Standard risk factors"));
        result.put("recommendations", Arrays.asList("Standard underwriting"));
        result.put("confidence", 0.3);
        result.put("timestamp", System.currentTimeMillis());
        return result;
    }

    private Map<String, Object> createFallbackTextAnalysis() {
        Map<String, Object> result = new HashMap<>();
        result.put("sentiment", "neutral");
        result.put("confidence", 0.5);
        result.put("entities", Arrays.asList());
        result.put("keywords", Arrays.asList());
        result.put("summary", "Text analysis unavailable");
        result.put("timestamp", System.currentTimeMillis());
        return result;
    }

    private Map<String, Object> createDefaultChatResponse() {
        Map<String, Object> result = new HashMap<>();
        result.put("response", "I apologize, but the AI service is currently unavailable. Please try again later.");
        result.put("confidence", 0.0);
        result.put("status", "service_unavailable");
        result.put("suggestions", Arrays.asList("Check service status", "Contact support"));
        result.put("timestamp", System.currentTimeMillis());
        return result;
    }

    private Map<String, Object> createDefaultDocumentAnalysis() {
        Map<String, Object> result = new HashMap<>();
        result.put("extracted_text", "");
        result.put("entities", Arrays.asList());
        result.put("confidence", 0.0);
        result.put("status", "processing_failed");
        result.put("error", "Document processing service unavailable");
        result.put("timestamp", System.currentTimeMillis());
        return result;
    }

    private Map<String, Object> createDefaultHealthResponse() {
        Map<String, Object> result = new HashMap<>();
        result.put("status", "unavailable");
        result.put("timestamp", System.currentTimeMillis());
        result.put("services", Arrays.asList("AI services offline"));
        result.put("connection_status", "disconnected");
        return result;
    }
}
