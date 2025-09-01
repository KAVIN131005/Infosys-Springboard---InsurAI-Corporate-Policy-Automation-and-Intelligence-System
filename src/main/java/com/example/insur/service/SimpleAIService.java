package com.example.insur.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.Map;
import java.util.HashMap;

@Service
public class SimpleAIService {
    
    private final RestTemplate restTemplate;
    
    public SimpleAIService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }
    
    public Map<String, Object> analyzeClaim(Map<String, Object> claimData) {
        Map<String, Object> result = new HashMap<>();
        result.put("fraud_score", 0.1);
        result.put("status", "low_risk");
        result.put("confidence", 0.95);
        return result;
    }
    
    public Map<String, Object> assessRisk(Map<String, Object> data) {
        Map<String, Object> result = new HashMap<>();
        result.put("risk_level", "low");
        result.put("premium_adjustment", 0.0);
        result.put("confidence", 0.9);
        return result;
    }
    
    public Map<String, Object> analyzeText(String text) {
        Map<String, Object> result = new HashMap<>();
        result.put("sentiment", "positive");
        result.put("confidence", 0.8);
        result.put("keywords", new String[]{"insurance", "claim"});
        return result;
    }
    
    public Map<String, Object> chatQuery(String query, String context) {
        Map<String, Object> result = new HashMap<>();
        result.put("response", "This is a test response for: " + query);
        result.put("confidence", 0.7);
        return result;
    }
    
    public Map<String, Object> processDocument(String documentText, String documentType) {
        Map<String, Object> result = new HashMap<>();
        result.put("extracted_data", new HashMap<>());
        result.put("confidence", 0.85);
        return result;
    }
    
    public boolean isAIServiceHealthy() {
        return true;
    }
    
    public Map<String, Object> getAIServiceStatus() {
        Map<String, Object> result = new HashMap<>();
        result.put("status", "healthy");
        result.put("uptime", "100%");
        return result;
    }
}
