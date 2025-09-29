package com.example.insur.controller;

import com.example.insur.service.UserService;
import com.example.insur.service.PolicyService;
import com.example.insur.service.ClaimService;
import com.example.insur.service.AdminDashboardService;
import com.example.insur.dto.UserDto;
import com.example.insur.dto.PolicyDto;
import com.example.insur.dto.ClaimDto;
import com.example.insur.dto.AdminStatsDto;
import com.example.insur.dto.NotificationDto;
import com.example.insur.dto.UserPolicyDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserService userService;
    private final PolicyService policyService;
    private final ClaimService claimService;
    private final AdminDashboardService adminDashboardService;

    // Dashboard endpoints
    @GetMapping("/stats")
    public ResponseEntity<AdminStatsDto> getAdminStats() {
        return ResponseEntity.ok(adminDashboardService.getAdminStats());
    }

    @GetMapping("/users/recent")
    public ResponseEntity<List<UserDto>> getRecentUsers() {
        return ResponseEntity.ok(adminDashboardService.getRecentUsers());
    }

    @GetMapping("/policies/recent")
    public ResponseEntity<List<PolicyDto>> getRecentPolicies() {
        return ResponseEntity.ok(adminDashboardService.getRecentPolicies());
    }

    @GetMapping("/claims/recent")
    public ResponseEntity<List<ClaimDto>> getRecentClaims() {
        return ResponseEntity.ok(adminDashboardService.getRecentClaims());
    }

    @GetMapping("/notifications")
    public ResponseEntity<List<NotificationDto>> getNotifications() {
        return ResponseEntity.ok(adminDashboardService.getNotifications());
    }

    @GetMapping("/system-health")
    public ResponseEntity<Map<String, Object>> getSystemHealth() {
        return ResponseEntity.ok(adminDashboardService.getSystemHealth());
    }

    @GetMapping("/analytics/overview")
    public ResponseEntity<Map<String, Object>> getAnalyticsOverview() {
        return ResponseEntity.ok(adminDashboardService.getAnalyticsOverview());
    }

    // User management endpoints
    @GetMapping("/users")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PostMapping("/users")
    public ResponseEntity<UserDto> createUser(@RequestBody UserDto userDto) {
        return ResponseEntity.ok(userService.createUser(userDto));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<UserDto> updateUser(@PathVariable Long id, @RequestBody UserDto userDto) {
        return ResponseEntity.ok(userService.updateUser(id, userDto));
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<Void> updateUserStatus(@PathVariable Long id, @RequestParam String status) {
        userService.updateUserStatus(id, status);
        return ResponseEntity.ok().build();
    }

    // Policy management endpoints
    @GetMapping("/policies")
    public ResponseEntity<List<PolicyDto>> getAllPolicies() {
        return ResponseEntity.ok(policyService.getAllPolicies());
    }

    @PostMapping("/policies")
    public ResponseEntity<PolicyDto> createPolicy(@RequestBody PolicyDto policyDto) {
        return ResponseEntity.ok(policyService.createPolicy(policyDto));
    }

    @PutMapping("/policies/{id}")
    public ResponseEntity<PolicyDto> updatePolicy(@PathVariable Long id, @RequestBody PolicyDto policyDto) {
        return ResponseEntity.ok(policyService.updatePolicy(id, policyDto));
    }

    @DeleteMapping("/policies/{id}")
    public ResponseEntity<Void> deletePolicy(@PathVariable Long id) {
        policyService.deletePolicy(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/policies/{id}/approve")
    public ResponseEntity<Void> approvePolicy(@PathVariable Long id) {
        policyService.approvePolicy(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/policies/{id}/reject")
    public ResponseEntity<Void> rejectPolicy(@PathVariable Long id, @RequestParam String reason) {
        policyService.rejectPolicy(id, reason);
        return ResponseEntity.ok().build();
    }

    // Claim management endpoints
    @GetMapping("/claims")
    public ResponseEntity<List<ClaimDto>> getAllClaims() {
        return ResponseEntity.ok(claimService.getAllClaims());
    }

    @PutMapping("/claims/{id}/approve")
    public ResponseEntity<Void> approveClaim(@PathVariable Long id) {
        claimService.approveClaim(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/claims/{id}/reject")
    public ResponseEntity<Void> rejectClaim(@PathVariable Long id, @RequestParam String reason) {
        claimService.rejectClaim(id, reason);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/claims/{id}/status")
    public ResponseEntity<Void> updateClaimStatus(@PathVariable Long id, @RequestParam String status) {
        claimService.updateClaimStatus(id, status);
        return ResponseEntity.ok().build();
    }

    // User Policy Approval Endpoints
    @GetMapping("/user-policies/pending")
    public ResponseEntity<List<UserPolicyDto>> getPendingUserPolicies() {
        return ResponseEntity.ok(adminDashboardService.getPendingUserPolicies());
    }

    @PostMapping("/user-policies/{id}/approve")
    public ResponseEntity<UserPolicyDto> approveUserPolicy(@PathVariable Long id, @RequestParam(required = false) String notes) {
        return ResponseEntity.ok(adminDashboardService.approveUserPolicy(id, notes));
    }

    @PostMapping("/user-policies/{id}/reject")
    public ResponseEntity<UserPolicyDto> rejectUserPolicy(@PathVariable Long id, @RequestParam String reason) {
        return ResponseEntity.ok(adminDashboardService.rejectUserPolicy(id, reason));
    }

    @GetMapping("/user-policies/all")
    public ResponseEntity<List<UserPolicyDto>> getAllUserPolicies() {
        return ResponseEntity.ok(adminDashboardService.getAllUserPolicies());
    }

    @GetMapping("/user-policies/statistics")
    public ResponseEntity<Map<String, Object>> getUserPolicyStatistics() {
        return ResponseEntity.ok(adminDashboardService.getUserPolicyStatistics());
    }
}