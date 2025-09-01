package com.example.insur.controller;

import com.example.insur.service.AIServiceIntegrationFixed;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class AIController {

    private final AIServiceIntegrationFixed aiService;

    @PostMapping("/chat")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> chat(@RequestBody Map<String, String> request) {
        try {
            String message = request.get("message");
            String conversationId = request.get("conversation_id");
            
            if (message == null || message.trim().isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Message cannot be empty");
                errorResponse.put("status", "error");
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            // Generate conversation ID if not provided
            if (conversationId == null || conversationId.trim().isEmpty()) {
                conversationId = UUID.randomUUID().toString();
            }
            
            Map<String, Object> chatResponse = aiService.chatQuery(message, conversationId);
            chatResponse.put("conversation_id", conversationId);
            chatResponse.put("timestamp", System.currentTimeMillis());
            
            log.info("Chat response generated for conversation: {}", conversationId);
            return ResponseEntity.ok(chatResponse);
            
        } catch (Exception e) {
            log.error("Error in AI chat: {}", e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Chat service temporarily unavailable");
            errorResponse.put("message", e.getMessage());
            errorResponse.put("status", "error");
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @PostMapping("/analyze-text")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> analyzeText(@RequestBody Map<String, String> request) {
        try {
            String text = request.get("text");
            
            if (text == null || text.trim().isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Text cannot be empty");
                errorResponse.put("status", "error");
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            Map<String, Object> analysis = aiService.analyzeText(text);
            analysis.put("timestamp", System.currentTimeMillis());
            
            log.info("Text analysis completed for {} characters", text.length());
            return ResponseEntity.ok(analysis);
            
        } catch (Exception e) {
            log.error("Error in text analysis: {}", e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Text analysis service temporarily unavailable");
            errorResponse.put("message", e.getMessage());
            errorResponse.put("status", "error");
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @PostMapping("/assess-risk")
    @PreAuthorize("hasAnyRole('ADMIN', 'BROKER') or isAuthenticated()")
    public ResponseEntity<Map<String, Object>> assessRisk(@RequestBody Map<String, Object> request) {
        try {
            Integer age = request.get("age") != null ? 
                ((Number) request.get("age")).intValue() : null;
            String location = (String) request.get("location");
            String policyType = (String) request.get("policy_type");
            Double coverage = request.get("coverage") != null ? 
                ((Number) request.get("coverage")).doubleValue() : null;
            
            // Prepare data for AI service
            Map<String, Object> riskData = new HashMap<>();
            riskData.put("age", age);
            riskData.put("location", location);
            riskData.put("policy_type", policyType);
            riskData.put("coverage", coverage);
            
            Map<String, Object> riskAssessment = aiService.assessRisk(riskData);
            riskAssessment.put("timestamp", System.currentTimeMillis());
            
            log.info("Risk assessment completed for age: {}, location: {}, type: {}", age, location, policyType);
            return ResponseEntity.ok(riskAssessment);
            
        } catch (Exception e) {
            log.error("Error in risk assessment: {}", e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Risk assessment service temporarily unavailable");
            errorResponse.put("message", e.getMessage());
            errorResponse.put("status", "error");
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @PostMapping("/analyze-claim")
    @PreAuthorize("hasAnyRole('ADMIN', 'BROKER') or isAuthenticated()")
    public ResponseEntity<Map<String, Object>> analyzeClaim(@RequestBody Map<String, Object> request) {
        try {
            String description = (String) request.get("description");
            Double amount = request.get("amount") != null ? 
                ((Number) request.get("amount")).doubleValue() : null;
            String claimType = (String) request.get("claim_type");
            
            // Prepare data for AI service
            Map<String, Object> claimData = new HashMap<>();
            claimData.put("description", description);
            claimData.put("amount", amount);
            claimData.put("claim_type", claimType);
            
            Map<String, Object> claimAnalysis = aiService.analyzeClaim(claimData);
            claimAnalysis.put("timestamp", System.currentTimeMillis());
            
            log.info("Claim analysis completed for type: {}, amount: {}", claimType, amount);
            return ResponseEntity.ok(claimAnalysis);
            
        } catch (Exception e) {
            log.error("Error in claim analysis: {}", e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Claim analysis service temporarily unavailable");
            errorResponse.put("message", e.getMessage());
            errorResponse.put("status", "error");
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @PostMapping("/process-document")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> processDocument(@RequestBody Map<String, String> request) {
        try {
            String documentText = request.get("document_text");
            String documentType = request.get("document_type");
            
            if (documentText == null || documentText.trim().isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Document text cannot be empty");
                errorResponse.put("status", "error");
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            Map<String, Object> documentAnalysis = aiService.processDocument(documentText, documentType);
            documentAnalysis.put("timestamp", System.currentTimeMillis());
            
            log.info("Document processing completed for type: {}", documentType);
            return ResponseEntity.ok(documentAnalysis);
            
        } catch (Exception e) {
            log.error("Error in document processing: {}", e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Document processing service temporarily unavailable");
            errorResponse.put("message", e.getMessage());
            errorResponse.put("status", "error");
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> getAIHealth() {
        Map<String, Object> health = new HashMap<>();
        boolean isHealthy = aiService.isAIServiceHealthy();
        
        health.put("ai_service_healthy", isHealthy);
        health.put("overall_status", isHealthy ? "operational" : "degraded");
        health.put("services", Map.of(
            "chat", isHealthy ? "available" : "unavailable",
            "text_analysis", isHealthy ? "available" : "unavailable", 
            "risk_assessment", isHealthy ? "available" : "unavailable",
            "fraud_detection", isHealthy ? "available" : "unavailable",
            "document_processing", isHealthy ? "available" : "unavailable"
        ));
        health.put("timestamp", System.currentTimeMillis());
        
        return ResponseEntity.ok(health);
    }

    @GetMapping("/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getAIStatus() {
        try {
            Map<String, Object> status = aiService.getAIServiceStatus();
            
            boolean isHealthy = aiService.isAIServiceHealthy();
            status.put("overall_status", isHealthy ? "operational" : "degraded");
            status.put("ai_service_healthy", isHealthy);
            status.put("last_check", System.currentTimeMillis());
            
            // Add detailed service information
            status.put("capabilities", Map.of(
                "natural_language_processing", "enabled",
                "sentiment_analysis", "enabled",
                "fraud_detection", "enabled",
                "risk_assessment", "enabled",
                "conversational_ai", "enabled",
                "document_processing", "enabled"
            ));
            
            status.put("configuration", Map.of(
                "fallback_mode", "enabled",
                "timeout_seconds", 30,
                "retry_attempts", 3,
                "service_url", aiService.getClass().getAnnotation(org.springframework.beans.factory.annotation.Value.class) != null ? 
                    "configured" : "default"
            ));
            
            return ResponseEntity.ok(status);
        } catch (Exception e) {
            log.error("Error getting AI status: {}", e.getMessage(), e);
            Map<String, Object> errorStatus = new HashMap<>();
            errorStatus.put("overall_status", "error");
            errorStatus.put("error_message", e.getMessage());
            errorStatus.put("timestamp", System.currentTimeMillis());
            return ResponseEntity.internalServerError().body(errorStatus);
        }
    }

    @GetMapping("/capabilities")
    public ResponseEntity<Map<String, Object>> getAICapabilities() {
        Map<String, Object> capabilities = new HashMap<>();
        
        capabilities.put("available_services", Map.of(
            "chat", Map.of(
                "description", "Conversational AI for customer support",
                "endpoint", "/api/ai/chat",
                "methods", new String[]{"POST"}
            ),
            "text_analysis", Map.of(
                "description", "Natural language processing and sentiment analysis",
                "endpoint", "/api/ai/analyze-text", 
                "methods", new String[]{"POST"}
            ),
            "risk_assessment", Map.of(
                "description", "AI-powered risk scoring for insurance policies",
                "endpoint", "/api/ai/assess-risk",
                "methods", new String[]{"POST"}
            ),
            "claim_analysis", Map.of(
                "description", "Fraud detection and claim validation",
                "endpoint", "/api/ai/analyze-claim",
                "methods", new String[]{"POST"}
            ),
            "document_processing", Map.of(
                "description", "OCR and document analysis",
                "endpoint", "/api/ai/process-document",
                "methods", new String[]{"POST"}
            )
        ));
        
        capabilities.put("authentication_required", true);
        capabilities.put("rate_limiting", "enabled");
        capabilities.put("fallback_mode", "enabled");
        capabilities.put("timestamp", System.currentTimeMillis());
        
        return ResponseEntity.ok(capabilities);
    }
}
