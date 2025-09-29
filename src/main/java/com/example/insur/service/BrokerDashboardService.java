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
        
        // Revenue by month (simplified - INR)
        Map<String, Double> revenueByMonth = Map.of(
            "Jan", 15000.0 * 83,
            "Feb", 18000.0 * 83,
            "Mar", 22000.0 * 83,
            "Apr", 25000.0 * 83,
            "May", 28000.0 * 83,
            "Jun", 30000.0 * 83
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
    
    /**
     * Get chart data for Broker Analytics Dashboard
     */
    public Map<String, Object> getBrokerChartData(String username) {
        User broker = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Broker not found: " + username));
        
        Map<String, Object> chartData = new HashMap<>();
        
        // Broker's Policy Performance Pie Chart
        chartData.put("policyPerformance", getBrokerPolicyPerformanceChart(broker.getId()));
        
        // Broker's Claims Status Pie Chart
        chartData.put("claimsStatus", getBrokerClaimsStatusChart(broker.getId()));
        
        // Policy Types Distribution
        chartData.put("policyTypesDistribution", getBrokerPolicyTypesChart(broker.getId()));
        
        return chartData;
    }
    
    /**
     * Broker's Policy Performance Pie Chart Data
     */
    public List<Map<String, Object>> getBrokerPolicyPerformanceChart(Long brokerId) {
        User broker = userRepository.findById(brokerId)
                .orElseThrow(() -> new RuntimeException("Broker not found: " + brokerId));
        List<Policy> brokerPolicies = policyRepository.findByUploadedBy(broker);
        
        Map<String, Long> statusCount = brokerPolicies.stream()
                .collect(Collectors.groupingBy(Policy::getStatus, Collectors.counting()));
        
        return statusCount.entrySet().stream()
                .map(entry -> {
                    Map<String, Object> data = new HashMap<>();
                    data.put("name", entry.getKey());
                    data.put("value", entry.getValue());
                    data.put("percentage", String.format("%.1f%%", (double) entry.getValue() / brokerPolicies.size() * 100));
                    return data;
                })
                .collect(Collectors.toList());
    }
    
    /**
     * Broker's Claims Status Pie Chart Data
     */
    public List<Map<String, Object>> getBrokerClaimsStatusChart(Long brokerId) {
        User broker = userRepository.findById(brokerId)
                .orElseThrow(() -> new RuntimeException("Broker not found: " + brokerId));
        List<Policy> brokerPolicies = policyRepository.findByUploadedBy(broker);
        List<Long> policyIds = brokerPolicies.stream().map(Policy::getId).collect(Collectors.toList());
        
        // Get claims for broker's policies
        List<Claim> brokerClaims = claimRepository.findAll().stream()
                .filter(claim -> policyIds.contains(claim.getUserPolicy().getPolicy().getId()))
                .collect(Collectors.toList());
        
        Map<String, Long> claimStatusCount = brokerClaims.stream()
                .collect(Collectors.groupingBy(Claim::getStatus, Collectors.counting()));
        
        return claimStatusCount.entrySet().stream()
                .map(entry -> {
                    Map<String, Object> data = new HashMap<>();
                    data.put("name", entry.getKey());
                    data.put("value", entry.getValue());
                    data.put("percentage", brokerClaims.size() > 0 ? 
                        String.format("%.1f%%", (double) entry.getValue() / brokerClaims.size() * 100) : "0.0%");
                    return data;
                })
                .collect(Collectors.toList());
    }
    
    /**
     * Broker's Monthly Commissions Bar Chart Data (INR)
     */
    public List<Map<String, Object>> getBrokerMonthlyCommissionsChart(Long brokerId) {
        List<Map<String, Object>> monthlyData = List.of(
                createBrokerMonthlyData("Jan", 12450.0 * 83, 8900.0 * 83, 15),
                createBrokerMonthlyData("Feb", 13670.0 * 83, 9500.0 * 83, 18),
                createBrokerMonthlyData("Mar", 15890.0 * 83, 11200.0 * 83, 22),
                createBrokerMonthlyData("Apr", 17320.0 * 83, 12100.0 * 83, 25),
                createBrokerMonthlyData("May", 16980.0 * 83, 11800.0 * 83, 24),
                createBrokerMonthlyData("Jun", 18450.0 * 83, 12900.0 * 83, 27),
                createBrokerMonthlyData("Jul", 19720.0 * 83, 13600.0 * 83, 29),
                createBrokerMonthlyData("Aug", 21080.0 * 83, 14500.0 * 83, 32),
                createBrokerMonthlyData("Sep", 22350.0 * 83, 15200.0 * 83, 34),
                createBrokerMonthlyData("Oct", 23890.0 * 83, 16100.0 * 83, 36),
                createBrokerMonthlyData("Nov", 25120.0 * 83, 17000.0 * 83, 38),
                createBrokerMonthlyData("Dec", 26780.0 * 83, 18200.0 * 83, 41)
        );
        
        return monthlyData;
    }
    
    private Map<String, Object> createBrokerMonthlyData(String month, Double commissions, Double target, Integer policies) {
        Map<String, Object> data = new HashMap<>();
        data.put("month", month);
        data.put("commissions", commissions);
        data.put("target", target);
        data.put("policiesSold", policies);
        data.put("achievementRate", String.format("%.1f%%", (commissions / target) * 100));
        return data;
    }
    
    /**
     * Broker's Client Acquisition Line Chart Data
     */
    public List<Map<String, Object>> getBrokerClientAcquisitionChart(Long brokerId) {
        List<Map<String, Object>> acquisitionData = List.of(
                createAcquisitionData("Jan", 15, 142, 8),
                createAcquisitionData("Feb", 18, 160, 12),
                createAcquisitionData("Mar", 22, 182, 15),
                createAcquisitionData("Apr", 25, 207, 18),
                createAcquisitionData("May", 24, 231, 17),
                createAcquisitionData("Jun", 27, 258, 21),
                createAcquisitionData("Jul", 29, 287, 23),
                createAcquisitionData("Aug", 32, 319, 26),
                createAcquisitionData("Sep", 34, 353, 28),
                createAcquisitionData("Oct", 36, 389, 31),
                createAcquisitionData("Nov", 38, 427, 33),
                createAcquisitionData("Dec", 41, 468, 36)
        );
        
        return acquisitionData;
    }
    
    private Map<String, Object> createAcquisitionData(String month, Integer newClients, Integer totalClients, Integer conversions) {
        Map<String, Object> data = new HashMap<>();
        data.put("month", month);
        data.put("newClients", newClients);
        data.put("totalClients", totalClients);
        data.put("conversions", conversions);
        data.put("conversionRate", String.format("%.1f%%", (double) conversions / newClients * 100));
        return data;
    }
    
    /**
     * Broker's Policy Types Distribution Chart Data
     */
    public List<Map<String, Object>> getBrokerPolicyTypesChart(Long brokerId) {
        User broker = userRepository.findById(brokerId)
                .orElseThrow(() -> new RuntimeException("Broker not found: " + brokerId));
        List<Policy> brokerPolicies = policyRepository.findByUploadedBy(broker);
        
        Map<String, Long> typeCount = brokerPolicies.stream()
                .collect(Collectors.groupingBy(Policy::getType, Collectors.counting()));
        
        return typeCount.entrySet().stream()
                .map(entry -> {
                    Map<String, Object> data = new HashMap<>();
                    data.put("name", entry.getKey());
                    data.put("value", entry.getValue());
                    data.put("percentage", String.format("%.1f%%", (double) entry.getValue() / brokerPolicies.size() * 100));
                    
                    // Add commission rates per policy type
                    double commissionRate = getCommissionRateByType(entry.getKey());
                    data.put("commissionRate", commissionRate);
                    data.put("estimatedCommission", entry.getValue() * commissionRate * 1000); // Estimated commission
                    
                    return data;
                })
                .collect(Collectors.toList());
    }
    
    private double getCommissionRateByType(String policyType) {
        return switch (policyType) {
            case "AUTO" -> 6640.0 * 83; // 0.08 * 83000 (avg policy value in INR)
            case "HEALTH" -> 9960.0 * 83; // 0.12 * 83000
            case "HOME" -> 8300.0 * 83; // 0.10 * 83000
            case "LIFE" -> 12450.0 * 83; // 0.15 * 83000
            case "BUSINESS" -> 14940.0 * 83; // 0.18 * 83000
            case "TRAVEL" -> 4980.0 * 83; // 0.06 * 83000
            default -> 8300.0 * 83;
        };
    }
    
    /**
     * Broker's Performance Metrics Bar Chart Data
     */
    public List<Map<String, Object>> getBrokerPerformanceMetricsChart(Long brokerId) {
        List<Map<String, Object>> performanceData = List.of(
                createPerformanceData("Sales Target", 85.5, 100.0, "Quarterly"),
                createPerformanceData("Client Satisfaction", 4.6, 5.0, "Rating"),
                createPerformanceData("Policy Renewal Rate", 87.3, 90.0, "Percentage"),
                createPerformanceData("Claim Processing", 92.1, 95.0, "Efficiency"),
                createPerformanceData("Lead Conversion", 78.9, 85.0, "Percentage"),
                createPerformanceData("Revenue Growth", 115.2, 110.0, "YoY %")
        );
        
        return performanceData;
    }
    
    private Map<String, Object> createPerformanceData(String metric, Double actual, Double target, String unit) {
        Map<String, Object> data = new HashMap<>();
        data.put("metric", metric);
        data.put("actual", actual);
        data.put("target", target);
        data.put("unit", unit);
        data.put("achievementRate", String.format("%.1f%%", (actual / target) * 100));
        data.put("status", actual >= target ? "Achieved" : "In Progress");
        return data;
    }
}
