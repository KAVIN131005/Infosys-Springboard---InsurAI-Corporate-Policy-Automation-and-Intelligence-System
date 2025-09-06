package com.example.insur.service;

import com.example.insur.dto.BrokerStatsDto;
import com.example.insur.dto.PolicyDto;
import com.example.insur.dto.ClaimDto;
import com.example.insur.dto.NotificationDto;
import com.example.insur.repository.UserRepository;
import com.example.insur.repository.PolicyRepository;
import com.example.insur.repository.ClaimRepository;
import com.example.insur.entity.User;
import com.example.insur.entity.Policy;
import com.example.insur.entity.Claim;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BrokerDashboardService {

    private final UserRepository userRepository;
    private final PolicyRepository policyRepository;
    private final ClaimRepository claimRepository;

    public BrokerStatsDto getBrokerStats(String username) {
        User broker = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Broker not found"));

        BrokerStatsDto stats = new BrokerStatsDto();
        
        // Get broker's policies
        List<Policy> brokerPolicies = policyRepository.findAll().stream()
                .filter(p -> p.getUploadedBy() != null && p.getUploadedBy().getUsername().equals(username))
                .collect(Collectors.toList());
        
        stats.setTotalPolicies((long) brokerPolicies.size());
        
        // Calculate revenue
        double totalRevenue = brokerPolicies.stream()
                .filter(p -> p.getMonthlyPremium() != null)
                .mapToDouble(p -> p.getMonthlyPremium().doubleValue())
                .sum();
        stats.setTotalRevenue(totalRevenue);
        stats.setMonthlyRevenue(totalRevenue); // Simplified
        
        // Calculate average policy value
        if (!brokerPolicies.isEmpty()) {
            stats.setAveragePolicyValue(totalRevenue / brokerPolicies.size());
        } else {
            stats.setAveragePolicyValue(0.0);
        }
        
        // Get claims related to broker's policies
        List<Claim> brokerClaims = claimRepository.findAll().stream()
                .filter(c -> brokerPolicies.stream()
                        .anyMatch(p -> p.getId().equals(c.getUserPolicy() != null ? 
                                c.getUserPolicy().getPolicy().getId() : null)))
                .collect(Collectors.toList());
        
        stats.setTotalClaims((long) brokerClaims.size());
        stats.setPendingClaims(brokerClaims.stream()
                .filter(c -> "PENDING".equals(c.getStatus()))
                .count());
        
        // Calculate claim approval rate
        long approvedClaims = brokerClaims.stream()
                .filter(c -> "APPROVED".equals(c.getStatus()))
                .count();
        long rejectedClaims = brokerClaims.stream()
                .filter(c -> "REJECTED".equals(c.getStatus()))
                .count();
        long totalProcessedClaims = approvedClaims + rejectedClaims;
        
        if (totalProcessedClaims > 0) {
            stats.setClaimApprovalRate((double) approvedClaims / totalProcessedClaims * 100);
        } else {
            stats.setClaimApprovalRate(0.0);
        }
        
        // Calculate policies and claims this month
        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        
        long policiesThisMonth = brokerPolicies.stream()
                .filter(p -> p.getCreatedAt() != null && p.getCreatedAt().isAfter(startOfMonth))
                .count();
        stats.setPoliciesThisMonth(policiesThisMonth);
        
        long claimsThisMonth = brokerClaims.stream()
                .filter(c -> c.getCreatedAt() != null && c.getCreatedAt().isAfter(startOfMonth))
                .count();
        stats.setClaimsThisMonth(claimsThisMonth);
        
        // Simplified active clients count
        stats.setActiveClients((long) brokerPolicies.size()); // Assuming each policy has a unique client
        
        return stats;
    }

    public List<PolicyDto> getBrokerPolicies(String username) {
        List<Policy> policies = policyRepository.findAll().stream()
                .filter(p -> p.getUploadedBy() != null && p.getUploadedBy().getUsername().equals(username))
                .sorted((p1, p2) -> {
                    if (p1.getCreatedAt() == null && p2.getCreatedAt() == null) return 0;
                    if (p1.getCreatedAt() == null) return 1;
                    if (p2.getCreatedAt() == null) return -1;
                    return p2.getCreatedAt().compareTo(p1.getCreatedAt());
                })
                .collect(Collectors.toList());
        
        return policies.stream()
                .map(this::convertPolicyToDto)
                .collect(Collectors.toList());
    }

    public List<ClaimDto> getBrokerClaims(String username) {
        // Get broker's policies first
        List<Policy> brokerPolicies = policyRepository.findAll().stream()
                .filter(p -> p.getUploadedBy() != null && p.getUploadedBy().getUsername().equals(username))
                .collect(Collectors.toList());
        
        // Get claims related to broker's policies
        List<Claim> claims = claimRepository.findAll().stream()
                .filter(c -> brokerPolicies.stream()
                        .anyMatch(p -> p.getId().equals(c.getUserPolicy() != null ? 
                                c.getUserPolicy().getPolicy().getId() : null)))
                .sorted((c1, c2) -> {
                    if (c1.getCreatedAt() == null && c2.getCreatedAt() == null) return 0;
                    if (c1.getCreatedAt() == null) return 1;
                    if (c2.getCreatedAt() == null) return -1;
                    return c2.getCreatedAt().compareTo(c1.getCreatedAt());
                })
                .collect(Collectors.toList());
        
        return claims.stream()
                .map(this::convertClaimToDto)
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getClientActivity(String username) {
        // Simplified client activity - in a real system, you'd track actual user activities
        return List.of(
            Map.of(
                "clientName", "John Doe",
                "action", "Applied for Health Insurance",
                "timestamp", LocalDateTime.now().minusHours(2)
            ),
            Map.of(
                "clientName", "Jane Smith",
                "action", "Submitted claim for Auto Insurance",
                "timestamp", LocalDateTime.now().minusHours(6)
            ),
            Map.of(
                "clientName", "Mike Johnson",
                "action", "Policy renewal completed",
                "timestamp", LocalDateTime.now().minusHours(12)
            )
        );
    }

    public List<NotificationDto> getBrokerNotifications(String username) {
        return List.of(
            new NotificationDto(1L, "New Client Application", "John Doe applied for your health insurance policy", "info", false, null, "broker", LocalDateTime.now().minusHours(1)),
            new NotificationDto(2L, "Claim Submitted", "Client submitted a claim that requires your attention", "warning", false, null, "broker", LocalDateTime.now().minusHours(4)),
            new NotificationDto(3L, "Policy Approved", "Your uploaded life insurance policy has been approved", "success", false, null, "broker", LocalDateTime.now().minusHours(8))
        );
    }

    public Map<String, Object> getBrokerAnalytics(String username) {
        Map<String, Object> analytics = new HashMap<>();
        
        // Get broker's policies
        List<Policy> brokerPolicies = policyRepository.findAll().stream()
                .filter(p -> p.getUploadedBy() != null && p.getUploadedBy().getUsername().equals(username))
                .collect(Collectors.toList());
        
        // Policy distribution by type
        Map<String, Long> policyByType = brokerPolicies.stream()
                .collect(Collectors.groupingBy(
                    p -> p.getType() != null ? p.getType() : "Unknown",
                    Collectors.counting()
                ));
        analytics.put("policyDistribution", policyByType);
        
        // Revenue by month (simplified)
        Map<String, Double> revenueByMonth = Map.of(
            "Jan", 15000.0,
            "Feb", 18000.0,
            "Mar", 22000.0,
            "Apr", 25000.0,
            "May", 28000.0,
            "Jun", 30000.0
        );
        analytics.put("revenueByMonth", revenueByMonth);
        
        return analytics;
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
        dto.setUploadedBy(policy.getUploadedBy() != null ? policy.getUploadedBy().getUsername() : null);
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
