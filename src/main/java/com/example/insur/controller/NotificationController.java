package com.example.insur.controller;

import com.example.insur.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.annotation.SubscribeMapping;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Controller
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    @MessageMapping("/connect")
    @SendTo("/topic/connected")
    public Map<String, Object> handleConnect(Authentication authentication) {
        Map<String, Object> response = new HashMap<>();
        response.put("type", "CONNECTION_ESTABLISHED");
        response.put("timestamp", LocalDateTime.now());
        response.put("user", authentication != null ? authentication.getName() : "anonymous");
        
        log.info("WebSocket connection established for user: {}", 
                authentication != null ? authentication.getName() : "anonymous");
        
        return response;
    }

    @SubscribeMapping("/topic/user/{userId}/notifications")
    public Map<String, Object> subscribeToUserNotifications(Authentication authentication) {
        Map<String, Object> response = new HashMap<>();
        response.put("type", "SUBSCRIPTION_CONFIRMED");
        response.put("channel", "user_notifications");
        response.put("timestamp", LocalDateTime.now());
        
        log.info("User {} subscribed to personal notifications", 
                authentication != null ? authentication.getName() : "anonymous");
        
        return response;
    }

    @SubscribeMapping("/topic/role/{role}/notifications")
    public Map<String, Object> subscribeToRoleNotifications(Authentication authentication) {
        Map<String, Object> response = new HashMap<>();
        response.put("type", "SUBSCRIPTION_CONFIRMED");
        response.put("channel", "role_notifications");
        response.put("timestamp", LocalDateTime.now());
        
        log.info("User {} subscribed to role notifications", 
                authentication != null ? authentication.getName() : "anonymous");
        
        return response;
    }

    @MessageMapping("/mark-read")
    public void markNotificationAsRead(Map<String, String> payload, Authentication authentication) {
        String notificationId = payload.get("notificationId");
        
        log.info("Marking notification {} as read for user: {}", 
                notificationId, authentication != null ? authentication.getName() : "anonymous");
        
        // Here you could implement actual notification persistence and mark as read
        // For now, just log the action
    }
}