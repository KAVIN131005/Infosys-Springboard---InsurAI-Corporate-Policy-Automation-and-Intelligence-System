package com.example.insur.controller;

import com.example.insur.service.AdminDashboardService;
import com.example.insur.service.BrokerDashboardService;
import com.example.insur.service.DashboardAnalyticsService;
import com.example.insur.service.UserService;
import com.example.insur.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/analytics")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173"})
@PreAuthorize("hasRole('ADMIN')")
public class AdminAnalyticsController {

    @Autowired
    private AdminDashboardService adminDashboardService;
    
    @Autowired
    private BrokerDashboardService brokerDashboardService;
    
    @Autowired
    private DashboardAnalyticsService dashboardAnalyticsService;
    
    @Autowired
    private UserService userService;

    /**
     * Get comprehensive admin analytics
     */
    @GetMapping("/comprehensive")
    public ResponseEntity<Map<String, Object>> getComprehensiveAnalytics(Authentication auth) {
        try {
            String username = auth.getName();
            User currentUser = userService.findByUsername(username);
            
            Map<String, Object> analytics = new HashMap<>();
            
            // Admin gets full analytics from both admin and broker perspectives
            Map<String, Object> adminData = adminDashboardService.getAnalyticsOverview();
            analytics.put("adminAnalytics", adminData);
            
            // Aggregate broker analytics for admin overview
            Map<String, Object> brokerAggregated = aggregateBrokerAnalytics();
            analytics.put("brokerAggregatedAnalytics", brokerAggregated);
            
            // Add admin-specific dashboard data
            Map<String, Object> adminDashboard = dashboardAnalyticsService.getAdminDashboardData();
            analytics.put("adminDashboard", adminDashboard);
            
            // Add role information
            analytics.put("userRole", "ADMIN");
            analytics.put("username", username);
            analytics.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get admin analytics overview
     */
    @GetMapping("/overview")
    public ResponseEntity<Map<String, Object>> getAdminOverview(Authentication auth) {
        try {
            Map<String, Object> overview = adminDashboardService.getAnalyticsOverview();
            overview.put("totalBrokers", getBrokerCount());
            overview.put("brokerPerformance", getBrokerPerformanceMetrics());
            overview.put("userRole", "ADMIN");
            
            return ResponseEntity.ok(overview);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // Helper methods
    private Map<String, Object> aggregateBrokerAnalytics() {
        Map<String, Object> aggregated = new HashMap<>();
        
        List<com.example.insur.dto.UserDto> brokers = userService.getAllUsers().stream()
                .filter(user -> user.getRole() != null && "BROKER".equals(user.getRole()))
                .collect(Collectors.toList());
        
        aggregated.put("totalBrokers", brokers.size());
        
        // Aggregate broker performance
        Map<String, Object> brokerPerformance = new HashMap<>();
        double totalRevenue = 0.0;
        int totalPolicies = 0;
        
        for (com.example.insur.dto.UserDto broker : brokers) {
            try {
                Map<String, Object> brokerData = dashboardAnalyticsService.getBrokerDashboardData(broker.getId());
                if (brokerData.get("monthlyRevenue") instanceof Number) {
                    totalRevenue += ((Number) brokerData.get("monthlyRevenue")).doubleValue();
                }
                if (brokerData.get("totalPolicies") instanceof Number) {
                    totalPolicies += ((Number) brokerData.get("totalPolicies")).intValue();
                }
            } catch (Exception e) {
                // Continue with next broker if one fails
            }
        }
        
        brokerPerformance.put("totalRevenue", totalRevenue);
        brokerPerformance.put("totalPolicies", totalPolicies);
        brokerPerformance.put("averageRevenuePerBroker", brokers.size() > 0 ? totalRevenue / brokers.size() : 0);
        brokerPerformance.put("averagePoliciesPerBroker", brokers.size() > 0 ? (double) totalPolicies / brokers.size() : 0);
        
        aggregated.put("brokerPerformance", brokerPerformance);
        
        return aggregated;
    }

    private long getBrokerCount() {
        return userService.getAllUsers().stream()
                .filter(user -> user.getRole() != null && "BROKER".equals(user.getRole()))
                .count();
    }

    private Map<String, Object> getBrokerPerformanceMetrics() {
        Map<String, Object> metrics = new HashMap<>();
        
        List<com.example.insur.dto.UserDto> brokers = userService.getAllUsers().stream()
                .filter(user -> user.getRole() != null && "BROKER".equals(user.getRole()))
                .collect(Collectors.toList());
        
        if (!brokers.isEmpty()) {
            metrics.put("totalActiveBrokers", brokers.size());
            metrics.put("averagePerformanceScore", 87.5); // Mock data
            metrics.put("topPerformingBrokers", 
                brokers.stream().limit(5).map(com.example.insur.dto.UserDto::getUsername).collect(Collectors.toList()));
        } else {
            metrics.put("totalActiveBrokers", 0);
            metrics.put("averagePerformanceScore", 0.0);
            metrics.put("topPerformingBrokers", List.of());
        }
        
        return metrics;
    }
    
    /**
     * Get dashboard data specific to admin role
     */
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getAdminDashboard(Authentication auth) {
        try {
            String username = auth.getName();
            User currentUser = userService.findByUsername(username);
            Long userId = currentUser.getId();
            
            Map<String, Object> dashboard = dashboardAnalyticsService.getAdminDashboardData();
            dashboard.put("userRole", "ADMIN");
            dashboard.put("userId", userId);
            
            return ResponseEntity.ok(dashboard);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get monthly trends data
     */
    @GetMapping("/trends")
    public ResponseEntity<Map<String, Object>> getMonthlyTrends(
            @RequestParam(defaultValue = "monthly") String timeframe) {
        try {
            Map<String, Object> response = Map.of("trends", adminDashboardService.getMonthlyTrends());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get revenue analytics data
     */
    @GetMapping("/revenue")
    public ResponseEntity<Map<String, Object>> getRevenueAnalytics(
            @RequestParam(defaultValue = "monthly") String period) {
        try {
            Map<String, Object> revenue = adminDashboardService.getRevenueAnalytics();
            return ResponseEntity.ok(revenue);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get AI analytics and performance metrics
     */
    @GetMapping("/ai-analytics")
    public ResponseEntity<Map<String, Object>> getAIAnalytics() {
        try {
            Map<String, Object> aiAnalytics = adminDashboardService.getAIAnalytics();
            return ResponseEntity.ok(aiAnalytics);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get system performance metrics
     */
    @GetMapping("/performance")
    public ResponseEntity<Map<String, Object>> getPerformanceMetrics() {
        try {
            Map<String, Object> performance = adminDashboardService.getPerformanceMetrics();
            return ResponseEntity.ok(performance);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}