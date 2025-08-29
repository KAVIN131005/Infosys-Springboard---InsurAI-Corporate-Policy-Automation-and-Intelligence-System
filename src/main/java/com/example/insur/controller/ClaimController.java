package com.example.insur.controller;

import com.example.insur.dto.ClaimDto;
import com.example.insur.service.ClaimService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/claims")
@RequiredArgsConstructor
public class ClaimController {

    private final ClaimService claimService;

    @PostMapping("/submit")
    @PreAuthorize("authenticated")
    public ResponseEntity<ClaimDto> submitClaim(@RequestParam("file") MultipartFile file, @RequestParam("policyId") Long policyId) {
        return ResponseEntity.ok(claimService.submitClaim(file, policyId));
    }

    @GetMapping
    @PreAuthorize("authenticated")
    public ResponseEntity<List<ClaimDto>> getClaims() {
        return ResponseEntity.ok(claimService.getClaimsForUser());
    }

    @GetMapping("/{id}")
    @PreAuthorize("authenticated")
    public ResponseEntity<ClaimDto> getClaimById(@PathVariable Long id) {
        return ResponseEntity.ok(claimService.getClaimById(id));
    }
}