package com.example.insur.controller;

import com.example.insur.service.DashboardAnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class DashboardController {

    @Autowired
    private DashboardAnalyticsService analyticsService;

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getAdminDashboard() {
        return ResponseEntity.ok(analyticsService.getAdminDashboardData());
    }

    @GetMapping("/broker")
    @PreAuthorize("hasRole('BROKER')")
    public ResponseEntity<Map<String, Object>> getBrokerDashboard(Authentication auth) {
        // In a real app, get broker ID from authentication
        // For now, using a mock approach
        Long brokerId = 1L; // Get from auth.getPrincipal() or JWT
        return ResponseEntity.ok(analyticsService.getBrokerDashboardData(brokerId));
    }

    @GetMapping("/user")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Map<String, Object>> getUserDashboard(Authentication auth) {
        // In a real app, get user ID from authentication
        Long userId = 1L; // Get from auth.getPrincipal() or JWT
        return ResponseEntity.ok(analyticsService.getUserDashboardData(userId));
    }

    @GetMapping("/analytics")
    @PreAuthorize("hasAnyRole('ADMIN', 'BROKER')")
    public ResponseEntity<Map<String, Object>> getAnalyticsDashboard() {
        return ResponseEntity.ok(analyticsService.getAnalyticsDashboard());
    }

    @GetMapping("/real-time")
    @PreAuthorize("authenticated")
    public ResponseEntity<Map<String, Object>> getRealTimeData(Authentication auth) {
        // Return role-specific real-time data
        if (auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return ResponseEntity.ok(analyticsService.getAdminDashboardData());
        } else if (auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_BROKER"))) {
            Long brokerId = 1L;
            return ResponseEntity.ok(analyticsService.getBrokerDashboardData(brokerId));
        } else {
            Long userId = 1L;
            return ResponseEntity.ok(analyticsService.getUserDashboardData(userId));
        }
    }
}