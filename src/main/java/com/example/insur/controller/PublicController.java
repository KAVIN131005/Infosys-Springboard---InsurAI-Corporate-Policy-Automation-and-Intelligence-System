package com.example.insur.controller;

import com.example.insur.dto.PolicyDto;
import com.example.insur.service.PolicyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicController {

    private final PolicyService policyService;

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
            "status", "UP",
            "timestamp", System.currentTimeMillis(),
            "service", "InsurAI Backend"
        ));
    }

    @GetMapping("/policies")
    public ResponseEntity<List<PolicyDto>> getAllPoliciesPublic() {
        try {
            List<PolicyDto> policies = policyService.getAllPolicies();
            return ResponseEntity.ok(policies);
        } catch (Exception e) {
            // Return empty list if there's an error
            return ResponseEntity.ok(List.of());
        }
    }
}
