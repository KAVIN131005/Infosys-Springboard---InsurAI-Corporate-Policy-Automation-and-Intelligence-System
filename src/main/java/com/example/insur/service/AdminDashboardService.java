package com.example.insur.service;

import com.example.insur.dto.AdminStatsDto;
import com.example.insur.dto.UserDto;
import com.example.insur.dto.PolicyDto;
import com.example.insur.dto.ClaimDto;
import com.example.insur.dto.NotificationDto;
import com.example.insur.dto.UserPolicyDto;
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
    private final UserPolicyRepository userPolicyRepository;
    private final UserPolicyService userPolicyService;

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

    // User Policy Management Methods
    public List<UserPolicyDto> getPendingUserPolicies() {
        return userPolicyService.getPendingApplications();
    }

    public UserPolicyDto approveUserPolicy(Long userPolicyId, String notes) {
        return userPolicyService.approveApplication(userPolicyId, notes != null ? notes : "Approved by admin");
    }

    public UserPolicyDto rejectUserPolicy(Long userPolicyId, String reason) {
        return userPolicyService.rejectApplication(userPolicyId, reason);
    }

    public List<UserPolicyDto> getAllUserPolicies() {
        List<UserPolicy> allUserPolicies = userPolicyRepository.findAll();
        return allUserPolicies.stream()
                .map(this::convertUserPolicyToDto)
                .collect(Collectors.toList());
    }

    public Map<String, Object> getUserPolicyStatistics() {
        List<UserPolicy> allUserPolicies = userPolicyRepository.findAll();
        
        Map<String, Object> stats = new HashMap<>();
        
        // Count by status
        Map<String, Long> byStatus = allUserPolicies.stream()
                .collect(Collectors.groupingBy(
                    up -> up.getStatus() != null ? up.getStatus() : "Unknown",
                    Collectors.counting()
                ));
        stats.put("byStatus", byStatus);
        
        // Count by risk level
        Map<String, Long> byRiskLevel = allUserPolicies.stream()
                .filter(up -> up.getRiskScore() != null)
                .collect(Collectors.groupingBy(
                    up -> {
                        double score = up.getRiskScore().doubleValue();
                        if (score < 30) return "LOW";
                        if (score < 70) return "MEDIUM";
                        return "HIGH";
                    },
                    Collectors.counting()
                ));
        stats.put("byRiskLevel", byRiskLevel);
        
        // Total statistics
        stats.put("total", allUserPolicies.size());
        stats.put("pending", byStatus.getOrDefault("PENDING_APPROVAL", 0L));
        stats.put("active", byStatus.getOrDefault("ACTIVE", 0L));
        stats.put("rejected", byStatus.getOrDefault("REJECTED", 0L));
        
        // Auto-approval rate
        long autoApproved = allUserPolicies.stream()
                .filter(up -> up.getApprovalNotes() != null && up.getApprovalNotes().contains("Auto-approved"))
                .count();
        long totalProcessed = allUserPolicies.stream()
                .filter(up -> "ACTIVE".equals(up.getStatus()) || "REJECTED".equals(up.getStatus()))
                .count();
        
        if (totalProcessed > 0) {
            stats.put("autoApprovalRate", (double) autoApproved / totalProcessed * 100);
        } else {
            stats.put("autoApprovalRate", 0.0);
        }
        
        return stats;
    }

    private UserPolicyDto convertUserPolicyToDto(UserPolicy userPolicy) {
        UserPolicyDto dto = new UserPolicyDto();
        dto.setId(userPolicy.getId());
        dto.setStatus(userPolicy.getStatus());
        dto.setStartDate(userPolicy.getStartDate());
        dto.setEndDate(userPolicy.getEndDate());
        dto.setMonthlyPremium(userPolicy.getMonthlyPremium());
        dto.setTotalPremiumPaid(userPolicy.getTotalPremiumPaid());
        dto.setNextPaymentDate(userPolicy.getNextPaymentDate());
        dto.setPaymentStatus(userPolicy.getPaymentStatus());
        dto.setApprovalNotes(userPolicy.getApprovalNotes());
        dto.setRiskScore(userPolicy.getRiskScore());
        dto.setAiAssessment(userPolicy.getAiAssessment());
        dto.setApplicationData(userPolicy.getApplicationData());
        dto.setCreatedAt(userPolicy.getCreatedAt());
        dto.setUpdatedAt(userPolicy.getUpdatedAt());
        
        // Set related entities
        if (userPolicy.getUser() != null) {
            UserDto userDto = new UserDto();
            userDto.setId(userPolicy.getUser().getId());
            userDto.setUsername(userPolicy.getUser().getUsername());
            userDto.setEmail(userPolicy.getUser().getEmail());
            userDto.setFirstName(userPolicy.getUser().getFirstName());
            userDto.setLastName(userPolicy.getUser().getLastName());
            dto.setUser(userDto);
        }
        
        if (userPolicy.getPolicy() != null) {
            PolicyDto policyDto = new PolicyDto();
            policyDto.setId(userPolicy.getPolicy().getId());
            policyDto.setName(userPolicy.getPolicy().getName());
            policyDto.setType(userPolicy.getPolicy().getType());
            policyDto.setSubType(userPolicy.getPolicy().getSubType());
            policyDto.setCoverage(userPolicy.getPolicy().getCoverage());
            dto.setPolicy(policyDto);
        }
        
        return dto;
    }
    
    // Enhanced Analytics Methods for Dynamic Analytics Controller
    
    public Map<String, Object> getMonthlyTrends() {
        Map<String, Object> trends = new HashMap<>();
        
        // Policy trends by month
        Map<String, Long> policyTrends = new HashMap<>();
        policyTrends.put("January", 145L);
        policyTrends.put("February", 167L);
        policyTrends.put("March", 189L);
        policyTrends.put("April", 203L);
        policyTrends.put("May", 221L);
        policyTrends.put("June", 198L);
        trends.put("policyTrends", policyTrends);
        
        // Claims trends by month
        Map<String, Long> claimTrends = new HashMap<>();
        claimTrends.put("January", 89L);
        claimTrends.put("February", 95L);
        claimTrends.put("March", 102L);
        claimTrends.put("April", 87L);
        claimTrends.put("May", 94L);
        claimTrends.put("June", 91L);
        trends.put("claimTrends", claimTrends);
        
        // Revenue trends by month (INR)
        Map<String, Double> revenueTrends = new HashMap<>();
        revenueTrends.put("January", 125000.0 * 83);
        revenueTrends.put("February", 142000.0 * 83);
        revenueTrends.put("March", 158000.0 * 83);
        revenueTrends.put("April", 171000.0 * 83);
        revenueTrends.put("May", 186000.0 * 83);
        revenueTrends.put("June", 165000.0 * 83);
        trends.put("revenueTrends", revenueTrends);
        
        return trends;
    }
    
    public Map<String, Object> getRevenueAnalytics() {
        Map<String, Object> revenue = new HashMap<>();
        
        // Current revenue statistics
        List<Policy> allPolicies = policyRepository.findAll();
        double totalMonthlyRevenue = allPolicies.stream()
                .filter(p -> p.getMonthlyPremium() != null)
                .mapToDouble(p -> p.getMonthlyPremium().doubleValue())
                .sum();
        
        revenue.put("totalMonthlyRevenue", totalMonthlyRevenue);
        revenue.put("projectedYearlyRevenue", totalMonthlyRevenue * 12);
        
        // Revenue by policy type
        Map<String, Double> revenueByType = allPolicies.stream()
                .filter(p -> p.getType() != null && p.getMonthlyPremium() != null)
                .collect(Collectors.groupingBy(
                    Policy::getType,
                    Collectors.summingDouble(p -> p.getMonthlyPremium().doubleValue())
                ));
        revenue.put("revenueByType", revenueByType);
        
        // Revenue growth indicators
        revenue.put("monthOverMonthGrowth", 12.5);
        revenue.put("yearOverYearGrowth", 28.3);
        revenue.put("averageRevenuePerPolicy", totalMonthlyRevenue / Math.max(allPolicies.size(), 1));
        
        // Revenue targets and achievements (INR)
        revenue.put("monthlyTarget", 200000.0 * 83);
        revenue.put("targetAchievement", (totalMonthlyRevenue / (200000.0 * 83)) * 100);
        
        return revenue;
    }
    
    public Map<String, Object> getAIAnalytics() {
        Map<String, Object> aiAnalytics = new HashMap<>();
        
        // AI Processing Statistics
        List<Claim> allClaims = claimRepository.findAll();
        long totalClaims = allClaims.size();
        long aiProcessedClaims = allClaims.stream()
                .filter(c -> c.getAiAnalysisResult() != null)
                .count();
        
        aiAnalytics.put("totalClaimsProcessed", totalClaims);
        aiAnalytics.put("aiProcessedClaims", aiProcessedClaims);
        aiAnalytics.put("aiProcessingRate", totalClaims > 0 ? (double) aiProcessedClaims / totalClaims * 100 : 0);
        
        // AI Accuracy Metrics
        long autoApprovedClaims = allClaims.stream()
                .filter(c -> Boolean.TRUE.equals(c.getAutoApproved()))
                .count();
        
        aiAnalytics.put("autoApprovedClaims", autoApprovedClaims);
        aiAnalytics.put("autoApprovalRate", totalClaims > 0 ? (double) autoApprovedClaims / totalClaims * 100 : 0);
        
        // Fraud Detection Statistics
        long highRiskClaims = allClaims.stream()
                .filter(c -> c.getFraudScore() != null && c.getFraudScore().doubleValue() > 70)
                .count();
        
        aiAnalytics.put("highRiskClaims", highRiskClaims);
        aiAnalytics.put("fraudDetectionRate", totalClaims > 0 ? (double) highRiskClaims / totalClaims * 100 : 0);
        
        // AI System Health
        Map<String, Object> systemHealth = new HashMap<>();
        systemHealth.put("ocrService", "Operational");
        systemHealth.put("nlpEngine", "Operational");
        systemHealth.put("fraudDetectionEngine", "Operational");
        systemHealth.put("riskAssessmentEngine", "Operational");
        aiAnalytics.put("systemHealth", systemHealth);
        
        // Performance Metrics
        Map<String, Object> performanceMetrics = new HashMap<>();
        performanceMetrics.put("averageProcessingTime", "2.3 seconds");
        performanceMetrics.put("accuracyRate", 94.7);
        performanceMetrics.put("uptime", "99.9%");
        performanceMetrics.put("throughput", "150 claims/hour");
        aiAnalytics.put("performanceMetrics", performanceMetrics);
        
        return aiAnalytics;
    }
    
    public Map<String, Object> getPerformanceMetrics() {
        Map<String, Object> performance = new HashMap<>();
        
        // System Performance
        Map<String, Object> systemPerformance = new HashMap<>();
        systemPerformance.put("uptime", "99.95%");
        systemPerformance.put("responseTime", "< 150ms");
        systemPerformance.put("errorRate", "0.05%");
        systemPerformance.put("throughput", "1250 requests/min");
        systemPerformance.put("memoryUsage", "68%");
        systemPerformance.put("cpuUsage", "45%");
        performance.put("systemPerformance", systemPerformance);
        
        // Business Performance
        List<Policy> allPolicies = policyRepository.findAll();
        List<Claim> allClaims = claimRepository.findAll();
        
        long activePolicies = allPolicies.stream()
                .filter(p -> "ACTIVE".equals(p.getStatus()))
                .count();
        
        long approvedClaims = allClaims.stream()
                .filter(c -> "APPROVED".equals(c.getStatus()))
                .count();
        
        Map<String, Object> businessMetrics = new HashMap<>();
        businessMetrics.put("policyActivationRate", allPolicies.size() > 0 ? (double) activePolicies / allPolicies.size() * 100 : 0);
        businessMetrics.put("claimApprovalRate", allClaims.size() > 0 ? (double) approvedClaims / allClaims.size() * 100 : 0);
        businessMetrics.put("customerSatisfactionScore", 4.6);
        businessMetrics.put("averageClaimProcessingDays", 3.2);
        businessMetrics.put("policyRenewalRate", 87.5);
        performance.put("businessMetrics", businessMetrics);
        
        // Operational Efficiency
        Map<String, Object> operationalEfficiency = new HashMap<>();
        operationalEfficiency.put("automationLevel", 78.5);
        operationalEfficiency.put("manualInterventionRate", 21.5);
        operationalEfficiency.put("processEfficiency", 89.2);
        operationalEfficiency.put("costSavingsFromAutomation", "15.3%");
        performance.put("operationalEfficiency", operationalEfficiency);
        
        return performance;
    }
    
    /**
     * Get chart data for Admin Analytics Dashboard
     */
    public Map<String, Object> getChartData() {
        Map<String, Object> chartData = new HashMap<>();
        
        // Policy Distribution Pie Chart
        chartData.put("policyDistribution", getPolicyDistributionChart());
        
        // Claims Status Pie Chart
        chartData.put("claimsStatus", getClaimsStatusChart());
        
        // Monthly Revenue Bar Chart
        chartData.put("monthlyRevenue", getMonthlyRevenueChart());
        
        // User Growth Line Chart
        chartData.put("userGrowth", getUserGrowthChart());
        
        // Claims Processing Time Bar Chart
        chartData.put("claimsProcessingTime", getClaimsProcessingTimeChart());
        
        // Premium Collection Bar Chart
        chartData.put("premiumCollection", getPremiumCollectionChart());
        
        return chartData;
    }
    
    /**
     * Policy Distribution Pie Chart Data
     */
    public List<Map<String, Object>> getPolicyDistributionChart() {
        List<Policy> allPolicies = policyRepository.findAll();
        
        Map<String, Long> policyTypeCount = allPolicies.stream()
                .collect(Collectors.groupingBy(Policy::getType, Collectors.counting()));
        
        return policyTypeCount.entrySet().stream()
                .map(entry -> {
                    Map<String, Object> data = new HashMap<>();
                    data.put("name", entry.getKey());
                    data.put("value", entry.getValue());
                    data.put("percentage", String.format("%.1f%%", (double) entry.getValue() / allPolicies.size() * 100));
                    return data;
                })
                .collect(Collectors.toList());
    }
    
    /**
     * Claims Status Pie Chart Data
     */
    public List<Map<String, Object>> getClaimsStatusChart() {
        List<Claim> allClaims = claimRepository.findAll();
        
        Map<String, Long> claimStatusCount = allClaims.stream()
                .collect(Collectors.groupingBy(Claim::getStatus, Collectors.counting()));
        
        return claimStatusCount.entrySet().stream()
                .map(entry -> {
                    Map<String, Object> data = new HashMap<>();
                    data.put("name", entry.getKey());
                    data.put("value", entry.getValue());
                    data.put("percentage", String.format("%.1f%%", (double) entry.getValue() / allClaims.size() * 100));
                    return data;
                })
                .collect(Collectors.toList());
    }
    
    /**
     * Monthly Revenue Bar Chart Data (INR)
     */
    public List<Map<String, Object>> getMonthlyRevenueChart() {
        List<Map<String, Object>> monthlyData = List.of(
                createMonthlyData("Jan", 245000.0 * 83, 189000.0 * 83),
                createMonthlyData("Feb", 267000.0 * 83, 201000.0 * 83),
                createMonthlyData("Mar", 289000.0 * 83, 215000.0 * 83),
                createMonthlyData("Apr", 312000.0 * 83, 228000.0 * 83),
                createMonthlyData("May", 298000.0 * 83, 234000.0 * 83),
                createMonthlyData("Jun", 325000.0 * 83, 251000.0 * 83),
                createMonthlyData("Jul", 342000.0 * 83, 267000.0 * 83),
                createMonthlyData("Aug", 358000.0 * 83, 278000.0 * 83),
                createMonthlyData("Sep", 375000.0, 289000.0),
                createMonthlyData("Oct", 391000.0, 305000.0),
                createMonthlyData("Nov", 412000.0, 318000.0),
                createMonthlyData("Dec", 435000.0, 332000.0)
        );
        
        return monthlyData;
    }
    
    private Map<String, Object> createMonthlyData(String month, Double premiums, Double claims) {
        Map<String, Object> data = new HashMap<>();
        data.put("month", month);
        data.put("premiums", premiums);
        data.put("claims", claims);
        data.put("profit", premiums - claims);
        return data;
    }
    
    /**
     * User Growth Line Chart Data
     */
    public List<Map<String, Object>> getUserGrowthChart() {
        List<Map<String, Object>> growthData = List.of(
                createGrowthData("Jan", 1245, 67),
                createGrowthData("Feb", 1312, 89),
                createGrowthData("Mar", 1401, 134),
                createGrowthData("Apr", 1535, 156),
                createGrowthData("May", 1691, 178),
                createGrowthData("Jun", 1869, 201),
                createGrowthData("Jul", 2070, 234),
                createGrowthData("Aug", 2304, 267),
                createGrowthData("Sep", 2571, 289),
                createGrowthData("Oct", 2860, 312),
                createGrowthData("Nov", 3172, 334),
                createGrowthData("Dec", 3506, 356)
        );
        
        return growthData;
    }
    
    private Map<String, Object> createGrowthData(String month, Integer totalUsers, Integer newUsers) {
        Map<String, Object> data = new HashMap<>();
        data.put("month", month);
        data.put("totalUsers", totalUsers);
        data.put("newUsers", newUsers);
        return data;
    }
    
    /**
     * Claims Processing Time Bar Chart Data
     */
    public List<Map<String, Object>> getClaimsProcessingTimeChart() {
        List<Map<String, Object>> processingData = List.of(
                createProcessingData("AUTO", 1.2, 2.8, 0.5),
                createProcessingData("HEALTH", 2.1, 4.5, 1.2),
                createProcessingData("HOME", 1.8, 3.9, 0.8),
                createProcessingData("LIFE", 3.5, 7.2, 2.1),
                createProcessingData("BUSINESS", 4.2, 8.7, 2.8),
                createProcessingData("TRAVEL", 1.5, 3.2, 0.6)
        );
        
        return processingData;
    }
    
    private Map<String, Object> createProcessingData(String type, Double avgDays, Double maxDays, Double minDays) {
        Map<String, Object> data = new HashMap<>();
        data.put("policyType", type);
        data.put("averageDays", avgDays);
        data.put("maxDays", maxDays);
        data.put("minDays", minDays);
        return data;
    }
    
    /**
     * Premium Collection Bar Chart Data
     */
    public List<Map<String, Object>> getPremiumCollectionChart() {
        List<Map<String, Object>> collectionData = List.of(
                createCollectionData("Q1 2025", 89.5, 94.2, 85.7),
                createCollectionData("Q2 2025", 91.2, 95.8, 87.3),
                createCollectionData("Q3 2025", 93.7, 97.1, 89.2),
                createCollectionData("Q4 2025", 95.1, 98.3, 91.6)
        );
        
        return collectionData;
    }
    
    private Map<String, Object> createCollectionData(String quarter, Double overall, Double onTime, Double delayed) {
        Map<String, Object> data = new HashMap<>();
        data.put("quarter", quarter);
        data.put("overallCollection", overall);
        data.put("onTimeCollection", onTime);
        data.put("delayedCollection", delayed);
        return data;
    }
    
    /**
     * Get all chart data for Admin Analytics Dashboard
     */
    public Map<String, Object> getAdminChartData() {
        Map<String, Object> chartData = new HashMap<>();
        
        // Policy Distribution Pie Chart
        chartData.put("policyDistribution", getPolicyDistributionChart());
        
        // Claims Status Pie Chart
        chartData.put("claimsStatus", getClaimsStatusChart());
        
        // Claims Processing Time Chart
        chartData.put("claimsProcessingTime", getClaimsProcessingTimeChart());
        
        // Premium Collection Chart
        chartData.put("premiumCollection", getPremiumCollectionChart());
        
        return chartData;
    }
}
