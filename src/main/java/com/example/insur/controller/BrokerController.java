package com.example.insur.controller;

import com.example.insur.dto.PolicyDto;
import com.example.insur.dto.ClaimDto;
import com.example.insur.dto.BrokerStatsDto;
import com.example.insur.dto.NotificationDto;
import com.example.insur.service.PolicyService;
import com.example.insur.service.ClaimService;
import com.example.insur.service.BrokerDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/broker")
@RequiredArgsConstructor
@PreAuthorize("hasRole('BROKER') or hasRole('UPLOADER')")
public class BrokerController {

    private final PolicyService policyService;
    private final ClaimService claimService;
    private final BrokerDashboardService brokerDashboardService;

    // Dashboard endpoints
    @GetMapping("/stats")
    public ResponseEntity<BrokerStatsDto> getBrokerStats(Authentication auth) {
        String username = auth.getName();
        return ResponseEntity.ok(brokerDashboardService.getBrokerStats(username));
    }

    @GetMapping("/policies")
    public ResponseEntity<List<PolicyDto>> getBrokerPolicies(Authentication auth) {
        String username = auth != null ? auth.getName() : null;
        if (username != null) {
            return ResponseEntity.ok(brokerDashboardService.getBrokerPolicies(username));
        } else {
            return ResponseEntity.ok(policyService.getPoliciesForUser());
        }
    }

    @GetMapping("/claims")
    public ResponseEntity<List<ClaimDto>> getBrokerClaims(Authentication auth) {
        String username = auth.getName();
        return ResponseEntity.ok(brokerDashboardService.getBrokerClaims(username));
    }

    @GetMapping("/clients/activity")
    public ResponseEntity<List<Map<String, Object>>> getClientActivity(Authentication auth) {
        String username = auth.getName();
        return ResponseEntity.ok(brokerDashboardService.getClientActivity(username));
    }

    @GetMapping("/notifications")
    public ResponseEntity<List<NotificationDto>> getBrokerNotifications(Authentication auth) {
        String username = auth.getName();
        return ResponseEntity.ok(brokerDashboardService.getBrokerNotifications(username));
    }

    // Policy management endpoints
    @PostMapping("/upload")
    public ResponseEntity<PolicyDto> uploadPolicy(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "description", required = false) String description,
            Authentication auth) {
        String username = auth.getName();
        return ResponseEntity.ok(policyService.uploadPolicy(file, name, description, username));
    }

    @PutMapping("/policies/{id}")
    public ResponseEntity<PolicyDto> updatePolicy(
            @PathVariable Long id, 
            @RequestBody PolicyDto policyDto,
            Authentication auth) {
        String username = auth.getName();
        return ResponseEntity.ok(policyService.updateBrokerPolicy(id, policyDto, username));
    }

    @DeleteMapping("/policies/{id}")
    public ResponseEntity<Void> deletePolicy(@PathVariable Long id, Authentication auth) {
        String username = auth.getName();
        policyService.deleteBrokerPolicy(id, username);
        return ResponseEntity.noContent().build();
    }

    // Analytics endpoint
    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getBrokerAnalytics(Authentication auth) {
        String username = auth.getName();
        return ResponseEntity.ok(brokerDashboardService.getBrokerAnalytics(username));
    }
}