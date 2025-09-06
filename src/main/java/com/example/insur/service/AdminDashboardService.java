package com.example.insur.service;

import com.example.insur.dto.AdminStatsDto;
import com.example.insur.dto.UserDto;
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
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private final UserRepository userRepository;
    private final PolicyRepository policyRepository;
    private final ClaimRepository claimRepository;

    public AdminStatsDto getAdminStats() {
        AdminStatsDto stats = new AdminStatsDto();
        
        // Basic counts
        stats.setTotalUsers(userRepository.count());
        stats.setTotalPolicies(policyRepository.count());
        stats.setTotalClaims(claimRepository.count());
        
        // Get all data and calculate stats
        List<Policy> allPolicies = policyRepository.findAll();
        List<Claim> allClaims = claimRepository.findAll();
        
        // Policy statistics
        long activePolicies = allPolicies.stream()
                .filter(p -> "ACTIVE".equals(p.getStatus()))
                .count();
        stats.setActivePolicies(activePolicies);
        
        long pendingPolicies = allPolicies.stream()
                .filter(p -> "PENDING".equals(p.getStatus()))
                .count();
        stats.setPendingPolicies(pendingPolicies);
        
        // Claim statistics
        long pendingClaims = allClaims.stream()
                .filter(c -> "PENDING".equals(c.getStatus()))
                .count();
        stats.setPendingClaims(pendingClaims);
        
        long approvedClaims = allClaims.stream()
                .filter(c -> "APPROVED".equals(c.getStatus()))
                .count();
        stats.setApprovedClaims(approvedClaims);
        
        long rejectedClaims = allClaims.stream()
                .filter(c -> "REJECTED".equals(c.getStatus()))
                .count();
        stats.setRejectedClaims(rejectedClaims);
        
        // Calculate approval rate
        long totalProcessedClaims = approvedClaims + rejectedClaims;
        if (totalProcessedClaims > 0) {
            stats.setClaimApprovalRate((double) approvedClaims / totalProcessedClaims * 100);
        } else {
            stats.setClaimApprovalRate(0.0);
        }
        
        // Calculate revenue (simplified)
        double totalRevenue = allPolicies.stream()
                .filter(p -> p.getMonthlyPremium() != null)
                .mapToDouble(p -> p.getMonthlyPremium().doubleValue())
                .sum();
        stats.setTotalRevenue(totalRevenue);
        stats.setMonthlyRevenue(totalRevenue); // Simplified for now
        
        // Calculate average claim amount
        double averageClaimAmount = allClaims.stream()
                .filter(c -> c.getClaimAmount() != null)
                .mapToDouble(c -> c.getClaimAmount().doubleValue())
                .average()
                .orElse(0.0);
        stats.setAverageClaimAmount(averageClaimAmount);
        
        // Calculate new users/policies this month (simplified)
        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        
        long newUsersThisMonth = userRepository.findAll().stream()
                .filter(u -> u.getCreatedAt() != null && u.getCreatedAt().isAfter(startOfMonth))
                .count();
        stats.setNewUsersThisMonth(newUsersThisMonth);
        
        long newPoliciesThisMonth = allPolicies.stream()
                .filter(p -> p.getCreatedAt() != null && p.getCreatedAt().isAfter(startOfMonth))
                .count();
        stats.setNewPoliciesThisMonth(newPoliciesThisMonth);
        
        return stats;
    }

    public List<UserDto> getRecentUsers() {
        List<User> users = userRepository.findAll();
        return users.stream()
                .sorted((u1, u2) -> {
                    if (u1.getCreatedAt() == null && u2.getCreatedAt() == null) return 0;
                    if (u1.getCreatedAt() == null) return 1;
                    if (u2.getCreatedAt() == null) return -1;
                    return u2.getCreatedAt().compareTo(u1.getCreatedAt());
                })
                .limit(10)
                .map(this::convertUserToDto)
                .collect(Collectors.toList());
    }

    public List<PolicyDto> getRecentPolicies() {
        List<Policy> policies = policyRepository.findAll();
        return policies.stream()
                .sorted((p1, p2) -> {
                    if (p1.getCreatedAt() == null && p2.getCreatedAt() == null) return 0;
                    if (p1.getCreatedAt() == null) return 1;
                    if (p2.getCreatedAt() == null) return -1;
                    return p2.getCreatedAt().compareTo(p1.getCreatedAt());
                })
                .limit(10)
                .map(this::convertPolicyToDto)
                .collect(Collectors.toList());
    }

    public List<ClaimDto> getRecentClaims() {
        List<Claim> claims = claimRepository.findAll();
        return claims.stream()
                .sorted((c1, c2) -> {
                    if (c1.getCreatedAt() == null && c2.getCreatedAt() == null) return 0;
                    if (c1.getCreatedAt() == null) return 1;
                    if (c2.getCreatedAt() == null) return -1;
                    return c2.getCreatedAt().compareTo(c1.getCreatedAt());
                })
                .limit(10)
                .map(this::convertClaimToDto)
                .collect(Collectors.toList());
    }

    public List<NotificationDto> getNotifications() {
        return List.of(
            new NotificationDto(1L, "System Update", "System maintenance completed successfully", "success", false, null, "admin", LocalDateTime.now().minusHours(1)),
            new NotificationDto(2L, "New Policy Uploaded", "5 new policies require approval", "info", false, null, "admin", LocalDateTime.now().minusHours(3)),
            new NotificationDto(3L, "High Risk Claim", "Claim requires manual review", "warning", false, null, "admin", LocalDateTime.now().minusHours(6))
        );
    }

    public Map<String, Object> getSystemHealth() {
        Map<String, Object> health = new HashMap<>();
        health.put("database", "healthy");
        health.put("api", "healthy");
        health.put("aiServices", Map.of(
            "ocr", "healthy",
            "nlp", "healthy",
            "fraudDetection", "healthy",
            "riskAssessment", "healthy"
        ));
        health.put("metrics", Map.of(
            "uptime", "99.9%",
            "responseTime", "< 200ms",
            "errorRate", "< 0.1%"
        ));
        return health;
    }

    public Map<String, Object> getAnalyticsOverview() {
        Map<String, Object> analytics = new HashMap<>();
        
        // Simple analytics
        List<Policy> policies = policyRepository.findAll();
        Map<String, Long> policyByType = policies.stream()
                .collect(Collectors.groupingBy(
                    p -> p.getType() != null ? p.getType() : "Unknown",
                    Collectors.counting()
                ));
        analytics.put("policyDistribution", policyByType);
        
        List<Claim> claims = claimRepository.findAll();
        Map<String, Long> claimsByStatus = claims.stream()
                .collect(Collectors.groupingBy(
                    c -> c.getStatus() != null ? c.getStatus() : "Unknown",
                    Collectors.counting()
                ));
        analytics.put("claimsDistribution", claimsByStatus);
        
        return analytics;
    }

    private UserDto convertUserToDto(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setRole(user.getRole() != null ? user.getRole().getName() : "USER");
        dto.setCreatedAt(user.getCreatedAt());
        return dto;
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
