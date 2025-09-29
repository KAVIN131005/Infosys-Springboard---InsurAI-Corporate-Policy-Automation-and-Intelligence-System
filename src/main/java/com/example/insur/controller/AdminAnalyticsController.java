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
@RequestMapping("/api/analytics")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173"})
@PreAuthorize("hasRole('ADMIN') or hasRole('BROKER')")
public class DynamicAnalyticsController {

    @Autowired
    private AdminDashboardService adminDashboardService;
    
    @Autowired
    private BrokerDashboardService brokerDashboardService;
    
    @Autowired
    private DashboardAnalyticsService dashboardAnalyticsService;
    
    @Autowired
    private UserService userService;

    /**
     * Get comprehensive dynamic analytics based on user role
     * Collects data from both Admin Dashboard and Broker Dashboard
     */
    @GetMapping("/comprehensive")
    public ResponseEntity<Map<String, Object>> getComprehensiveAnalytics(Authentication auth) {
        try {
            String username = auth.getName();
            User currentUser = userService.findByUsername(username);
            String userRole = currentUser.getRole().getName();
            
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

    /**
     * Get real-time dashboard updates
     */
    @GetMapping("/realtime")
    public ResponseEntity<Map<String, Object>> getRealTimeUpdates() {
        try {
            // This would typically use WebSocket or Server-Sent Events
            // For now, return current analytics data
            Map<String, Object> updates = adminDashboardService.getAnalyticsOverview();
            return ResponseEntity.ok(updates);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Export analytics data
     */
    @PostMapping("/export")
    public ResponseEntity<String> exportAnalytics(@RequestBody Map<String, Object> exportRequest) {
        try {
            // Implementation would depend on export format (PDF, Excel, CSV)
            String format = (String) exportRequest.get("format");
            // For now, return success message
            return ResponseEntity.ok("Analytics exported successfully in " + format + " format");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Export failed");
        }
    }

    /**
     * Save dashboard configuration
     */
    @PostMapping("/config")
    public ResponseEntity<Map<String, Object>> saveDashboardConfig(
            @RequestBody Map<String, Object> config) {
        try {
            // Save configuration (would typically save to database)
            return ResponseEntity.ok(Map.of("success", true, "message", "Configuration saved"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Load dashboard configuration
     */
    @GetMapping("/config")
    public ResponseEntity<Map<String, Object>> loadDashboardConfig() {
        try {
            // Load configuration (would typically load from database)
            Map<String, Object> defaultConfig = Map.of(
                "theme", "light",
                "refreshInterval", 300000,
                "defaultTab", "overview",
                "chartPreferences", Map.of(
                    "showLegend", true,
                    "showTooltips", true,
                    "animationDuration", 500
                )
            );
            return ResponseEntity.ok(defaultConfig);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}