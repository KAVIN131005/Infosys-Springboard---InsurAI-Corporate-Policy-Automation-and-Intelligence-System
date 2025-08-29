package com.example.insur.controller;

import com.example.insur.dto.PolicyDto;
import com.example.insur.service.PolicyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/policies")
@RequiredArgsConstructor
public class PolicyController {

    private final PolicyService policyService;

    @PostMapping("/upload")
    @PreAuthorize("hasAnyRole('UPLOADER', 'ADMIN')")
    public ResponseEntity<PolicyDto> uploadPolicy(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(policyService.uploadPolicy(file));
    }

    @GetMapping
    @PreAuthorize("authenticated")
    public ResponseEntity<List<PolicyDto>> getPolicies() {
        return ResponseEntity.ok(policyService.getPoliciesForUser());
    }

    @GetMapping("/{id}")
    @PreAuthorize("authenticated")
    public ResponseEntity<PolicyDto> getPolicyById(@PathVariable Long id) {
        return ResponseEntity.ok(policyService.getPolicyById(id));
    }
}