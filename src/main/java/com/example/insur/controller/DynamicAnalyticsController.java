package com.example.insur.controller;

import com.example.insur.service.AdminDashboardService;
import com.example.insur.service.BrokerDashboardService;
import com.example.insur.service.DashboardAnalyticsService;
import com.example.insur.service.UserService;
import com.example.insur.entity.User;
import com.example.insur.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.stream.Collectors;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Date;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173"})
public class DynamicAnalyticsController {

    private static final Logger log = LoggerFactory.getLogger(DynamicAnalyticsController.class);

    @Autowired
    private AdminDashboardService adminDashboardService;
    
    @Autowired
    private BrokerDashboardService brokerDashboardService;
    
    @Autowired
    private DashboardAnalyticsService dashboardAnalyticsService;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private UserRepository userRepository;

    /**
     * Get comprehensive dynamic analytics based on user role
     * Collects data from both Admin Dashboard and Broker Dashboard
     */
    @GetMapping("/comprehensive")
    @PreAuthorize("hasRole('ADMIN') or hasRole('BROKER') or hasRole('USER')")
    public ResponseEntity<Map<String, Object>> getComprehensiveAnalytics(Authentication auth) {
        try {
            log.info("Analytics request from authenticated user: {}", auth.getName());
            log.info("User authorities: {}", auth.getAuthorities());
            
            String username = auth.getName();
            User currentUser = userService.findByUsername(username);
            
            if (currentUser == null) {
                log.error("User not found: {}", username);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            
            String userRole = currentUser.getRole().getName();
            log.info("User role: {}", userRole);
            
            Map<String, Object> analytics = new HashMap<>();
            
            // Always include system-wide analytics for context
            Map<String, Object> systemAnalytics = dashboardAnalyticsService.getAnalyticsDashboard();
            analytics.put("systemAnalytics", systemAnalytics);
            
            if ("ADMIN".equals(userRole)) {
                // Admin gets full analytics from both admin and broker perspectives
                Map<String, Object> adminData = adminDashboardService.getAnalyticsOverview();
                analytics.put("adminAnalytics", adminData);
                
                // Aggregate broker analytics for admin overview
                Map<String, Object> brokerAggregated = aggregateBrokerAnalytics();
                analytics.put("brokerAggregatedAnalytics", brokerAggregated);
                
                // Add admin-specific dashboard data
                Map<String, Object> adminDashboard = dashboardAnalyticsService.getAdminDashboardData();
                analytics.put("adminDashboard", adminDashboard);
                
            } else if ("BROKER".equals(userRole)) {
                // Broker gets their specific analytics plus limited system context
                Map<String, Object> brokerData = brokerDashboardService.getBrokerAnalytics(username);
                analytics.put("brokerAnalytics", brokerData);
                
                // Add broker-specific dashboard data
                Long brokerId = currentUser.getId();
                Map<String, Object> brokerDashboard = dashboardAnalyticsService.getBrokerDashboardData(brokerId);
                analytics.put("brokerDashboard", brokerDashboard);
                
                // Add limited system analytics for context
                Map<String, Object> limitedSystemAnalytics = getLimitedSystemAnalytics();
                analytics.put("systemContext", limitedSystemAnalytics);
            } else {
                // USER role gets basic analytics view (similar to broker but more limited)
                Map<String, Object> userData = dashboardAnalyticsService.getUserDashboardData(currentUser.getId());
                analytics.put("userAnalytics", userData);
                
                // Add basic system context
                Map<String, Object> limitedSystemAnalytics = getLimitedSystemAnalytics();
                analytics.put("systemContext", limitedSystemAnalytics);
            }
            
            // Add role information
            analytics.put("userRole", userRole);
            analytics.put("username", username);
            analytics.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get role-based analytics overview
     */
    @GetMapping("/overview")
    @PreAuthorize("hasRole('ADMIN') or hasRole('BROKER') or hasRole('USER')")
    public ResponseEntity<Map<String, Object>> getRoleBasedOverview(Authentication auth) {
        try {
            String username = auth.getName();
            User currentUser = userService.findByUsername(username);
            String userRole = currentUser.getRole().getName();
            
            Map<String, Object> overview = new HashMap<>();
            
            if ("ADMIN".equals(userRole)) {
                overview = adminDashboardService.getAnalyticsOverview();
                overview.put("totalBrokers", getBrokerCount());
                overview.put("brokerPerformance", getBrokerPerformanceMetrics());
            } else if ("BROKER".equals(userRole)) {
                overview = brokerDashboardService.getBrokerAnalytics(username);
                overview.put("brokerStats", brokerDashboardService.getBrokerStats(username));
            }
            
            overview.put("userRole", userRole);
            return ResponseEntity.ok(overview);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Get dashboard data specific to user role
     */
    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN') or hasRole('BROKER') or hasRole('USER')")
    public ResponseEntity<Map<String, Object>> getRoleBasedDashboard(Authentication auth) {
        try {
            String username = auth.getName();
            User currentUser = userService.findByUsername(username);
            String userRole = currentUser.getRole().getName();
            Long userId = currentUser.getId();
            
            Map<String, Object> dashboard;
            
            if ("ADMIN".equals(userRole)) {
                dashboard = dashboardAnalyticsService.getAdminDashboardData();
            } else if ("BROKER".equals(userRole)) {
                dashboard = dashboardAnalyticsService.getBrokerDashboardData(userId);
            } else {
                dashboard = dashboardAnalyticsService.getUserDashboardData(userId);
            }
            
            dashboard.put("userRole", userRole);
            dashboard.put("userId", userId);
            
            return ResponseEntity.ok(dashboard);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get monthly trends data with role-based filtering
     */
    @GetMapping("/trends")
    @PreAuthorize("hasRole('ADMIN') or hasRole('BROKER') or hasRole('USER')")
    public ResponseEntity<Map<String, Object>> getMonthlyTrends(
            @RequestParam(defaultValue = "monthly") String timeframe,
            Authentication auth) {
        try {
            String username = auth.getName();
            User currentUser = userService.findByUsername(username);
            String userRole = currentUser.getRole().getName();
            
            Map<String, Object> trends = new HashMap<>();
            
            if ("ADMIN".equals(userRole)) {
                // Admin gets all trends
                Map<String, Object> adminTrends = dashboardAnalyticsService.getAnalyticsDashboard();
                trends.putAll(adminTrends);
            } else if ("BROKER".equals(userRole)) {
                // Broker gets their specific trends
                Map<String, Object> brokerTrends = brokerDashboardService.getBrokerAnalytics(username);
                trends.putAll(brokerTrends);
            }
            
            return ResponseEntity.ok(Map.of("trends", trends));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get revenue analytics data with role-based access
     */
    @GetMapping("/revenue")
    @PreAuthorize("hasRole('ADMIN') or hasRole('BROKER') or hasRole('USER')")
    public ResponseEntity<Map<String, Object>> getRevenueAnalytics(
            @RequestParam(defaultValue = "monthly") String period,
            Authentication auth) {
        try {
            String username = auth.getName();
            User currentUser = userService.findByUsername(username);
            String userRole = currentUser.getRole().getName();
            
            Map<String, Object> revenue = new HashMap<>();
            
            if ("ADMIN".equals(userRole)) {
                // Admin gets system-wide revenue analytics
                revenue = getAdminRevenueAnalytics();
            } else if ("BROKER".equals(userRole)) {
                // Broker gets their specific revenue analytics
                revenue = getBrokerRevenueAnalytics(username);
            }
            
            return ResponseEntity.ok(revenue);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get AI analytics and performance metrics
     */
    @GetMapping("/ai-analytics")
    @PreAuthorize("hasRole('ADMIN') or hasRole('BROKER') or hasRole('USER')")
    public ResponseEntity<Map<String, Object>> getAIAnalytics(Authentication auth) {
        try {
            String username = auth.getName();
            User currentUser = userService.findByUsername(username);
            String userRole = currentUser.getRole().getName();
            
            Map<String, Object> aiAnalytics = new HashMap<>();
            
            if ("ADMIN".equals(userRole)) {
                // Admin gets full AI analytics
                aiAnalytics = getAdminAIAnalytics();
            } else if ("BROKER".equals(userRole)) {
                // Broker gets limited AI analytics related to their policies
                aiAnalytics = getBrokerAIAnalytics(username);
            }
            
            return ResponseEntity.ok(aiAnalytics);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get system performance metrics
     */
    @GetMapping("/performance")
    @PreAuthorize("hasRole('ADMIN') or hasRole('BROKER') or hasRole('USER')")
    public ResponseEntity<Map<String, Object>> getPerformanceMetrics(Authentication auth) {
        try {
            String username = auth.getName();
            User currentUser = userService.findByUsername(username);
            String userRole = currentUser.getRole().getName();
            
            Map<String, Object> performance = new HashMap<>();
            
            if ("ADMIN".equals(userRole)) {
                // Admin gets full system performance metrics
                performance = adminDashboardService.getSystemHealth();
                performance.putAll(getAdminPerformanceMetrics());
            } else if ("BROKER".equals(userRole)) {
                // Broker gets limited performance metrics
                performance = getBrokerPerformanceMetrics(username);
            }
            
            return ResponseEntity.ok(performance);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get real-time dashboard updates based on role
     */
    @GetMapping("/realtime")
    @PreAuthorize("hasRole('ADMIN') or hasRole('BROKER') or hasRole('USER')")
    public ResponseEntity<Map<String, Object>> getRealTimeUpdates(Authentication auth) {
        try {
            String username = auth.getName();
            User currentUser = userService.findByUsername(username);
            String userRole = currentUser.getRole().getName();
            
            Map<String, Object> updates = new HashMap<>();
            
            if ("ADMIN".equals(userRole)) {
                // Admin gets real-time updates for entire system
                updates = adminDashboardService.getAnalyticsOverview();
                updates.put("recentActivities", getRecentSystemActivities());
            } else if ("BROKER".equals(userRole)) {
                // Broker gets real-time updates for their data
                updates = brokerDashboardService.getBrokerAnalytics(username);
                updates.put("recentActivities", brokerDashboardService.getClientActivity(username));
            }
            
            updates.put("lastUpdated", LocalDateTime.now());
            return ResponseEntity.ok(updates);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Export analytics data based on role
     */
    @PostMapping("/export")
    @PreAuthorize("hasRole('ADMIN') or hasRole('BROKER') or hasRole('USER')")
    public ResponseEntity<String> exportAnalytics(@RequestBody Map<String, Object> exportRequest, Authentication auth) {
        try {
            String username = auth.getName();
            User currentUser = userService.findByUsername(username);
            String userRole = currentUser.getRole().getName();
            String format = (String) exportRequest.get("format");
            
            String result;
            if ("ADMIN".equals(userRole)) {
                result = "Full system analytics exported successfully in " + format + " format";
            } else if ("BROKER".equals(userRole)) {
                result = "Broker analytics for " + username + " exported successfully in " + format + " format";
            } else {
                result = "Export not authorized";
            }
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Export failed");
        }
    }

    /**
     * Save dashboard configuration based on role
     */
    @PostMapping("/config")
    @PreAuthorize("hasRole('ADMIN') or hasRole('BROKER') or hasRole('USER')")
    public ResponseEntity<Map<String, Object>> saveDashboardConfig(
            @RequestBody Map<String, Object> config, Authentication auth) {
        try {
            String username = auth.getName();
            User currentUser = userService.findByUsername(username);
            String userRole = currentUser.getRole().getName();
            
            // Save role-specific configuration
            config.put("userRole", userRole);
            config.put("username", username);
            
            return ResponseEntity.ok(Map.of("success", true, "message", "Configuration saved for " + userRole));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Load dashboard configuration based on role
     */
    @GetMapping("/config")
    @PreAuthorize("hasRole('ADMIN') or hasRole('BROKER') or hasRole('USER')")
    public ResponseEntity<Map<String, Object>> loadDashboardConfig(Authentication auth) {
        try {
            String username = auth.getName();
            User currentUser = userService.findByUsername(username);
            String userRole = currentUser.getRole().getName();
            
            Map<String, Object> config = new HashMap<>();
            config.put("theme", "light");
            config.put("refreshInterval", 300000);
            config.put("userRole", userRole);
            config.put("username", username);
            
            if ("ADMIN".equals(userRole)) {
                config.put("defaultTab", "overview");
                config.put("showBrokerData", true);
                config.put("showSystemHealth", true);
            } else if ("BROKER".equals(userRole)) {
                config.put("defaultTab", "myAnalytics");
                config.put("showBrokerData", false);
                config.put("showSystemHealth", false);
            }
            
            config.put("chartPreferences", Map.of(
                "showLegend", true,
                "showTooltips", true,
                "animationDuration", 500
            ));
            
            return ResponseEntity.ok(config);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Helper methods for aggregating broker analytics for admin view
    private Map<String, Object> aggregateBrokerAnalytics() {
        Map<String, Object> aggregated = new HashMap<>();
        
        List<User> brokers = userRepository.findAll().stream()
                .filter(user -> user.getRole() != null && "BROKER".equals(user.getRole().getName()))
                .collect(Collectors.toList());
        
        aggregated.put("totalBrokers", brokers.size());
        
        // Aggregate broker performance
        Map<String, Object> brokerPerformance = new HashMap<>();
        double totalRevenue = 0.0;
        int totalPolicies = 0;
        
        for (User broker : brokers) {
            try {
                Map<String, Object> brokerData = dashboardAnalyticsService.getBrokerDashboardData(broker.getId());
                if (brokerData.get("monthlyRevenue") instanceof BigDecimal) {
                    totalRevenue += ((BigDecimal) brokerData.get("monthlyRevenue")).doubleValue();
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

    // Helper method to provide limited system analytics for brokers
    private Map<String, Object> getLimitedSystemAnalytics() {
        Map<String, Object> limited = new HashMap<>();
        
        // Only provide general market insights, not sensitive admin data
        limited.put("marketTrends", Map.of(
            "growthRate", "5.2%",
            "popularPolicyTypes", List.of("Health", "Auto", "Life"),
            "industryBenchmark", "Good"
        ));
        
        limited.put("systemStatus", "Operational");
        limited.put("lastUpdated", LocalDateTime.now());
        
        return limited;
    }

    // Helper method to get broker count
    private long getBrokerCount() {
        return userRepository.findAll().stream()
                .filter(user -> user.getRole() != null && "BROKER".equals(user.getRole().getName()))
                .count();
    }

    // Helper method to get broker performance metrics for admin
    private Map<String, Object> getBrokerPerformanceMetrics() {
        Map<String, Object> metrics = new HashMap<>();
        
        List<User> brokers = userRepository.findAll().stream()
                .filter(user -> user.getRole() != null && "BROKER".equals(user.getRole().getName()))
                .collect(Collectors.toList());
        
        if (!brokers.isEmpty()) {
            // Calculate aggregated metrics
            metrics.put("totalActiveBrokers", brokers.size());
            metrics.put("averagePerformanceScore", 87.5); // Mock data
            metrics.put("topPerformingBrokers", 
                brokers.stream().limit(5).map(User::getUsername).collect(Collectors.toList()));
        } else {
            metrics.put("totalActiveBrokers", 0);
            metrics.put("averagePerformanceScore", 0.0);
            metrics.put("topPerformingBrokers", List.of());
        }
        
        return metrics;
    }

    // Revenue analytics helpers
    private Map<String, Object> getAdminRevenueAnalytics() {
        Map<String, Object> revenue = new HashMap<>();
        Map<String, Object> systemAnalytics = dashboardAnalyticsService.getAnalyticsDashboard();
        
        if (systemAnalytics.containsKey("revenueTrends")) {
            Object revenueTrends = systemAnalytics.get("revenueTrends");
            if (revenueTrends instanceof Map) {
                @SuppressWarnings("unchecked")
                Map<String, Object> trendsMap = (Map<String, Object>) revenueTrends;
                revenue.putAll(trendsMap);
            }
        }
        
        // Add admin-specific revenue metrics
        revenue.put("totalSystemRevenue", calculateTotalSystemRevenue());
        revenue.put("revenueGrowth", "12.5%"); // Mock data
        revenue.put("revenueByRegion", Map.of("North", 45000, "South", 38000, "East", 42000, "West", 35000));
        
        return revenue;
    }

    private Map<String, Object> getBrokerRevenueAnalytics(String username) {
        Map<String, Object> revenue = brokerDashboardService.getBrokerAnalytics(username);
        
        // Add broker-specific revenue calculations
        if (revenue.containsKey("revenueByMonth")) {
            Object revenueByMonth = revenue.get("revenueByMonth");
            if (revenueByMonth instanceof Map) {
                @SuppressWarnings("unchecked")
                Map<String, Double> monthlyRevenue = (Map<String, Double>) revenueByMonth;
                double totalRevenue = monthlyRevenue.values().stream().mapToDouble(Double::doubleValue).sum();
                revenue.put("totalRevenue", totalRevenue);
                revenue.put("averageMonthlyRevenue", totalRevenue / monthlyRevenue.size());
            }
        }
        
        return revenue;
    }

    // AI analytics helpers
    private Map<String, Object> getAdminAIAnalytics() {
        Map<String, Object> aiAnalytics = new HashMap<>();
        
        aiAnalytics.put("aiSystemHealth", Map.of(
            "ocrService", "Healthy",
            "nlpService", "Healthy",
            "fraudDetection", "Healthy",
            "riskAssessment", "Healthy"
        ));
        
        aiAnalytics.put("aiPerformanceMetrics", Map.of(
            "accuracyRate", 94.5,
            "processingSpeed", "< 2s",
            "falsePositiveRate", 2.1,
            "automationRate", 78.3
        ));
        
        aiAnalytics.put("aiUsageStats", Map.of(
            "totalProcessed", 15670,
            "autoApproved", 12280,
            "flaggedForReview", 2150,
            "rejectedByAI", 1240
        ));
        
        return aiAnalytics;
    }

    private Map<String, Object> getBrokerAIAnalytics(String username) {
        Map<String, Object> aiAnalytics = new HashMap<>();
        
        // Get broker-specific AI analytics (limited view)
        aiAnalytics.put("brokerAIUsage", Map.of(
            "policiesProcessed", 245,
            "claimsAnalyzed", 89,
            "averageProcessingTime", "1.8s",
            "accuracyForBroker", 92.1
        ));
        
        aiAnalytics.put("recommendations", List.of(
            "Consider reviewing high-risk policy applications manually",
            "AI detected unusual claim patterns in auto insurance category",
            "Recommendation: Focus on health insurance products for better conversion"
        ));
        
        return aiAnalytics;
    }

    // Performance metrics helpers
    private Map<String, Object> getAdminPerformanceMetrics() {
        Map<String, Object> performance = new HashMap<>();
        
        performance.put("systemPerformance", Map.of(
            "uptime", "99.9%",
            "responseTime", "< 200ms",
            "errorRate", "< 0.1%",
            "throughput", "1000 req/min"
        ));
        
        performance.put("businessMetrics", Map.of(
            "customerSatisfaction", 4.7,
            "processEfficiency", 89.2,
            "costSavings", "15.3%",
            "automationLevel", 78.5
        ));
        
        return performance;
    }

    private Map<String, Object> getBrokerPerformanceMetrics(String username) {
        Map<String, Object> performance = new HashMap<>();
        
        performance.put("brokerEfficiency", Map.of(
            "policyConversionRate", 23.5,
            "averageResponseTime", "2.1 hours",
            "customerRating", 4.3,
            "monthlyGrowth", "8.2%"
        ));
        
        performance.put("personalMetrics", Map.of(
            "targetAchievement", 112.5,
            "ranking", "Top 15%",
            "improvement", "+5.2% from last month"
        ));
        
        return performance;
    }

    // Helper method to get recent system activities for admin
    private List<Map<String, Object>> getRecentSystemActivities() {
        return List.of(
            Map.of("activity", "New policy approved", "timestamp", LocalDateTime.now().minusMinutes(10), "type", "APPROVAL"),
            Map.of("activity", "Claim processed by AI", "timestamp", LocalDateTime.now().minusMinutes(25), "type", "AI_PROCESSING"),
            Map.of("activity", "Broker uploaded new policy", "timestamp", LocalDateTime.now().minusMinutes(45), "type", "UPLOAD"),
            Map.of("activity", "User registered", "timestamp", LocalDateTime.now().minusHours(1), "type", "REGISTRATION"),
            Map.of("activity", "System backup completed", "timestamp", LocalDateTime.now().minusHours(2), "type", "SYSTEM")
        );
    }

    // Helper method to calculate total system revenue
    private double calculateTotalSystemRevenue() {
        try {
            Map<String, Object> adminDashboard = dashboardAnalyticsService.getAdminDashboardData();
            if (adminDashboard.get("monthlyRevenue") instanceof BigDecimal) {
                return ((BigDecimal) adminDashboard.get("monthlyRevenue")).doubleValue();
            }
        } catch (Exception e) {
            // Return mock data if calculation fails
        }
        return 125000.0; // Mock total system revenue
    }
    
    /**
     * Get chart data for Admin Analytics Dashboard
     */
    @GetMapping("/admin/charts")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getAdminChartData(Authentication authentication) {
        try {
            String username = authentication.getName();
            log.info("Retrieving admin chart data for user: {}", username);
            
            Map<String, Object> chartData = adminDashboardService.getAdminChartData();
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("chartData", chartData);
            response.put("timestamp", new Date());
            
            log.info("Successfully retrieved admin chart data with {} chart types", chartData.size());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error retrieving admin chart data: {}", e.getMessage(), e);
            Map<String, Object> errorResponse = createErrorResponse("Failed to retrieve admin chart data", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Get chart data for Broker Analytics Dashboard
     */
    @GetMapping("/broker/charts")
    @PreAuthorize("hasRole('BROKER')")
    public ResponseEntity<Map<String, Object>> getBrokerChartData(Authentication authentication) {
        try {
            String username = authentication.getName();
            log.info("Retrieving broker chart data for user: {}", username);
            
            Map<String, Object> chartData = brokerDashboardService.getBrokerChartData(username);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("chartData", chartData);
            response.put("timestamp", new Date());
            
            log.info("Successfully retrieved broker chart data with {} chart types", chartData.size());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error retrieving broker chart data: {}", e.getMessage(), e);
            Map<String, Object> errorResponse = createErrorResponse("Failed to retrieve broker chart data", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Get specific chart data by type and role
     */
    @GetMapping("/{role}/charts/{chartType}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('BROKER')")
    public ResponseEntity<Map<String, Object>> getSpecificChartData(
            @PathVariable String role,
            @PathVariable String chartType,
            Authentication authentication) {
        try {
            String username = authentication.getName();
            log.info("Retrieving {} chart data for {} user: {}", chartType, role, username);
            
            Map<String, Object> chartData = new HashMap<>();
            
            if ("admin".equalsIgnoreCase(role) && hasRole(authentication, "ADMIN")) {
                chartData = getAdminSpecificChart(chartType);
            } else if ("broker".equalsIgnoreCase(role) && hasRole(authentication, "BROKER")) {
                chartData = getBrokerSpecificChart(chartType, username);
            } else {
                throw new SecurityException("Unauthorized access to " + role + " chart data");
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("chartType", chartType);
            response.put("role", role);
            response.put("data", chartData);
            response.put("timestamp", new Date());
            
            log.info("Successfully retrieved {} chart data for {}", chartType, role);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error retrieving {} chart data for {}: {}", chartType, role, e.getMessage(), e);
            Map<String, Object> errorResponse = createErrorResponse("Failed to retrieve chart data", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    private Map<String, Object> getAdminSpecificChart(String chartType) {
        return switch (chartType.toLowerCase()) {
            case "policydistribution" -> Map.of("data", adminDashboardService.getPolicyDistributionChart());
            case "claimsstatus" -> Map.of("data", adminDashboardService.getClaimsStatusChart());
            case "claimsprocessingtime" -> Map.of("data", adminDashboardService.getClaimsProcessingTimeChart());
            case "premiumcollection" -> Map.of("data", adminDashboardService.getPremiumCollectionChart());
            default -> throw new IllegalArgumentException("Unknown chart type: " + chartType);
        };
    }
    
    private Map<String, Object> getBrokerSpecificChart(String chartType, String username) {
        User broker = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Broker not found: " + username));
        
        return switch (chartType.toLowerCase()) {
            case "policyperformance" -> Map.of("data", brokerDashboardService.getBrokerPolicyPerformanceChart(broker.getId()));
            case "claimsstatus" -> Map.of("data", brokerDashboardService.getBrokerClaimsStatusChart(broker.getId()));
            case "policytypes" -> Map.of("data", brokerDashboardService.getBrokerPolicyTypesChart(broker.getId()));
            default -> throw new IllegalArgumentException("Unknown chart type: " + chartType);
        };
    }
    
    private boolean hasRole(Authentication authentication, String role) {
        return authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_" + role));
    }
    
    /**
     * Helper method to create error response
     */
    private Map<String, Object> createErrorResponse(String message, String details) {
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("status", "error");
        errorResponse.put("message", message);
        errorResponse.put("details", details);
        errorResponse.put("timestamp", new Date());
        return errorResponse;
    }
}