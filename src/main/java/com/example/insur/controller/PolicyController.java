package com.example.insur.controller;

import com.example.insur.dto.PolicyDto;
import com.example.insur.service.PolicyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/policies")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class PolicyController {

    private final PolicyService policyService;

    // Public endpoint to view all active policies (for users to browse and apply)
    @GetMapping("/public")
    public ResponseEntity<List<PolicyDto>> getPublicPolicies() {
        return ResponseEntity.ok(policyService.getAllActivePolicies());
    }

    @PostMapping("/upload")
    @PreAuthorize("hasAnyRole('BROKER', 'ADMIN')")
    public ResponseEntity<PolicyDto> uploadPolicy(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "description", required = false) String description,
            Authentication auth) {
        String username = auth.getName();
        return ResponseEntity.ok(policyService.uploadPolicy(file, name, description, username));
    }

    @GetMapping
    @PreAuthorize("authenticated")
    public ResponseEntity<List<PolicyDto>> getAllPolicies() {
        return ResponseEntity.ok(policyService.getAllPolicies());
    }

    @GetMapping("/user")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<PolicyDto>> getUserPolicies() {
        return ResponseEntity.ok(policyService.getPoliciesForUser());
    }

    @GetMapping("/broker")
    @PreAuthorize("hasRole('BROKER')")
    public ResponseEntity<List<PolicyDto>> getBrokerPolicies(Authentication auth) {
        String username = auth.getName();
        return ResponseEntity.ok(policyService.getBrokerPolicies(username));
    }

    @GetMapping("/{id}")
    @PreAuthorize("authenticated")
    public ResponseEntity<PolicyDto> getPolicyById(@PathVariable Long id) {
        return ResponseEntity.ok(policyService.getPolicyById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('BROKER', 'ADMIN')")
    public ResponseEntity<PolicyDto> createPolicy(@RequestBody PolicyDto policyDto) {
        return ResponseEntity.ok(policyService.createPolicy(policyDto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('BROKER', 'ADMIN')")
    public ResponseEntity<PolicyDto> updatePolicy(@PathVariable Long id, @RequestBody PolicyDto policyDto, Authentication auth) {
        String username = auth.getName();
        return ResponseEntity.ok(policyService.updateBrokerPolicy(id, policyDto, username));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('BROKER', 'ADMIN')")
    public ResponseEntity<Void> deletePolicy(@PathVariable Long id, Authentication auth) {
        String username = auth.getName();
        policyService.deleteBrokerPolicy(id, username);
        return ResponseEntity.ok().build();
    }

    // User applies for a policy
    @PostMapping("/{id}/apply")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<PolicyDto> applyForPolicy(@PathVariable Long id, Authentication auth) {
        String username = auth.getName();
        return ResponseEntity.ok(policyService.applyForPolicy(id, username));
    }



    // Get policies by status
    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN', 'BROKER')")
    public ResponseEntity<List<PolicyDto>> getPoliciesByStatus(@PathVariable String status) {
        return ResponseEntity.ok(policyService.getPoliciesByStatus(status));
    }

    // Get policies by type
    @GetMapping("/type/{type}")
    public ResponseEntity<List<PolicyDto>> getPoliciesByType(@PathVariable String type) {
        return ResponseEntity.ok(policyService.getPoliciesByType(type));
    }

    // Get available policies for users to apply
    @GetMapping("/available")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<PolicyDto>> getAvailablePolicies() {
        return ResponseEntity.ok(policyService.getAvailablePolicies());
    }

    // Get pending policies for admin approval
    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PolicyDto>> getPendingPolicies() {
        return ResponseEntity.ok(policyService.getPendingPolicies());
    }

    // Approve policy
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PolicyDto> approvePolicy(@PathVariable Long id) {
        return ResponseEntity.ok(policyService.approvePolicy(id));
    }

    // Reject policy
    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PolicyDto> rejectPolicy(@PathVariable Long id, @RequestBody String reason) {
        return ResponseEntity.ok(policyService.rejectPolicy(id, reason));
    }
}