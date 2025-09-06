package com.example.insur.controller;

import com.example.insur.dto.PolicyDto;
import com.example.insur.dto.ClaimDto;
import com.example.insur.dto.UserStatsDto;
import com.example.insur.dto.NotificationDto;
import com.example.insur.service.PolicyService;
import com.example.insur.service.ClaimService;
import com.example.insur.service.UserDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
@PreAuthorize("hasRole('USER')")
public class UserController {

    private final PolicyService policyService;
    private final ClaimService claimService;
    private final UserDashboardService userDashboardService;

    // Dashboard endpoints
    @GetMapping("/stats")
    public ResponseEntity<UserStatsDto> getUserStats(Authentication auth) {
        String username = auth.getName();
        return ResponseEntity.ok(userDashboardService.getUserStats(username));
    }

    @GetMapping("/policies")
    public ResponseEntity<List<PolicyDto>> getUserPolicies(Authentication auth) {
        String username = auth.getName();
        return ResponseEntity.ok(userDashboardService.getUserPolicies(username));
    }

    @GetMapping("/claims")
    public ResponseEntity<List<ClaimDto>> getUserClaims(Authentication auth) {
        String username = auth.getName();
        return ResponseEntity.ok(userDashboardService.getUserClaims(username));
    }

    @GetMapping("/notifications")
    public ResponseEntity<List<NotificationDto>> getUserNotifications(Authentication auth) {
        String username = auth.getName();
        return ResponseEntity.ok(userDashboardService.getUserNotifications(username));
    }

    @GetMapping("/recommendations")
    public ResponseEntity<List<Map<String, Object>>> getUserRecommendations(Authentication auth) {
        String username = auth.getName();
        return ResponseEntity.ok(userDashboardService.getUserRecommendations(username));
    }

    // Claim management endpoints
    @PostMapping("/submit-claim/{policyId}")
    public ResponseEntity<Map<String, Object>> submitClaim(
            @RequestParam("policyId") Long policyId,
            @RequestParam("type") String type,
            @RequestParam("description") String description,
            @RequestParam("amount") Double amount,
            @RequestParam(value = "documents", required = false) MultipartFile[] documents,
            Authentication auth) {
        String username = auth.getName();
        // For now, using a simplified approach - in real implementation would create ClaimSubmissionRequest
        // return ResponseEntity.ok(claimService.submitClaim(policyId, type, description, amount, documents, username));
        return ResponseEntity.ok(Map.of("message", "Claim submission feature temporarily unavailable"));
    }

    @GetMapping("/claims/{id}")
    public ResponseEntity<ClaimDto> getClaimDetails(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(claimService.getClaimById(id)); // Simplified for now
    }

    // Policy application endpoints
    @PostMapping("/apply-policy/{policyId}")
    public ResponseEntity<PolicyDto> applyForPolicy(@PathVariable Long policyId, Authentication auth) {
        String username = auth.getName();
        return ResponseEntity.ok(policyService.applyForPolicy(policyId, username));
    }

    @GetMapping("/applied-policies")
    public ResponseEntity<List<Map<String, Object>>> getAppliedPolicies(Authentication auth) {
        String username = auth.getName();
        return ResponseEntity.ok(userDashboardService.getAppliedPolicies(username));
    }
}
