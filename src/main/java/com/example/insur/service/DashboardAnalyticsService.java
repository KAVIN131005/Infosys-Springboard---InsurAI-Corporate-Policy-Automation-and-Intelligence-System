package com.example.insur.service;

import com.example.insur.entity.*;
import com.example.insur.repository.*;
import com.example.insur.dto.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardAnalyticsService {

    @Autowired
    private PolicyRepository policyRepository;

    @Autowired
    private UserPolicyRepository userPolicyRepository;

    @Autowired
    private ClaimRepository claimRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    public Map<String, Object> getAdminDashboardData() {
        Map<String, Object> dashboard = new HashMap<>();
        
        // Basic counts
        dashboard.put("totalUsers", userRepository.count());
        dashboard.put("totalPolicies", policyRepository.count());
        dashboard.put("activePolicies", policyRepository.findByStatus("ACTIVE").size());
        dashboard.put("pendingPolicies", policyRepository.findByStatus("PENDING").size());
        dashboard.put("totalClaims", claimRepository.count());
        dashboard.put("pendingClaims", claimRepository.findByStatus("UNDER_REVIEW").size());
        
        // Revenue analytics
        List<UserPolicy> activePolicies = userPolicyRepository.findByStatus("ACTIVE");
        BigDecimal monthlyRevenue = activePolicies.stream()
                .map(UserPolicy::getMonthlyPremium)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        dashboard.put("monthlyRevenue", monthlyRevenue);
        
        // Policy type distribution
        Map<String, Long> policyTypeDistribution = policyRepository.findAll().stream()
                .collect(Collectors.groupingBy(Policy::getType, Collectors.counting()));
        dashboard.put("policyTypeDistribution", policyTypeDistribution);
        
        // Risk level distribution
        Map<String, Long> riskDistribution = policyRepository.findAll().stream()
                .collect(Collectors.groupingBy(Policy::getRiskLevel, Collectors.counting()));
        dashboard.put("riskDistribution", riskDistribution);
        
        // Recent activities
        List<Map<String, Object>> recentPolicies = policyRepository.findAll().stream()
                .sorted((p1, p2) -> p2.getCreatedAt().compareTo(p1.getCreatedAt()))
                .limit(5)
                .map(this::policyToActivityMap)
                .collect(Collectors.toList());
        dashboard.put("recentPolicies", recentPolicies);
        
        List<Map<String, Object>> recentClaims = claimRepository.findAll().stream()
                .sorted((c1, c2) -> c2.getCreatedAt().compareTo(c1.getCreatedAt()))
                .limit(5)
                .map(this::claimToActivityMap)
                .collect(Collectors.toList());
        dashboard.put("recentClaims", recentClaims);
        
        // Claim analytics
        Map<String, Object> claimAnalytics = getClaimAnalytics();
        dashboard.put("claimAnalytics", claimAnalytics);
        
        // Growth trends (last 6 months)
        Map<String, Object> growthTrends = getGrowthTrends();
        dashboard.put("growthTrends", growthTrends);
        
        return dashboard;
    }

    public Map<String, Object> getBrokerDashboardData(Long brokerId) {
        Map<String, Object> dashboard = new HashMap<>();
        
        User broker = userRepository.findById(brokerId).orElseThrow();
        
        // Broker's policies
        List<Policy> brokerPolicies = policyRepository.findByBroker(broker);
        dashboard.put("totalPolicies", brokerPolicies.size());
        dashboard.put("activePolicies", brokerPolicies.stream().mapToLong(p -> "ACTIVE".equals(p.getStatus()) ? 1 : 0).sum());
        dashboard.put("pendingPolicies", brokerPolicies.stream().mapToLong(p -> "PENDING".equals(p.getStatus()) ? 1 : 0).sum());
        
        // Client count (users who applied for broker's policies)
        Set<User> clients = new HashSet<>();
        for (Policy policy : brokerPolicies) {
            List<UserPolicy> userPolicies = userPolicyRepository.findByPolicy(policy);
            clients.addAll(userPolicies.stream().map(UserPolicy::getUser).collect(Collectors.toSet()));
        }
        dashboard.put("totalClients", clients.size());
        
        // Revenue from broker's policies
        BigDecimal monthlyRevenue = BigDecimal.ZERO;
        for (Policy policy : brokerPolicies) {
            List<UserPolicy> activePolicies = userPolicyRepository.findByPolicy(policy).stream()
                    .filter(up -> "ACTIVE".equals(up.getStatus()))
                    .collect(Collectors.toList());
            for (UserPolicy up : activePolicies) {
                if (up.getMonthlyPremium() != null) {
                    monthlyRevenue = monthlyRevenue.add(up.getMonthlyPremium());
                }
            }
        }
        dashboard.put("monthlyRevenue", monthlyRevenue);
        
        // Policy performance
        Map<String, Long> policyPerformance = brokerPolicies.stream()
                .collect(Collectors.groupingBy(Policy::getStatus, Collectors.counting()));
        dashboard.put("policyPerformance", policyPerformance);
        
        // Recent activities
        List<Map<String, Object>> recentActivities = brokerPolicies.stream()
                .sorted((p1, p2) -> p2.getCreatedAt().compareTo(p1.getCreatedAt()))
                .limit(10)
                .map(this::policyToActivityMap)
                .collect(Collectors.toList());
        dashboard.put("recentActivities", recentActivities);
        
        return dashboard;
    }

    public Map<String, Object> getUserDashboardData(Long userId) {
        Map<String, Object> dashboard = new HashMap<>();
        
        User user = userRepository.findById(userId).orElseThrow();
        
        // User's policies
        List<UserPolicy> userPolicies = userPolicyRepository.findByUser(user);
        dashboard.put("totalPolicies", userPolicies.size());
        dashboard.put("activePolicies", userPolicies.stream().mapToLong(up -> "ACTIVE".equals(up.getStatus()) ? 1 : 0).sum());
        dashboard.put("pendingApprovals", userPolicies.stream().mapToLong(up -> "PENDING_APPROVAL".equals(up.getStatus()) ? 1 : 0).sum());
        
        // User's claims
        List<Claim> userClaims = claimRepository.findBySubmittedBy(user);
        dashboard.put("totalClaims", userClaims.size());
        dashboard.put("approvedClaims", userClaims.stream().mapToLong(c -> "APPROVED".equals(c.getStatus()) ? 1 : 0).sum());
        dashboard.put("pendingClaims", userClaims.stream().mapToLong(c -> "UNDER_REVIEW".equals(c.getStatus()) ? 1 : 0).sum());
        
        // Premium payments
        BigDecimal totalPremiumPaid = userPolicies.stream()
                .map(UserPolicy::getTotalPremiumPaid)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        dashboard.put("totalPremiumPaid", totalPremiumPaid);
        
        BigDecimal monthlyPremium = userPolicies.stream()
                .filter(up -> "ACTIVE".equals(up.getStatus()))
                .map(UserPolicy::getMonthlyPremium)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        dashboard.put("monthlyPremium", monthlyPremium);
        
        // Coverage summary
        BigDecimal totalCoverage = userPolicies.stream()
                .filter(up -> "ACTIVE".equals(up.getStatus()))
                .map(up -> up.getPolicy().getCoverage())
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        dashboard.put("totalCoverage", totalCoverage);
        
        // Policy types
        Map<String, Long> policyTypes = userPolicies.stream()
                .filter(up -> "ACTIVE".equals(up.getStatus()))
                .map(up -> up.getPolicy().getType())
                .collect(Collectors.groupingBy(type -> type, Collectors.counting()));
        dashboard.put("policyTypes", policyTypes);
        
        // Recent activities
        List<Map<String, Object>> recentActivities = new ArrayList<>();
        
        // Add recent policies
        userPolicies.stream()
                .sorted((up1, up2) -> up2.getCreatedAt().compareTo(up1.getCreatedAt()))
                .limit(3)
                .forEach(up -> {
                    Map<String, Object> activity = new HashMap<>();
                    activity.put("type", "POLICY");
                    activity.put("action", "Applied for " + up.getPolicy().getName());
                    activity.put("date", up.getCreatedAt());
                    activity.put("status", up.getStatus());
                    recentActivities.add(activity);
                });
        
        // Add recent claims
        userClaims.stream()
                .sorted((c1, c2) -> c2.getCreatedAt().compareTo(c1.getCreatedAt()))
                .limit(3)
                .forEach(claim -> {
                    Map<String, Object> activity = new HashMap<>();
                    activity.put("type", "CLAIM");
                    activity.put("action", "Submitted claim " + claim.getClaimNumber());
                    activity.put("date", claim.getCreatedAt());
                    activity.put("status", claim.getStatus());
                    activity.put("amount", claim.getClaimAmount());
                    recentActivities.add(activity);
                });
        
        // Sort activities by date
        recentActivities.sort((a1, a2) -> {
            LocalDateTime date1 = (LocalDateTime) a1.get("date");
            LocalDateTime date2 = (LocalDateTime) a2.get("date");
            return date2.compareTo(date1);
        });
        
        dashboard.put("recentActivities", recentActivities.stream().limit(5).collect(Collectors.toList()));
        
        return dashboard;
    }

    public Map<String, Object> getAnalyticsDashboard() {
        Map<String, Object> analytics = new HashMap<>();
        
        // Revenue trends
        Map<String, Object> revenueTrends = getRevenueTrends();
        analytics.put("revenueTrends", revenueTrends);
        
        // Policy trends
        Map<String, Object> policyTrends = getPolicyTrends();
        analytics.put("policyTrends", policyTrends);
        
        // Claim trends
        Map<String, Object> claimTrends = getClaimTrends();
        analytics.put("claimTrends", claimTrends);
        
        // Risk analysis
        Map<String, Object> riskAnalysis = getRiskAnalysis();
        analytics.put("riskAnalysis", riskAnalysis);
        
        // Performance metrics
        Map<String, Object> performanceMetrics = getPerformanceMetrics();
        analytics.put("performanceMetrics", performanceMetrics);
        
        return analytics;
    }

    private Map<String, Object> policyToActivityMap(Policy policy) {
        Map<String, Object> activity = new HashMap<>();
        activity.put("id", policy.getId());
        activity.put("name", policy.getName());
        activity.put("type", policy.getType());
        activity.put("status", policy.getStatus());
        activity.put("premium", policy.getMonthlyPremium());
        activity.put("createdAt", policy.getCreatedAt());
        activity.put("broker", policy.getBroker() != null ? policy.getBroker().getUsername() : "System");
        return activity;
    }

    private Map<String, Object> claimToActivityMap(Claim claim) {
        Map<String, Object> activity = new HashMap<>();
        activity.put("id", claim.getId());
        activity.put("claimNumber", claim.getClaimNumber());
        activity.put("type", claim.getType());
        activity.put("status", claim.getStatus());
        activity.put("amount", claim.getClaimAmount());
        activity.put("approvedAmount", claim.getApprovedAmount());
        activity.put("createdAt", claim.getCreatedAt());
        activity.put("submittedBy", claim.getSubmittedBy().getUsername());
        return activity;
    }

    private Map<String, Object> getClaimAnalytics() {
        Map<String, Object> analytics = new HashMap<>();
        
        List<Claim> allClaims = claimRepository.findAll();
        
        // Claim status distribution
        Map<String, Long> statusDistribution = allClaims.stream()
                .collect(Collectors.groupingBy(Claim::getStatus, Collectors.counting()));
        analytics.put("statusDistribution", statusDistribution);
        
        // Average claim amount
        BigDecimal avgClaimAmount = allClaims.stream()
                .map(Claim::getClaimAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(BigDecimal.valueOf(Math.max(allClaims.size(), 1)), 2, BigDecimal.ROUND_HALF_UP);
        analytics.put("averageClaimAmount", avgClaimAmount);
        
        // Approval rate
        long approvedClaims = allClaims.stream().mapToLong(c -> "APPROVED".equals(c.getStatus()) ? 1 : 0).sum();
        double approvalRate = allClaims.isEmpty() ? 0 : (double) approvedClaims / allClaims.size() * 100;
        analytics.put("approvalRate", approvalRate);
        
        return analytics;
    }

    private Map<String, Object> getGrowthTrends() {
        Map<String, Object> trends = new HashMap<>();
        
        LocalDate sixMonthsAgo = LocalDate.now().minusMonths(6);
        
        // Policy growth
        long policiesLast6Months = policyRepository.findAll().stream()
                .mapToLong(p -> p.getCreatedAt().toLocalDate().isAfter(sixMonthsAgo) ? 1 : 0)
                .sum();
        trends.put("policiesLast6Months", policiesLast6Months);
        
        // User growth
        long usersLast6Months = userRepository.findAll().stream()
                .mapToLong(u -> u.getCreatedAt().toLocalDate().isAfter(sixMonthsAgo) ? 1 : 0)
                .sum();
        trends.put("usersLast6Months", usersLast6Months);
        
        return trends;
    }

    private Map<String, Object> getRevenueTrends() {
        Map<String, Object> trends = new HashMap<>();
        
        // Monthly revenue for last 12 months
        Map<String, BigDecimal> monthlyRevenue = new LinkedHashMap<>();
        LocalDate startDate = LocalDate.now().minusMonths(11).withDayOfMonth(1);
        
        for (int i = 0; i < 12; i++) {
            LocalDate monthStart = startDate.plusMonths(i);
            LocalDate monthEnd = monthStart.plusMonths(1).minusDays(1);
            
            BigDecimal monthRevenue = userPolicyRepository.findAll().stream()
                    .filter(up -> "ACTIVE".equals(up.getStatus()))
                    .filter(up -> up.getStartDate() != null && 
                            !up.getStartDate().isBefore(monthStart) && 
                            !up.getStartDate().isAfter(monthEnd))
                    .map(UserPolicy::getMonthlyPremium)
                    .filter(Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            monthlyRevenue.put(monthStart.getMonth().toString(), monthRevenue);
        }
        
        trends.put("monthlyRevenue", monthlyRevenue);
        return trends;
    }

    private Map<String, Object> getPolicyTrends() {
        Map<String, Object> trends = new HashMap<>();
        
        // Policy creation trends
        Map<String, Long> monthlyPolicies = new LinkedHashMap<>();
        LocalDate startDate = LocalDate.now().minusMonths(11).withDayOfMonth(1);
        
        for (int i = 0; i < 12; i++) {
            LocalDate monthStart = startDate.plusMonths(i);
            LocalDate monthEnd = monthStart.plusMonths(1).minusDays(1);
            
            long monthPolicies = policyRepository.findAll().stream()
                    .mapToLong(p -> {
                        LocalDate policyDate = p.getCreatedAt().toLocalDate();
                        return (!policyDate.isBefore(monthStart) && !policyDate.isAfter(monthEnd)) ? 1 : 0;
                    })
                    .sum();
            
            monthlyPolicies.put(monthStart.getMonth().toString(), monthPolicies);
        }
        
        trends.put("monthlyPolicies", monthlyPolicies);
        return trends;
    }

    private Map<String, Object> getClaimTrends() {
        Map<String, Object> trends = new HashMap<>();
        
        // Claim submission trends
        Map<String, Long> monthlyClaims = new LinkedHashMap<>();
        LocalDate startDate = LocalDate.now().minusMonths(11).withDayOfMonth(1);
        
        for (int i = 0; i < 12; i++) {
            LocalDate monthStart = startDate.plusMonths(i);
            LocalDate monthEnd = monthStart.plusMonths(1).minusDays(1);
            
            long monthClaims = claimRepository.findAll().stream()
                    .mapToLong(c -> {
                        LocalDate claimDate = c.getCreatedAt().toLocalDate();
                        return (!claimDate.isBefore(monthStart) && !claimDate.isAfter(monthEnd)) ? 1 : 0;
                    })
                    .sum();
            
            monthlyClaims.put(monthStart.getMonth().toString(), monthClaims);
        }
        
        trends.put("monthlyClaims", monthlyClaims);
        return trends;
    }

    private Map<String, Object> getRiskAnalysis() {
        Map<String, Object> analysis = new HashMap<>();
        
        // Risk distribution across user policies
        Map<String, Long> riskDistribution = userPolicyRepository.findAll().stream()
                .filter(up -> up.getRiskScore() != null)
                .collect(Collectors.groupingBy(up -> {
                    BigDecimal score = up.getRiskScore();
                    if (score.compareTo(new BigDecimal("30")) <= 0) return "LOW";
                    else if (score.compareTo(new BigDecimal("70")) <= 0) return "MEDIUM";
                    else return "HIGH";
                }, Collectors.counting()));
        
        analysis.put("riskDistribution", riskDistribution);
        return analysis;
    }

    private Map<String, Object> getPerformanceMetrics() {
        Map<String, Object> metrics = new HashMap<>();
        
        // Policy approval rate
        long totalPolicies = policyRepository.count();
        long approvedPolicies = policyRepository.findByStatus("ACTIVE").size();
        double policyApprovalRate = totalPolicies == 0 ? 0 : (double) approvedPolicies / totalPolicies * 100;
        metrics.put("policyApprovalRate", policyApprovalRate);
        
        // Average processing time (mock data)
        metrics.put("averageProcessingDays", 3.5);
        
        // Customer satisfaction (mock data)
        metrics.put("customerSatisfactionRate", 87.5);
        
        return metrics;
    }
}