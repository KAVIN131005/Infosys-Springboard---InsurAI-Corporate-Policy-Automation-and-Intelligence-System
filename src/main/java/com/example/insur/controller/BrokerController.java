package com.example.insur.controller;

import com.example.insur.dto.PolicyDto;
import com.example.insur.service.PolicyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/broker")
@RequiredArgsConstructor
@PreAuthorize("hasRole('UPLOADER')")
public class BrokerController {

    private final PolicyService policyService;

    @GetMapping("/policies")
    public ResponseEntity<List<PolicyDto>> getBrokerPolicies() {
        return ResponseEntity.ok(policyService.getPoliciesForUser());
    }
}