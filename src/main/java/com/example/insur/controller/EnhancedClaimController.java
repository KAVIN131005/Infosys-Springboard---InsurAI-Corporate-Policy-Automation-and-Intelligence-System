package com.example.insur.controller;

import com.example.insur.dto.ClaimDto;
import com.example.insur.service.ClaimService;

// Ensure AIServiceIntegration exists and is imported correctly
import com.example.insur.service.AIServiceIntegration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/enhanced-claims")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class EnhancedClaimController {

    private static final Logger log = LoggerFactory.getLogger(EnhancedClaimController.class);
    
    private final ClaimService claimService;
    private final AIServiceIntegration aiService;

    public EnhancedClaimController(ClaimService claimService, AIServiceIntegration aiService) {
        this.claimService = claimService;
        this.aiService = aiService;
    }

    @PostMapping("/submit")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> submitClaim(
            @RequestParam("file") MultipartFile file, 
            @RequestParam("policyId") Long policyId,
            @RequestParam("description") String description,
            @RequestParam("amount") Double amount) {
        
        try {
            // Submit the claim first
            ClaimDto claim = claimService.submitClaim(file, policyId);
            
            // AI fraud analysis
            Map<String, Object> claimData = new HashMap<>();
            claimData.put("description", description);
            claimData.put("amount", amount);
            claimData.put("claim_type", "auto");
            
            Map<String, Object> fraudAnalysis = aiService.analyzeClaim(claimData);
            
            // Analyze description sentiment
            Map<String, Object> textAnalysis = aiService.analyzeText(description);
            
            Map<String, Object> response = new HashMap<>();
            response.put("claim", claim);
            response.put("fraud_analysis", fraudAnalysis);
            response.put("text_analysis", textAnalysis);
            response.put("ai_recommendations", generateRecommendations(fraudAnalysis, textAnalysis));
            response.put("timestamp", System.currentTimeMillis());
            response.put("status", "success");
            
            log.info("Claim submitted with AI analysis - Claim ID: {}, Fraud Score: {}", 
                    claim.getId(), fraudAnalysis.get("fraud_score"));
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error submitting claim with AI analysis: {}", e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to process claim");
            errorResponse.put("message", e.getMessage());
            errorResponse.put("status", "error");
            errorResponse.put("timestamp", System.currentTimeMillis());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @PostMapping("/submit-with-ai")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> submitClaimWithAI(@RequestBody Map<String, Object> request) {
        try {
            String description = (String) request.get("description");
            Double amount = request.get("amount") != null ? 
                ((Number) request.get("amount")).doubleValue() : 0.0;
            Long policyId = request.get("policyId") != null ? 
                ((Number) request.get("policyId")).longValue() : null;
            String claimType = (String) request.get("claimType");
            
            if (policyId == null) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Policy ID is required");
                errorResponse.put("status", "error");
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            // Analyze the claim with AI first
            Map<String, Object> claimData = new HashMap<>();
            claimData.put("description", description);
            claimData.put("amount", amount);
            claimData.put("claim_type", claimType);
            
            Map<String, Object> fraudAnalysis = aiService.analyzeClaim(claimData);
            Map<String, Object> textAnalysis = aiService.analyzeText(description);
            Map<String, Object> recommendations = generateRecommendations(fraudAnalysis, textAnalysis);
            
            Map<String, Object> response = new HashMap<>();
            response.put("fraud_analysis", fraudAnalysis);
            response.put("text_analysis", textAnalysis);
            response.put("ai_recommendations", recommendations);
            response.put("timestamp", System.currentTimeMillis());
            response.put("status", "analysis_complete");
            
            // Add processing recommendation
            Double fraudScore = (Double) fraudAnalysis.get("fraud_score");
            if (fraudScore != null && fraudScore > 0.7) {
                response.put("processing_status", "requires_manual_review");
                response.put("auto_approval", false);
            } else {
                response.put("processing_status", "can_proceed");
                response.put("auto_approval", fraudScore != null && fraudScore < 0.3);
            }
            
            log.info("Claim analysis completed - Fraud Score: {}, Processing: {}", 
                    fraudScore, response.get("processing_status"));
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error analyzing claim: {}", e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to analyze claim");
            errorResponse.put("message", e.getMessage());
            errorResponse.put("status", "error");
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ClaimDto>> getClaims() {
        try {
            List<ClaimDto> claims = claimService.getClaimsForUser();
            return ResponseEntity.ok(claims);
        } catch (Exception e) {
            log.error("Error fetching claims: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ClaimDto> getClaimById(@PathVariable Long id) {
        try {
            ClaimDto claim = claimService.getClaimById(id);
            return ResponseEntity.ok(claim);
        } catch (Exception e) {
            log.error("Error fetching claim {}: {}", id, e.getMessage(), e);
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/analyze")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> reanalyzeClaim(@PathVariable Long id) {
        try {
            ClaimDto claim = claimService.getClaimById(id);
            
            // Re-analyze the claim
            Map<String, Object> claimData = new HashMap<>();
            claimData.put("description", claim.getIncidentDescription());
            claimData.put("amount", claim.getClaimAmount() != null ? claim.getClaimAmount().doubleValue() : 0.0);
            claimData.put("claim_type", claim.getType());
            
            Map<String, Object> fraudAnalysis = aiService.analyzeClaim(claimData);
            
            Map<String, Object> textAnalysis = aiService.analyzeText(claim.getIncidentDescription());
            
            Map<String, Object> response = new HashMap<>();
            response.put("claim_id", id);
            response.put("fraud_analysis", fraudAnalysis);
            response.put("text_analysis", textAnalysis);
            response.put("ai_recommendations", generateRecommendations(fraudAnalysis, textAnalysis));
            response.put("analysis_timestamp", System.currentTimeMillis());
            response.put("status", "reanalysis_complete");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error re-analyzing claim {}: {}", id, e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to analyze claim");
            errorResponse.put("message", e.getMessage());
            errorResponse.put("status", "error");
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @GetMapping("/ai/health")
    public ResponseEntity<Map<String, Object>> checkAIHealth() {
        Map<String, Object> health = new HashMap<>();
        health.put("ai_service_healthy", aiService.isAIServiceHealthy());
        health.put("timestamp", System.currentTimeMillis());
        health.put("service_type", "claim_analysis");
        return ResponseEntity.ok(health);
    }

    @PostMapping("/bulk-analyze")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> bulkAnalyzeClaims(@RequestBody Map<String, Object> request) {
        try {
            @SuppressWarnings("unchecked")
            List<Long> claimIds = (List<Long>) request.get("claim_ids");
            
            if (claimIds == null || claimIds.isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Claim IDs are required");
                errorResponse.put("status", "error");
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            Map<String, Object> results = new HashMap<>();
            int processed = 0;
            int failed = 0;
            
            for (Long claimId : claimIds) {
                try {
                    ClaimDto claim = claimService.getClaimById(claimId);
                    
                    Map<String, Object> claimData = new HashMap<>();
                    claimData.put("description", claim.getIncidentDescription());
                    claimData.put("amount", claim.getClaimAmount() != null ? claim.getClaimAmount().doubleValue() : 0.0);
                    claimData.put("claim_type", claim.getType());
                    
                    Map<String, Object> analysis = aiService.analyzeClaim(claimData);
                    results.put("claim_" + claimId, analysis);
                    processed++;
                } catch (Exception e) {
                    log.error("Failed to analyze claim {}: {}", claimId, e.getMessage());
                    results.put("claim_" + claimId + "_error", e.getMessage());
                    failed++;
                }
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("results", results);
            response.put("summary", Map.of(
                "total_requested", claimIds.size(),
                "processed", processed,
                "failed", failed
            ));
            response.put("timestamp", System.currentTimeMillis());
            response.put("status", "bulk_analysis_complete");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error in bulk claim analysis: {}", e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Bulk analysis failed");
            errorResponse.put("message", e.getMessage());
            errorResponse.put("status", "error");
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    private Map<String, Object> generateRecommendations(Map<String, Object> fraudAnalysis, Map<String, Object> textAnalysis) {
        Map<String, Object> recommendations = new HashMap<>();
        
        Double fraudScore = (Double) fraudAnalysis.get("fraud_score");
        String sentiment = (String) textAnalysis.get("sentiment");
        
        if (fraudScore != null && fraudScore > 0.7) {
            recommendations.put("priority", "high");
            recommendations.put("action", "Manual review required - High fraud risk detected");
            recommendations.put("escalate", true);
            recommendations.put("auto_approve", false);
            recommendations.put("review_level", "senior_adjuster");
        } else if (fraudScore != null && fraudScore > 0.4) {
            recommendations.put("priority", "medium");
            recommendations.put("action", "Additional documentation may be required");
            recommendations.put("escalate", false);
            recommendations.put("auto_approve", false);
            recommendations.put("review_level", "standard_adjuster");
        } else {
            recommendations.put("priority", "low");
            recommendations.put("action", "Standard processing");
            recommendations.put("escalate", false);
            recommendations.put("auto_approve", fraudScore != null && fraudScore < 0.3);
            recommendations.put("review_level", "automated");
        }
        
        if ("negative".equals(sentiment)) {
            recommendations.put("customer_service_alert", "Customer may need additional support");
            recommendations.put("communication_priority", "high");
        } else if ("positive".equals(sentiment)) {
            recommendations.put("customer_service_note", "Positive customer interaction");
            recommendations.put("communication_priority", "standard");
        }
        
        recommendations.put("estimated_processing_time", 
            fraudScore != null && fraudScore > 0.7 ? "5-10 business days" : 
            fraudScore != null && fraudScore > 0.4 ? "3-5 business days" : "1-3 business days");
        
        return recommendations;
    }
}
