package com.example.insur.controller;

import com.example.insur.dto.PolicyComparisonRequest;
import com.example.insur.dto.PolicyComparisonResponse;
import com.example.insur.entity.Policy;
import com.example.insur.service.PolicyComparisonService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/policy-comparison")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class PolicyComparisonController {

    private final PolicyComparisonService policyComparisonService;

    @GetMapping("/available")
    public ResponseEntity<List<Policy>> getAvailablePolicies() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();
            log.info("Fetching available policies for comparison for user: {}", username);
            
            // For now, use a default user ID or extract from JWT
            List<Policy> policies = policyComparisonService.getAvailablePoliciesForComparison(1L);
            
            return ResponseEntity.ok(policies);
        } catch (Exception e) {
            log.error("Error fetching available policies: ", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/compare")
    public ResponseEntity<PolicyComparisonResponse> comparePolicies(@RequestBody PolicyComparisonRequest request) {
        try {
            log.info("Comparing policies: {}", request.getPolicyIds());
            
            // Validate request
            if (request.getPolicyIds() == null || request.getPolicyIds().size() < 2) {
                return ResponseEntity.badRequest().build();
            }
            
            if (request.getPolicyIds().size() > 5) {
                return ResponseEntity.badRequest().build(); // Limit to 5 policies for comparison
            }
            
            // Set user ID from authentication if not provided
            if (request.getUserId() == null) {
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                // For now, use a default user ID or extract from JWT
                request.setUserId(1L);
            }
            
            // Set default comparison type if not provided
            if (request.getComparisonType() == null) {
                request.setComparisonType("basic");
            }
            
            PolicyComparisonResponse response = policyComparisonService.comparePolicies(request);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error comparing policies: ", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/quick-compare")
    public ResponseEntity<PolicyComparisonResponse> quickCompare(@RequestBody List<Long> policyIds) {
        try {
            log.info("Quick comparing policies: {}", policyIds);
            
            if (policyIds == null || policyIds.size() < 2 || policyIds.size() > 5) {
                return ResponseEntity.badRequest().build();
            }
            
            PolicyComparisonResponse response = policyComparisonService.getQuickComparison(policyIds);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error in quick comparison: ", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/policies/{policyId}/details")
    public ResponseEntity<PolicyComparisonResponse.PolicyDetails> getPolicyDetails(@PathVariable Long policyId) {
        try {
            log.info("Fetching detailed information for policy: {}", policyId);
            
            // Create a single policy comparison to get detailed info
            PolicyComparisonRequest request = new PolicyComparisonRequest();
            request.setPolicyIds(List.of(policyId));
            request.setUserId(1L);
            request.setComparisonType("detailed");
            
            PolicyComparisonResponse response = policyComparisonService.comparePolicies(request);
            
            if (response.getPolicies().isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            return ResponseEntity.ok(response.getPolicies().get(0));
            
        } catch (Exception e) {
            log.error("Error fetching policy details: ", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/policies/types")
    public ResponseEntity<List<String>> getPolicyTypes() {
        try {
            List<String> types = List.of("HEALTH", "AUTO", "LIFE", "PROPERTY", "TRAVEL");
            return ResponseEntity.ok(types);
        } catch (Exception e) {
            log.error("Error fetching policy types: ", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/policies/filter")
    public ResponseEntity<List<Policy>> filterPolicies(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String riskLevel,
            @RequestParam(required = false) String minPremium,
            @RequestParam(required = false) String maxPremium) {
        try {
            log.info("Filtering policies with type: {}, riskLevel: {}, minPremium: {}, maxPremium: {}", 
                    type, riskLevel, minPremium, maxPremium);
            
            List<Policy> allPolicies = policyComparisonService.getAvailablePoliciesForComparison(1L);
            
            // Apply filters
            List<Policy> filteredPolicies = allPolicies.stream()
                    .filter(policy -> type == null || type.equals(policy.getType()))
                    .filter(policy -> riskLevel == null || riskLevel.equals(policy.getRiskLevel()))
                    .filter(policy -> {
                        if (minPremium == null) return true;
                        try {
                            return policy.getMonthlyPremium().compareTo(new java.math.BigDecimal(minPremium)) >= 0;
                        } catch (NumberFormatException e) {
                            return true;
                        }
                    })
                    .filter(policy -> {
                        if (maxPremium == null) return true;
                        try {
                            return policy.getMonthlyPremium().compareTo(new java.math.BigDecimal(maxPremium)) <= 0;
                        } catch (NumberFormatException e) {
                            return true;
                        }
                    })
                    .toList();
            
            return ResponseEntity.ok(filteredPolicies);
            
        } catch (Exception e) {
            log.error("Error filtering policies: ", e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
