package com.example.insur.service;

import com.example.insur.repository.PolicyRepository;
import com.example.insur.repository.ClaimRepository;
import com.example.insur.repository.UserPolicyRepository;
import com.example.insur.entity.Policy;
import com.example.insur.entity.Claim;
import com.example.insur.entity.UserPolicy;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BrokerAnalyticsService {

    private final PolicyRepository policyRepository;
    private final ClaimRepository claimRepository;
    private final UserPolicyRepository userPolicyRepository;
    
    public Map<String, Object> getBrokerAnalytics(String brokerId) {
        Map<String, Object> analytics = new HashMap<>();
        
        // Get user policies for broker's policies to calculate revenue
        List<UserPolicy> brokerUserPolicies = userPolicyRepository.findAll().stream()
                .filter(up -> up.getPolicy() != null && 
                             up.getPolicy().getBroker() != null && 
                             up.getPolicy().getBroker().getId().toString().equals(brokerId))
                .collect(Collectors.toList());
        
        // Basic statistics
        analytics.put("totalPolicies", brokerUserPolicies.size()); // Actual sold policies
        analytics.put("activePolicies", brokerUserPolicies.stream()
                .mapToLong(up -> "ACTIVE".equals(up.getStatus()) ? 1 : 0).sum());
        
        // Calculate total commission and revenue
        BigDecimal totalCommission = brokerUserPolicies.stream()
                .filter(up -> up.getTotalPremiumPaid() != null)
                .map(up -> up.getTotalPremiumPaid().multiply(BigDecimal.valueOf(0.05))) // 5% commission
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal averageCommission = brokerUserPolicies.isEmpty() ? BigDecimal.ZERO :
                totalCommission.divide(BigDecimal.valueOf(brokerUserPolicies.size()), 2, RoundingMode.HALF_UP);
        
        analytics.put("totalCommission", totalCommission);
        analytics.put("averagePolicyValue", averageCommission);
        
        // Monthly commission for current month
        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        BigDecimal monthlyCommission = brokerUserPolicies.stream()
                .filter(up -> up.getCreatedAt() != null && up.getCreatedAt().isAfter(startOfMonth))
                .filter(up -> up.getTotalPremiumPaid() != null)
                .map(up -> up.getTotalPremiumPaid().multiply(BigDecimal.valueOf(0.05)))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        analytics.put("monthlyCommission", monthlyCommission);
        analytics.put("commissionRate", 5.0); // 5% commission rate
        
        // Policy distribution by type for pie chart - converted to chart format
        Map<String, Long> policyTypeMap = brokerUserPolicies.stream()
                .filter(up -> up.getPolicy() != null)
                .collect(Collectors.groupingBy(
                    up -> up.getPolicy().getType() != null ? up.getPolicy().getType() : "Unknown",
                    Collectors.counting()
                ));
        
        List<Map<String, Object>> policyDistribution = policyTypeMap.entrySet().stream()
                .map(entry -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("name", entry.getKey());
                    item.put("value", entry.getValue());
                    return item;
                })
                .collect(Collectors.toList());
        analytics.put("policyDistribution", policyDistribution);
        
        // Policy status distribution for bar chart
        Map<String, Long> statusMap = brokerUserPolicies.stream()
                .collect(Collectors.groupingBy(
                    up -> up.getStatus() != null ? up.getStatus() : "Unknown",
                    Collectors.counting()
                ));
        
        List<Map<String, Object>> policyStatusDistribution = statusMap.entrySet().stream()
                .map(entry -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("status", entry.getKey());
                    item.put("count", entry.getValue());
                    return item;
                })
                .collect(Collectors.toList());
        analytics.put("policyStatusDistribution", policyStatusDistribution);
        
        // Performance score calculation
        double performanceScore = calculatePerformanceScore(brokerUserPolicies);
        analytics.put("performanceScore", performanceScore);
        
        // Sales data
        analytics.put("monthlySales", monthlyCommission.multiply(BigDecimal.valueOf(20))); // Estimate total sales
        analytics.put("salesGrowth", calculateSalesGrowth(brokerId));
        analytics.put("conversionRate", calculateConversionRate(brokerId));
        
        // Monthly trends for line chart
        analytics.put("monthlyTrends", getBrokerMonthlyTrends(brokerId));
        analytics.put("salesTrends", getBrokerSalesTrends(brokerId));
        analytics.put("commissionTrends", getBrokerCommissionTrends(brokerId));
        
        // Top products
        analytics.put("topProducts", getTopProducts(brokerId));
        
        // Commission breakdown
        analytics.put("commissionBreakdown", getCommissionBreakdown(brokerId));
        
        // Claims related to broker's policies
        Map<String, Object> claimsData = getBrokerClaimsAnalytics(brokerId);
        analytics.putAll(claimsData); // Merge claims data into main analytics
        
        return analytics;
    }
    
    private List<Map<String, Object>> getBrokerMonthlyTrends(String brokerId) {
        List<Map<String, Object>> trends = new ArrayList<>();
        
        LocalDateTime now = LocalDateTime.now();
        for (int i = 11; i >= 0; i--) {
            LocalDateTime monthStart = now.minusMonths(i).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
            LocalDateTime monthEnd = monthStart.plusMonths(1).minusSeconds(1);
            
            Map<String, Object> monthData = new HashMap<>();
            monthData.put("month", monthStart.format(DateTimeFormatter.ofPattern("MMM yyyy")));
            
            long policyCount = policyRepository.findAll().stream()
                    .filter(p -> p.getBroker() != null && p.getBroker().getId().toString().equals(brokerId) &&
                                p.getCreatedAt() != null && 
                                p.getCreatedAt().isAfter(monthStart) && 
                                p.getCreatedAt().isBefore(monthEnd))
                    .count();
            
            long salesCount = userPolicyRepository.findAll().stream()
                    .filter(up -> up.getPolicy() != null && 
                                 up.getPolicy().getBroker() != null && 
                                 up.getPolicy().getBroker().getId().toString().equals(brokerId) &&
                                 up.getCreatedAt() != null && 
                                 up.getCreatedAt().isAfter(monthStart) && 
                                 up.getCreatedAt().isBefore(monthEnd))
                    .count();
            
            monthData.put("policies", policyCount);
            monthData.put("sales", salesCount);
            
            trends.add(monthData);
        }
        
        return trends;
    }
    
    private Map<String, Object> getBrokerClaimsAnalytics(String brokerId) {
        Map<String, Object> claimsAnalytics = new HashMap<>();
        
        // Get claims for broker's policies
        List<Claim> brokerClaims = claimRepository.findAll().stream()
                .filter(c -> c.getUserPolicy() != null && 
                            c.getUserPolicy().getPolicy() != null &&
                            c.getUserPolicy().getPolicy().getBroker() != null && 
                            c.getUserPolicy().getPolicy().getBroker().getId().toString().equals(brokerId))
                .collect(Collectors.toList());
        
        claimsAnalytics.put("totalClaims", brokerClaims.size());
        
        if (!brokerClaims.isEmpty()) {
            long approvedClaims = brokerClaims.stream()
                    .mapToLong(c -> "APPROVED".equals(c.getStatus()) || "AI_APPROVED".equals(c.getStatus()) ? 1 : 0)
                    .sum();
            
            long rejectedClaims = brokerClaims.stream()
                    .mapToLong(c -> "REJECTED".equals(c.getStatus()) ? 1 : 0)
                    .sum();
            
            claimsAnalytics.put("approvedClaims", approvedClaims);
            claimsAnalytics.put("rejectedClaims", rejectedClaims);
            claimsAnalytics.put("approvalRate", (double) approvedClaims / brokerClaims.size() * 100);
        } else {
            claimsAnalytics.put("approvedClaims", 0);
            claimsAnalytics.put("rejectedClaims", 0);
            claimsAnalytics.put("approvalRate", 0.0);
        }
        
        // Claims by status distribution
        Map<String, Long> claimsByStatus = brokerClaims.stream()
                .collect(Collectors.groupingBy(
                    c -> c.getStatus() != null ? c.getStatus() : "Unknown",
                    Collectors.counting()
                ));
        claimsAnalytics.put("claimsStatusDistribution", claimsByStatus);
        
        return claimsAnalytics;
    }
    
    private double calculatePerformanceScore(List<UserPolicy> brokerUserPolicies) {
        if (brokerUserPolicies.isEmpty()) return 0.0;
        
        // Calculate performance based on active policies and payment status
        long activePolicies = brokerUserPolicies.stream()
                .mapToLong(up -> "ACTIVE".equals(up.getStatus()) ? 1 : 0).sum();
        
        long onTimePayments = brokerUserPolicies.stream()
                .mapToLong(up -> "PAID".equals(up.getPaymentStatus()) ? 1 : 0).sum();
        
        double activeRate = (double) activePolicies / brokerUserPolicies.size();
        double paymentRate = (double) onTimePayments / brokerUserPolicies.size();
        
        return (activeRate * 0.6 + paymentRate * 0.4) * 100; // Weighted score out of 100
    }
    
    private double calculateSalesGrowth(String brokerId) {
        LocalDateTime currentMonth = LocalDateTime.now().withDayOfMonth(1);
        LocalDateTime previousMonth = currentMonth.minusMonths(1);
        
        List<UserPolicy> currentMonthSales = userPolicyRepository.findAll().stream()
                .filter(up -> up.getPolicy() != null && 
                             up.getPolicy().getBroker() != null && 
                             up.getPolicy().getBroker().getId().toString().equals(brokerId) &&
                             up.getCreatedAt() != null && 
                             up.getCreatedAt().isAfter(currentMonth))
                .collect(Collectors.toList());
        
        List<UserPolicy> previousMonthSales = userPolicyRepository.findAll().stream()
                .filter(up -> up.getPolicy() != null && 
                             up.getPolicy().getBroker() != null && 
                             up.getPolicy().getBroker().getId().toString().equals(brokerId) &&
                             up.getCreatedAt() != null && 
                             up.getCreatedAt().isAfter(previousMonth) &&
                             up.getCreatedAt().isBefore(currentMonth))
                .collect(Collectors.toList());
        
        if (previousMonthSales.isEmpty()) return currentMonthSales.isEmpty() ? 0.0 : 100.0;
        
        double growth = ((double) currentMonthSales.size() - previousMonthSales.size()) / previousMonthSales.size() * 100;
        return growth;
    }
    
    private double calculateConversionRate(String brokerId) {
        List<Policy> createdPolicies = policyRepository.findAll().stream()
                .filter(p -> p.getBroker() != null && p.getBroker().getId().toString().equals(brokerId))
                .collect(Collectors.toList());
        
        List<UserPolicy> soldPolicies = userPolicyRepository.findAll().stream()
                .filter(up -> up.getPolicy() != null && 
                             up.getPolicy().getBroker() != null && 
                             up.getPolicy().getBroker().getId().toString().equals(brokerId))
                .collect(Collectors.toList());
        
        if (createdPolicies.isEmpty()) return 0.0;
        return (double) soldPolicies.size() / createdPolicies.size() * 100;
    }
    
    private List<Map<String, Object>> getBrokerSalesTrends(String brokerId) {
        List<Map<String, Object>> trends = new ArrayList<>();
        
        LocalDateTime now = LocalDateTime.now();
        for (int i = 11; i >= 0; i--) {
            LocalDateTime monthStart = now.minusMonths(i).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
            LocalDateTime monthEnd = monthStart.plusMonths(1).minusSeconds(1);
            
            Map<String, Object> monthData = new HashMap<>();
            monthData.put("period", monthStart.format(DateTimeFormatter.ofPattern("MMM yyyy")));
            
            BigDecimal monthlySales = userPolicyRepository.findAll().stream()
                    .filter(up -> up.getPolicy() != null && 
                                 up.getPolicy().getBroker() != null && 
                                 up.getPolicy().getBroker().getId().toString().equals(brokerId) &&
                                 up.getCreatedAt() != null && 
                                 up.getCreatedAt().isAfter(monthStart) && 
                                 up.getCreatedAt().isBefore(monthEnd))
                    .filter(up -> up.getTotalPremiumPaid() != null)
                    .map(up -> up.getTotalPremiumPaid().multiply(BigDecimal.valueOf(20))) // Estimate sales
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            BigDecimal monthlyCommission = monthlySales.multiply(BigDecimal.valueOf(0.05));
            
            monthData.put("sales", monthlySales);
            monthData.put("commission", monthlyCommission);
            trends.add(monthData);
        }
        
        return trends;
    }
    
    private List<Map<String, Object>> getBrokerCommissionTrends(String brokerId) {
        List<Map<String, Object>> trends = new ArrayList<>();
        
        LocalDateTime now = LocalDateTime.now();
        for (int i = 11; i >= 0; i--) {
            LocalDateTime monthStart = now.minusMonths(i).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
            LocalDateTime monthEnd = monthStart.plusMonths(1).minusSeconds(1);
            
            Map<String, Object> monthData = new HashMap<>();
            monthData.put("month", monthStart.format(DateTimeFormatter.ofPattern("MMM yyyy")));
            
            BigDecimal monthlyCommission = userPolicyRepository.findAll().stream()
                    .filter(up -> up.getPolicy() != null && 
                                 up.getPolicy().getBroker() != null && 
                                 up.getPolicy().getBroker().getId().toString().equals(brokerId) &&
                                 up.getCreatedAt() != null && 
                                 up.getCreatedAt().isAfter(monthStart) && 
                                 up.getCreatedAt().isBefore(monthEnd))
                    .filter(up -> up.getTotalPremiumPaid() != null)
                    .map(up -> up.getTotalPremiumPaid().multiply(BigDecimal.valueOf(0.05)))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            monthData.put("commission", monthlyCommission);
            trends.add(monthData);
        }
        
        return trends;
    }
    
    private List<Map<String, Object>> getTopProducts(String brokerId) {
        Map<String, Long> productSales = userPolicyRepository.findAll().stream()
                .filter(up -> up.getPolicy() != null && 
                             up.getPolicy().getBroker() != null && 
                             up.getPolicy().getBroker().getId().toString().equals(brokerId))
                .collect(Collectors.groupingBy(
                    up -> up.getPolicy().getType() != null ? up.getPolicy().getType() : "Unknown",
                    Collectors.counting()
                ));
        
        Map<String, BigDecimal> productRevenue = userPolicyRepository.findAll().stream()
                .filter(up -> up.getPolicy() != null && 
                             up.getPolicy().getBroker() != null && 
                             up.getPolicy().getBroker().getId().toString().equals(brokerId) &&
                             up.getTotalPremiumPaid() != null)
                .collect(Collectors.groupingBy(
                    up -> up.getPolicy().getType() != null ? up.getPolicy().getType() : "Unknown",
                    Collectors.reducing(BigDecimal.ZERO, up -> up.getTotalPremiumPaid().multiply(BigDecimal.valueOf(20)), BigDecimal::add)
                ));
        
        return productSales.entrySet().stream()
                .map(entry -> {
                    Map<String, Object> product = new HashMap<>();
                    product.put("product", entry.getKey());
                    product.put("policies", entry.getValue());
                    product.put("sales", productRevenue.getOrDefault(entry.getKey(), BigDecimal.ZERO));
                    return product;
                })
                .sorted((a, b) -> Long.compare((Long) b.get("policies"), (Long) a.get("policies")))
                .limit(5)
                .collect(Collectors.toList());
    }
    
    private List<Map<String, Object>> getCommissionBreakdown(String brokerId) {
        Map<String, BigDecimal> commissionByProduct = userPolicyRepository.findAll().stream()
                .filter(up -> up.getPolicy() != null && 
                             up.getPolicy().getBroker() != null && 
                             up.getPolicy().getBroker().getId().toString().equals(brokerId) &&
                             up.getTotalPremiumPaid() != null)
                .collect(Collectors.groupingBy(
                    up -> up.getPolicy().getType() != null ? up.getPolicy().getType() : "Unknown",
                    Collectors.reducing(BigDecimal.ZERO, up -> up.getTotalPremiumPaid().multiply(BigDecimal.valueOf(0.05)), BigDecimal::add)
                ));
        
        BigDecimal totalCommission = commissionByProduct.values().stream()
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        return commissionByProduct.entrySet().stream()
                .map(entry -> {
                    Map<String, Object> breakdown = new HashMap<>();
                    breakdown.put("product", entry.getKey());
                    breakdown.put("commission", entry.getValue());
                    breakdown.put("percentage", totalCommission.compareTo(BigDecimal.ZERO) > 0 ? 
                        entry.getValue().divide(totalCommission, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)) : 0);
                    return breakdown;
                })
                .collect(Collectors.toList());
    }
}