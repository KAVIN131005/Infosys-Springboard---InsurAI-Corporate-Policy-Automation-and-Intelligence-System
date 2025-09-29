package com.example.insur.service;

import com.example.insur.entity.UserPolicy;
import com.example.insur.entity.User;
import com.example.insur.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final SimpMessagingTemplate messagingTemplate;
    private final UserRepository userRepository;

    /**
     * Send notification when a policy is auto-approved by AI
     */
    public void sendPolicyAutoApprovedNotification(UserPolicy userPolicy) {
        try {
            User user = userPolicy.getUser();
            String policyName = userPolicy.getPolicy().getName();
            
            // Create notification data
            Map<String, Object> notification = createNotificationBase(
                "POLICY_AUTO_APPROVED",
                "Your policy application has been automatically approved!",
                String.format("Your %s policy has been automatically approved by our AI system. Your policy is now active.", policyName)
            );
            
            notification.put("policyId", userPolicy.getId());
            notification.put("policyName", policyName);
            notification.put("riskLevel", extractRiskLevelFromNotes(userPolicy.getApprovalNotes()));
            notification.put("startDate", userPolicy.getStartDate());
            notification.put("monthlyPremium", userPolicy.getMonthlyPremium());
            
            // Send to user
            sendToUser(user.getId(), notification);
            
            // Send to all admins
            sendToAdmins(createAdminNotification(
                "POLICY_AUTO_APPROVED",
                "Policy Auto-Approved",
                String.format("Policy for %s %s (%s) was automatically approved by AI", 
                    user.getFirstName(), user.getLastName(), policyName)
            ));
            
            // Send to brokers (if applicable)
            sendToBrokers(createBrokerNotification(
                "POLICY_AUTO_APPROVED", 
                "Policy Auto-Approved",
                String.format("Policy for %s %s (%s) was automatically approved", 
                    user.getFirstName(), user.getLastName(), policyName)
            ));
            
            log.info("Sent auto-approval notifications for policy {} (user: {})", userPolicy.getId(), user.getId());
            
        } catch (Exception e) {
            log.error("Failed to send auto-approval notification for policy {}: {}", userPolicy.getId(), e.getMessage());
        }
    }

    /**
     * Send notification when a policy requires admin approval
     */
    public void sendPolicyPendingApprovalNotification(UserPolicy userPolicy) {
        try {
            User user = userPolicy.getUser();
            String policyName = userPolicy.getPolicy().getName();
            
            // Create notification for user
            Map<String, Object> userNotification = createNotificationBase(
                "POLICY_PENDING_APPROVAL",
                "Your policy application is under review",
                String.format("Your %s policy application is being reviewed by our team. You'll be notified once approved.", policyName)
            );
            
            userNotification.put("policyId", userPolicy.getId());
            userNotification.put("policyName", policyName);
            userNotification.put("reason", userPolicy.getApprovalNotes());
            
            // Send to user
            sendToUser(user.getId(), userNotification);
            
            // Create notification for admins (high priority)
            Map<String, Object> adminNotification = createAdminNotification(
                "POLICY_REQUIRES_APPROVAL",
                "High-Risk Policy Requires Your Approval",
                String.format("Policy application from %s %s (%s) requires admin approval due to high risk assessment", 
                    user.getFirstName(), user.getLastName(), policyName)
            );
            
            adminNotification.put("policyId", userPolicy.getId());
            adminNotification.put("userId", user.getId());
            adminNotification.put("userName", user.getFirstName() + " " + user.getLastName());
            adminNotification.put("policyName", policyName);
            adminNotification.put("riskScore", userPolicy.getRiskScore());
            adminNotification.put("reason", userPolicy.getApprovalNotes());
            adminNotification.put("priority", "HIGH");
            adminNotification.put("actionRequired", true);
            
            // Send to all admins
            sendToAdmins(adminNotification);
            
            log.info("Sent pending approval notifications for policy {} (user: {})", userPolicy.getId(), user.getId());
            
        } catch (Exception e) {
            log.error("Failed to send pending approval notification for policy {}: {}", userPolicy.getId(), e.getMessage());
        }
    }

    /**
     * Send notification when an admin approves a policy
     */
    public void sendPolicyApprovedByAdminNotification(UserPolicy userPolicy) {
        try {
            User user = userPolicy.getUser();
            String policyName = userPolicy.getPolicy().getName();
            
            // Create notification for user
            Map<String, Object> userNotification = createNotificationBase(
                "POLICY_APPROVED_BY_ADMIN",
                "Your policy has been approved!",
                String.format("Great news! Your %s policy has been approved by our team and is now active.", policyName)
            );
            
            userNotification.put("policyId", userPolicy.getId());
            userNotification.put("policyName", policyName);
            userNotification.put("startDate", userPolicy.getStartDate());
            userNotification.put("monthlyPremium", userPolicy.getMonthlyPremium());
            userNotification.put("approvalNotes", userPolicy.getApprovalNotes());
            
            // Send to user
            sendToUser(user.getId(), userNotification);
            
            // Send to all admins (confirmation)
            sendToAdmins(createAdminNotification(
                "POLICY_APPROVED_BY_ADMIN",
                "Policy Approved",
                String.format("Policy for %s %s (%s) has been approved", 
                    user.getFirstName(), user.getLastName(), policyName)
            ));
            
            // Send to brokers
            sendToBrokers(createBrokerNotification(
                "POLICY_APPROVED_BY_ADMIN",
                "Policy Approved",
                String.format("Policy for %s %s (%s) has been approved by admin", 
                    user.getFirstName(), user.getLastName(), policyName)
            ));
            
            log.info("Sent admin approval notifications for policy {} (user: {})", userPolicy.getId(), user.getId());
            
        } catch (Exception e) {
            log.error("Failed to send admin approval notification for policy {}: {}", userPolicy.getId(), e.getMessage());
        }
    }

    /**
     * Send notification when an admin rejects a policy
     */
    public void sendPolicyRejectedByAdminNotification(UserPolicy userPolicy) {
        try {
            User user = userPolicy.getUser();
            String policyName = userPolicy.getPolicy().getName();
            
            // Create notification for user
            Map<String, Object> userNotification = createNotificationBase(
                "POLICY_REJECTED_BY_ADMIN",
                "Policy application update",
                String.format("We're unable to approve your %s policy application at this time.", policyName)
            );
            
            userNotification.put("policyId", userPolicy.getId());
            userNotification.put("policyName", policyName);
            userNotification.put("rejectionReason", userPolicy.getApprovalNotes());
            
            // Send to user
            sendToUser(user.getId(), userNotification);
            
            // Send to admins (confirmation)
            sendToAdmins(createAdminNotification(
                "POLICY_REJECTED_BY_ADMIN",
                "Policy Rejected",
                String.format("Policy for %s %s (%s) has been rejected", 
                    user.getFirstName(), user.getLastName(), policyName)
            ));
            
            log.info("Sent rejection notifications for policy {} (user: {})", userPolicy.getId(), user.getId());
            
        } catch (Exception e) {
            log.error("Failed to send rejection notification for policy {}: {}", userPolicy.getId(), e.getMessage());
        }
    }

    // Helper methods
    
    private Map<String, Object> createNotificationBase(String type, String title, String message) {
        Map<String, Object> notification = new HashMap<>();
        notification.put("id", java.util.UUID.randomUUID().toString());
        notification.put("type", type);
        notification.put("title", title);
        notification.put("message", message);
        notification.put("timestamp", LocalDateTime.now());
        notification.put("read", false);
        return notification;
    }
    
    private Map<String, Object> createAdminNotification(String type, String title, String message) {
        Map<String, Object> notification = createNotificationBase(type, title, message);
        notification.put("targetRole", "ADMIN");
        return notification;
    }
    
    private Map<String, Object> createBrokerNotification(String type, String title, String message) {
        Map<String, Object> notification = createNotificationBase(type, title, message);
        notification.put("targetRole", "BROKER");
        return notification;
    }

    private void sendToUser(Long userId, Map<String, Object> notification) {
        try {
            messagingTemplate.convertAndSend("/topic/user/" + userId + "/notifications", notification);
            log.debug("Sent notification to user {}: {}", userId, notification.get("type"));
        } catch (Exception e) {
            log.error("Failed to send notification to user {}: {}", userId, e.getMessage());
        }
    }

    private void sendToAdmins(Map<String, Object> notification) {
        try {
            List<User> admins = userRepository.findByRole("ADMIN");
            for (User admin : admins) {
                messagingTemplate.convertAndSend("/topic/user/" + admin.getId() + "/notifications", notification);
            }
            messagingTemplate.convertAndSend("/topic/role/ADMIN/notifications", notification);
            log.debug("Sent notification to {} admins: {}", admins.size(), notification.get("type"));
        } catch (Exception e) {
            log.error("Failed to send notification to admins: {}", e.getMessage());
        }
    }

    private void sendToBrokers(Map<String, Object> notification) {
        try {
            List<User> brokers = userRepository.findByRole("BROKER");
            for (User broker : brokers) {
                messagingTemplate.convertAndSend("/topic/user/" + broker.getId() + "/notifications", notification);
            }
            messagingTemplate.convertAndSend("/topic/role/BROKER/notifications", notification);
            log.debug("Sent notification to {} brokers: {}", brokers.size(), notification.get("type"));
        } catch (Exception e) {
            log.error("Failed to send notification to brokers: {}", e.getMessage());
        }
    }

    private String extractRiskLevelFromNotes(String notes) {
        if (notes != null) {
            if (notes.contains("Risk Level: LOW")) return "LOW";
            if (notes.contains("Risk Level: MEDIUM")) return "MEDIUM";
            if (notes.contains("Risk Level: HIGH")) return "HIGH";
        }
        return "UNKNOWN";
    }
}