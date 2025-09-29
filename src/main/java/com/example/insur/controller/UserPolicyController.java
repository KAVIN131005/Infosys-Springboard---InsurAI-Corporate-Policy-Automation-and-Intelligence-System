package com.example.insur.controller;

import com.example.insur.dto.PolicyApplicationRequest;
import com.example.insur.dto.UserPolicyDto;
import com.example.insur.service.UserPolicyService;
import com.example.insur.service.UserService;
import com.example.insur.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/user-policies")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class UserPolicyController {

    @Autowired
    private UserPolicyService userPolicyService;

    @Autowired
    private UserService userService;

    @PostMapping("/apply")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<UserPolicyDto> applyForPolicy(@RequestBody PolicyApplicationRequest request, Authentication auth) {
        User currentUser = userService.getCurrentUser();
        return ResponseEntity.ok(userPolicyService.applyForPolicy(currentUser.getId(), request));
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<UserPolicyDto>> getUserPolicies(@PathVariable Long userId, Authentication auth) {
        // Allow users to see their own policies, admins can see any user's policies
        User currentUser = userService.getCurrentUser();
        if (!currentUser.isAdmin() && !currentUser.getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access");
        }
        return ResponseEntity.ok(userPolicyService.getUserPolicies(userId));
    }

    @GetMapping("/user")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<UserPolicyDto>> getCurrentUserPolicies(Authentication auth) {
        User currentUser = userService.getCurrentUser();
        return ResponseEntity.ok(userPolicyService.getUserPolicies(currentUser.getId()));
    }

    @GetMapping("/active/{userId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<UserPolicyDto>> getActiveUserPolicies(@PathVariable Long userId, Authentication auth) {
        User currentUser = userService.getCurrentUser();
        if (!currentUser.isAdmin() && !currentUser.getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access");
        }
        return ResponseEntity.ok(userPolicyService.getActivePolicies(userId));
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserPolicyDto> approvePolicy(@PathVariable Long id, @RequestParam(required = false) String notes) {
        return ResponseEntity.ok(userPolicyService.approvePolicy(id, notes != null ? notes : "Approved by admin"));
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserPolicyDto> rejectPolicy(@PathVariable Long id, @RequestParam String reason) {
        return ResponseEntity.ok(userPolicyService.rejectPolicy(id, reason));
    }

    @GetMapping("/pending-approvals")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserPolicyDto>> getPendingApprovals() {
        return ResponseEntity.ok(userPolicyService.getPendingApprovals());
    }

    @GetMapping("/pending-applications")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserPolicyDto>> getPendingApplications() {
        return ResponseEntity.ok(userPolicyService.getPendingApplications());
    }

    @PostMapping("/applications/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserPolicyDto> approveApplication(@PathVariable Long id, @RequestParam(required = false) String notes) {
        return ResponseEntity.ok(userPolicyService.approveApplication(id, notes != null ? notes : "Application approved by admin"));
    }

    @PostMapping("/applications/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserPolicyDto> rejectApplication(@PathVariable Long id, @RequestParam String reason) {
        return ResponseEntity.ok(userPolicyService.rejectApplication(id, reason));
    }

    @PostMapping("/calculate-premium")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<BigDecimal> calculatePremium(@RequestBody PolicyApplicationRequest request, Authentication auth) {
        User currentUser = userService.getCurrentUser();
        return ResponseEntity.ok(userPolicyService.calculatePremium(request, currentUser));
    }

    @GetMapping("/{id}/risk-score")
    @PreAuthorize("hasAnyRole('ADMIN', 'BROKER')")
    public ResponseEntity<BigDecimal> getUserRiskScore(@PathVariable Long id) {
        return ResponseEntity.ok(userPolicyService.calculateUserRiskScore(id));
    }
}