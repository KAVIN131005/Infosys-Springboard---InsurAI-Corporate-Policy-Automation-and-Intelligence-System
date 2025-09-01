package com.example.insur.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.core.ParameterizedTypeReference;

import java.util.*;

@Service
public class AIServiceIntegrationFixed {

    private final RestTemplate restTemplate;
    
    @Value("${ai.service.url:http://localhost:8000}")
    private String aiServiceBaseUrl;
    
    public AIServiceIntegrationFixed(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public Map<String, Object> analyzeClaim(Map<String, Object> claimData) {
        try {
            String url = aiServiceBaseUrl + "/fraud/analyze";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(claimData, headers);
            
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                request,
                new ParameterizedTypeReference<Map<String, Object>>() {}
            );
            
            if (response.getBody() != null) {
                System.out.println("Claim analysis completed successfully. Risk score: " + 
                    response.getBody().get("fraud_score"));
                return response.getBody();
            } else {
                System.out.println("Claim analysis returned empty response");
                return createErrorResponse("Empty response from AI service");
            }
        } catch (HttpClientErrorException | HttpServerErrorException e) {
            System.err.println("HTTP error during claim analysis: " + e.getStatusCode() + " - " + e.getMessage());
            return createErrorResponse("AI service error: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("Unexpected error during claim analysis: " + e.getMessage());
            return createErrorResponse("Unexpected error: " + e.getMessage());
        }
    }

    public Map<String, Object> assessRisk(Map<String, Object> data) {
        try {
            String url = aiServiceBaseUrl + "/risk/assess";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(data, headers);
            
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                request,
                new ParameterizedTypeReference<Map<String, Object>>() {}
            );
            
            if (response.getBody() != null) {
                System.out.println("Risk assessment completed successfully. Risk level: " + 
                    response.getBody().get("risk_level"));
                return response.getBody();
            } else {
                System.out.println("Risk assessment returned empty response");
                return createErrorResponse("Empty response from AI service");
            }
        } catch (HttpClientErrorException | HttpServerErrorException e) {
            System.err.println("HTTP error during risk assessment: " + e.getStatusCode() + " - " + e.getMessage());
            return createErrorResponse("AI service error: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("Unexpected error during risk assessment: " + e.getMessage());
            return createErrorResponse("Unexpected error: " + e.getMessage());
        }
    }

    public Map<String, Object> analyzeText(String text) {
        try {
            String url = aiServiceBaseUrl + "/nlp/analyze";
            
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("text", text);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                request,
                new ParameterizedTypeReference<Map<String, Object>>() {}
            );
            
            if (response.getBody() != null) {
                System.out.println("NLP analysis completed successfully. Sentiment: " + 
                    response.getBody().get("sentiment"));
                return response.getBody();
            } else {
                System.out.println("Text analysis returned empty response");
                return createErrorResponse("Empty response from AI service");
            }
        } catch (HttpClientErrorException | HttpServerErrorException e) {
            System.err.println("HTTP error during text analysis: " + e.getStatusCode() + " - " + e.getMessage());
            return createErrorResponse("AI service error: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("Unexpected error during text analysis: " + e.getMessage());
            return createErrorResponse("Unexpected error: " + e.getMessage());
        }
    }

    public Map<String, Object> chatQuery(String query, String context) {
        try {
            String url = aiServiceBaseUrl + "/chat/query";
            
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("query", query);
            requestBody.put("context", context != null ? context : "insurance");
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            System.out.println("Sending chat query to: " + url);
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                request,
                new ParameterizedTypeReference<Map<String, Object>>() {}
            );
            
            if (response.getBody() != null) {
                System.out.println("Chat query successful: " + query);
                return response.getBody();
            } else {
                System.out.println("AI service returned empty response for chat query");
                return createErrorResponse("Empty response from AI service");
            }
        } catch (HttpClientErrorException e) {
            System.err.println("HTTP error calling AI chat service: " + e.getStatusCode() + " - " + e.getResponseBodyAsString());
            return createErrorResponse("AI service error: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("Error calling AI chat service: " + e.getMessage());
            return createErrorResponse("Unexpected error: " + e.getMessage());
        }
    }

    public Map<String, Object> processDocument(String documentText, String documentType) {
        try {
            String url = aiServiceBaseUrl + "/document/process";
            
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("text", documentText);
            requestBody.put("document_type", documentType);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            System.out.println("Sending document processing request to: " + url);
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                request,
                new ParameterizedTypeReference<Map<String, Object>>() {}
            );
            
            if (response.getBody() != null) {
                System.out.println("Document processing completed successfully");
                return response.getBody();
            } else {
                System.out.println("AI service returned empty response for document processing");
                return createErrorResponse("Empty response from AI service");
            }
        } catch (HttpClientErrorException e) {
            System.err.println("HTTP error calling document processing service: " + e.getStatusCode() + " - " + e.getResponseBodyAsString());
            return createErrorResponse("AI service error: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("Error calling document processing service: " + e.getMessage());
            return createErrorResponse("Unexpected error: " + e.getMessage());
        }
    }

    public boolean isAIServiceHealthy() {
        try {
            String url = aiServiceBaseUrl + "/health";
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            return response.getStatusCode().is2xxSuccessful();
        } catch (Exception e) {
            System.err.println("Health check failed: " + e.getMessage());
            return false;
        }
    }

    public Map<String, Object> getAIServiceStatus() {
        try {
            String url = aiServiceBaseUrl + "/health";
            
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<Map<String, Object>>() {}
            );
            
            Map<String, Object> status = response.getBody();
            boolean isHealthy = isAIServiceHealthy();
            
            if (status == null) {
                status = new HashMap<>();
            }
            
            status.put("is_healthy", isHealthy);
            status.put("base_url", aiServiceBaseUrl);
            status.put("timestamp", System.currentTimeMillis());
            
            return status;
        } catch (Exception e) {
            Map<String, Object> errorStatus = new HashMap<>();
            errorStatus.put("is_healthy", false);
            errorStatus.put("error", e.getMessage());
            errorStatus.put("base_url", aiServiceBaseUrl);
            errorStatus.put("timestamp", System.currentTimeMillis());
            return errorStatus;
        }
    }

    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("error", message);
        errorResponse.put("timestamp", System.currentTimeMillis());
        errorResponse.put("service_status", "error");
        return errorResponse;
    }
}
