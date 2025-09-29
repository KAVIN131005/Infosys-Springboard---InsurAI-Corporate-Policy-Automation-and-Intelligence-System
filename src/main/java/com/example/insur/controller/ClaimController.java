package com.example.insur.controller;

import com.example.insur.dto.ClaimDto;
import com.example.insur.dto.ClaimSubmissionRequest;
import com.example.insur.service.ClaimService;
import com.example.insur.service.UserService;
import com.example.insur.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/claims")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class ClaimController {

    private final ClaimService claimService;
    private final UserService userService;

    @PostMapping("/submit")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ClaimDto> submitClaim(@RequestBody ClaimSubmissionRequest request, Authentication auth) {
        User currentUser = userService.getCurrentUser();
        return ResponseEntity.ok(claimService.submitClaim(currentUser.getId(), request));
    }

    @PostMapping("/submit-file")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ClaimDto> submitClaimWithFile(@RequestParam("file") MultipartFile file, @RequestParam("policyId") Long policyId) {
        return ResponseEntity.ok(claimService.submitClaim(file, policyId));
    }

    @GetMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<ClaimDto>> getUserClaims(Authentication auth) {
        return ResponseEntity.ok(claimService.getClaimsForUser());
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ClaimDto>> getAllClaims() {
        return ResponseEntity.ok(claimService.getAllClaims());
    }

    @GetMapping("/pending-review")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ClaimDto>> getPendingManualReview() {
        return ResponseEntity.ok(claimService.getPendingManualReview());
    }

    @GetMapping("/{id}")
    @PreAuthorize("authenticated")
    public ResponseEntity<ClaimDto> getClaimById(@PathVariable Long id, Authentication auth) {
        User currentUser = userService.getCurrentUser();
        if (currentUser.isAdmin()) {
            return ResponseEntity.ok(claimService.getClaimById(id));
        } else {
            return ResponseEntity.ok(claimService.getUserClaimDetails(id, currentUser.getUsername()));
        }
    }

    @GetMapping("/number/{claimNumber}")
    @PreAuthorize("authenticated")
    public ResponseEntity<ClaimDto> getClaimByNumber(@PathVariable String claimNumber) {
        return ResponseEntity.ok(claimService.getClaimByNumber(claimNumber));
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> approveClaim(@PathVariable Long id, 
                                           @RequestParam(required = false) BigDecimal approvedAmount,
                                           @RequestParam(required = false) String notes) {
        if (approvedAmount != null && notes != null) {
            User currentUser = userService.getCurrentUser();
            claimService.approveClaim(id, approvedAmount, notes, currentUser.getId());
        } else {
            claimService.approveClaim(id);
        }
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> rejectClaim(@PathVariable Long id, @RequestParam String reason) {
        claimService.rejectClaim(id, reason);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> updateClaimStatus(@PathVariable Long id, @RequestParam String status) {
        claimService.updateClaimStatus(id, status);
        return ResponseEntity.ok().build();
    }
}