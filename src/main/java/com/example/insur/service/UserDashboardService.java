package com.example.insur.service;

import com.example.insur.dto.UserStatsDto;
import com.example.insur.dto.PolicyDto;
import com.example.insur.dto.ClaimDto;
import com.example.insur.dto.NotificationDto;
import com.example.insur.repository.UserRepository;
import com.example.insur.repository.PolicyRepository;
import com.example.insur.repository.ClaimRepository;
import com.example.insur.repository.UserPolicyRepository;
import com.example.insur.entity.User;
import com.example.insur.entity.Policy;
import com.example.insur.entity.Claim;
import com.example.insur.entity.UserPolicy;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserDashboardService {

    private final UserRepository userRepository;
    private final PolicyRepository policyRepository;
    private final ClaimRepository claimRepository;
    private final UserPolicyRepository userPolicyRepository;

    public UserStatsDto getUserStats(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserStatsDto stats = new UserStatsDto();
        
        // Get user's policies
        List<UserPolicy> userPolicies = userPolicyRepository.findByUser(user);
        stats.setActivePolicies((long) userPolicies.size());
        
        // Calculate total premium and coverage
        double totalPremium = userPolicies.stream()
                .filter(up -> up.getPolicy() != null && up.getPolicy().getMonthlyPremium() != null)
                .mapToDouble(up -> up.getPolicy().getMonthlyPremium().doubleValue())
                .sum();
        stats.setTotalPremium(totalPremium);
        
        double totalCoverage = userPolicies.stream()
                .filter(up -> up.getPolicy() != null && up.getPolicy().getCoverage() != null)
                .mapToDouble(up -> up.getPolicy().getCoverage().doubleValue())
                .sum();
        stats.setTotalCoverage(totalCoverage);
        
        // Get user's claims
        List<Claim> userClaims = claimRepository.findAll().stream()
                .filter(c -> c.getSubmittedBy() != null && c.getSubmittedBy().getId().equals(user.getId()))
                .collect(Collectors.toList());
        
        stats.setTotalClaims((long) userClaims.size());
        stats.setPendingClaims(userClaims.stream()
                .filter(c -> "PENDING".equals(c.getStatus()))
                .count());
        stats.setApprovedClaims(userClaims.stream()
                .filter(c -> "APPROVED".equals(c.getStatus()))
                .count());
        stats.setRejectedClaims(userClaims.stream()
                .filter(c -> "REJECTED".equals(c.getStatus()))
                .count());
        
        // Get last claim info
        if (!userClaims.isEmpty()) {
            Claim lastClaim = userClaims.stream()
                    .max((c1, c2) -> {
                        if (c1.getCreatedAt() == null && c2.getCreatedAt() == null) return 0;
                        if (c1.getCreatedAt() == null) return -1;
                        if (c2.getCreatedAt() == null) return 1;
                        return c1.getCreatedAt().compareTo(c2.getCreatedAt());
                    })
                    .orElse(null);
            
            if (lastClaim != null) {
                stats.setLastClaimAmount(lastClaim.getClaimAmount() != null ? 
                        lastClaim.getClaimAmount().doubleValue() : 0.0);
                stats.setLastClaimStatus(lastClaim.getStatus());
            }
        }
        
        // Applied policies count (same as active for now)
        stats.setAppliedPolicies((long) userPolicies.size());
        
        return stats;
    }

    public List<PolicyDto> getUserPolicies(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<UserPolicy> userPolicies = userPolicyRepository.findByUser(user);
        
        return userPolicies.stream()
                .map(up -> convertPolicyToDto(up.getPolicy()))
                .collect(Collectors.toList());
    }

    public List<ClaimDto> getUserClaims(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Claim> userClaims = claimRepository.findAll().stream()
                .filter(c -> c.getSubmittedBy() != null && c.getSubmittedBy().getId().equals(user.getId()))
                .sorted((c1, c2) -> {
                    if (c1.getCreatedAt() == null && c2.getCreatedAt() == null) return 0;
                    if (c1.getCreatedAt() == null) return 1;
                    if (c2.getCreatedAt() == null) return -1;
                    return c2.getCreatedAt().compareTo(c1.getCreatedAt());
                })
                .collect(Collectors.toList());
        
        return userClaims.stream()
                .map(this::convertClaimToDto)
                .collect(Collectors.toList());
    }

    public List<NotificationDto> getUserNotifications(String username) {
        return List.of(
            new NotificationDto(1L, "Policy Activated", "Your health insurance policy is now active", "success", false, null, "user", LocalDateTime.now().minusHours(2)),
            new NotificationDto(2L, "Claim Processed", "Your recent claim has been approved", "success", false, null, "user", LocalDateTime.now().minusHours(8)),
            new NotificationDto(3L, "Payment Due", "Premium payment due in 5 days", "warning", false, null, "user", LocalDateTime.now().minusHours(12))
        );
    }

    public List<Map<String, Object>> getUserRecommendations(String username) {
        return List.of(
            Map.of(
                "title", "Consider Life Insurance",
                "description", "Based on your profile, life insurance could provide additional security",
                "action", "Explore Life Insurance",
                "actionUrl", "/policies?type=life"
            ),
            Map.of(
                "title", "Review Your Coverage",
                "description", "It's been a year since your last policy review",
                "action", "Schedule Review",
                "actionUrl", "/user/policies"
            ),
            Map.of(
                "title", "Claim Documentation",
                "description", "Upload supporting documents for faster claim processing",
                "action", "Upload Documents",
                "actionUrl", "/user/claims"
            )
        );
    }

    public List<Map<String, Object>> getAppliedPolicies(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<UserPolicy> userPolicies = userPolicyRepository.findByUser(user);
        
        return userPolicies.stream()
                .map(up -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", up.getId());
                    map.put("policyId", up.getPolicy().getId());
                    map.put("policyName", up.getPolicy().getName());
                    map.put("status", up.getStatus() != null ? up.getStatus() : "ACTIVE");
                    map.put("appliedDate", up.getCreatedAt() != null ? up.getCreatedAt() : LocalDateTime.now());
                    map.put("premium", up.getPolicy().getMonthlyPremium() != null ? 
                            up.getPolicy().getMonthlyPremium().doubleValue() : 0.0);
                    return map;
                })
                .collect(Collectors.toList());
    }

    private PolicyDto convertPolicyToDto(Policy policy) {
        PolicyDto dto = new PolicyDto();
        dto.setId(policy.getId());
        dto.setName(policy.getName());
        dto.setDescription(policy.getDescription());
        dto.setType(policy.getType());
        dto.setSubType(policy.getSubType());
        dto.setMonthlyPremium(policy.getMonthlyPremium());
        dto.setYearlyPremium(policy.getYearlyPremium());
        dto.setCoverage(policy.getCoverage());
        dto.setDeductible(policy.getDeductible());
        dto.setStatus(policy.getStatus());
        dto.setRiskLevel(policy.getRiskLevel());
        dto.setRequiresApproval(policy.getRequiresApproval());
        dto.setCreatedAt(policy.getCreatedAt());
        dto.setUpdatedAt(policy.getUpdatedAt());
        return dto;
    }

    private ClaimDto convertClaimToDto(Claim claim) {
        ClaimDto dto = new ClaimDto();
        dto.setId(claim.getId());
        dto.setClaimNumber(claim.getClaimNumber());
        dto.setType(claim.getType());
        dto.setStatus(claim.getStatus());
        dto.setClaimAmount(claim.getClaimAmount());
        dto.setApprovedAmount(claim.getApprovedAmount());
        dto.setIncidentDate(claim.getIncidentDate());
        dto.setIncidentLocation(claim.getIncidentLocation());
        dto.setIncidentDescription(claim.getIncidentDescription());
        dto.setAiAnalysisResult(claim.getAiAnalysisResult());
        dto.setAiConfidenceScore(claim.getAiConfidenceScore());
        dto.setFraudScore(claim.getFraudScore());
        dto.setRejectionReason(claim.getRejectionReason());
        dto.setAutoApproved(claim.getAutoApproved());
        dto.setRequiresManualReview(claim.getRequiresManualReview());
        dto.setCreatedAt(claim.getCreatedAt());
        dto.setUpdatedAt(claim.getUpdatedAt());
        return dto;
    }
}
