package com.example.insur.service;

import com.example.insur.entity.*;
import com.example.insur.repository.*;
import com.example.insur.dto.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserPolicyService {

    @Autowired
    private UserPolicyRepository userPolicyRepository;

    @Autowired
    private PolicyRepository policyRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AiOrchestrationService aiOrchestrationService;

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private NotificationService notificationService;

    public UserPolicyDto applyForPolicy(Long userId, PolicyApplicationRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Policy policy = policyRepository.findById(request.getPolicyId())
                .orElseThrow(() -> new RuntimeException("Policy not found"));

        // Check if user already has this policy
        Optional<UserPolicy> existingPolicy = userPolicyRepository.findByUserAndPolicy(user, policy);
        if (existingPolicy.isPresent()) {
            throw new RuntimeException("User already has this policy");
        }

        // Create user policy application
        UserPolicy userPolicy = new UserPolicy();
        userPolicy.setUser(user);
        userPolicy.setPolicy(policy);
        userPolicy.setStatus("APPLIED");
        userPolicy.setMonthlyPremium(policy.getMonthlyPremium());
        userPolicy.setApplicationData(convertApplicationToJson(request));
        userPolicy.setPaymentStatus("PENDING");

        // AI Risk Assessment
        try {
            String riskAssessment = aiOrchestrationService.assessApplicationRisk(request);
            userPolicy.setAiAssessment(riskAssessment);
            
            // Extract risk score and level from AI response
            BigDecimal riskScore = extractRiskScore(riskAssessment);
            String riskLevel = extractRiskLevel(riskAssessment);
            userPolicy.setRiskScore(riskScore);

            // Financial check: policy monthly premium should be less than or equal to user's monthly salary
            boolean financialOkay = false;
            if (request.getAnnualSalary() != null) {
                try {
                    java.math.BigDecimal monthlySalary = request.getAnnualSalary().divide(new java.math.BigDecimal("12"));
                    financialOkay = userPolicy.getMonthlyPremium().compareTo(monthlySalary) <= 0;
                } catch (Exception ex) {
                    financialOkay = false;
                }
            }

            // Age check: require age between 18 and 65 for auto-approval
            boolean ageOkay = request.getAge() != null && request.getAge() >= 18 && request.getAge() <= 65;

            // NEW LOGIC: LOW/MEDIUM risk = auto-approve (if other checks pass), HIGH risk = admin approval required
            boolean policyRequiresApproval = Boolean.TRUE.equals(policy.getRequiresApproval());
            boolean isHighRisk = "HIGH".equals(riskLevel) || riskScore.compareTo(new BigDecimal("70")) >= 0;
            boolean isLowOrMediumRisk = "LOW".equals(riskLevel) || "MEDIUM".equals(riskLevel) || riskScore.compareTo(new BigDecimal("70")) < 0;

            if (!policyRequiresApproval && isLowOrMediumRisk && financialOkay && ageOkay) {
                // AUTO-APPROVE: LOW or MEDIUM risk with good financials and age
                userPolicy.setStatus("ACTIVE");
                userPolicy.setStartDate(LocalDate.now());
                userPolicy.setEndDate(LocalDate.now().plusYears(1));
                userPolicy.setNextPaymentDate(LocalDate.now().plusMonths(1));
                userPolicy.setPaymentStatus("CURRENT");
                userPolicy.setApprovalNotes("Auto-approved by AI - Risk Level: " + riskLevel + ", Score: " + riskScore);

                // Create first payment record
                paymentService.createPremiumPayment(userPolicy);
                
                // Save before notifications
                userPolicy = userPolicyRepository.save(userPolicy);
                
                // Send notifications to all stakeholders
                notificationService.sendPolicyAutoApprovedNotification(userPolicy);
                
            } else {
                // ADMIN APPROVAL REQUIRED: HIGH risk OR failed financial/age checks OR policy requires manual approval
                userPolicy.setStatus("PENDING_APPROVAL");
                String reason = "";
                if (isHighRisk) reason += "High risk (" + riskLevel + ", score: " + riskScore + "). ";
                if (!financialOkay) reason += "Financial check failed. ";
                if (!ageOkay) reason += "Age outside auto-approval range. ";
                if (policyRequiresApproval) reason += "Policy requires manual approval. ";
                
                userPolicy.setApprovalNotes("Pending admin review: " + reason.trim());
                
                // Save before notifications
                userPolicy = userPolicyRepository.save(userPolicy);
                
                // Send notification to admin for review
                notificationService.sendPolicyPendingApprovalNotification(userPolicy);
            }
        } catch (Exception e) {
            userPolicy.setStatus("PENDING_APPROVAL");
            userPolicy.setAiAssessment("AI assessment failed: " + e.getMessage());
        }

        userPolicy = userPolicyRepository.save(userPolicy);
        return convertToDto(userPolicy);
    }

    public List<UserPolicyDto> getUserPolicies(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<UserPolicy> userPolicies = userPolicyRepository.findByUser(user);
        return userPolicies.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<UserPolicyDto> getActivePolicies(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<UserPolicy> activePolicies = userPolicyRepository.findActiveUserPolicies(user);
        return activePolicies.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public UserPolicyDto approvePolicy(Long userPolicyId, String approvalNotes) {
        UserPolicy userPolicy = userPolicyRepository.findById(userPolicyId)
                .orElseThrow(() -> new RuntimeException("User policy not found"));

        if (!"PENDING_APPROVAL".equals(userPolicy.getStatus())) {
            throw new RuntimeException("Policy is not in pending approval status");
        }

        userPolicy.setStatus("ACTIVE");
        userPolicy.setStartDate(LocalDate.now());
        userPolicy.setEndDate(LocalDate.now().plusYears(1));
        userPolicy.setNextPaymentDate(LocalDate.now().plusMonths(1));
        userPolicy.setPaymentStatus("CURRENT");
        userPolicy.setApprovalNotes(approvalNotes != null ? approvalNotes : "Approved by admin");
        userPolicy.setApprovedDate(LocalDateTime.now());

        userPolicy = userPolicyRepository.save(userPolicy);

        // Create first payment record
        paymentService.createPremiumPayment(userPolicy);
        
        // Send notifications to all stakeholders (User, Broker, Admin)
        notificationService.sendPolicyApprovedByAdminNotification(userPolicy);

        return convertToDto(userPolicy);
    }

    public UserPolicyDto rejectPolicy(Long userPolicyId, String rejectionReason) {
        UserPolicy userPolicy = userPolicyRepository.findById(userPolicyId)
                .orElseThrow(() -> new RuntimeException("User policy not found"));

        userPolicy.setStatus("REJECTED");
        userPolicy.setApprovalNotes(rejectionReason != null ? rejectionReason : "Rejected by admin");
        userPolicy.setRejectedDate(LocalDateTime.now());

        userPolicy = userPolicyRepository.save(userPolicy);
        
        // Send notifications to all stakeholders
        notificationService.sendPolicyRejectedByAdminNotification(userPolicy);
        
        return convertToDto(userPolicy);
    }

    public List<UserPolicyDto> getPendingApprovals() {
        List<UserPolicy> pendingPolicies = userPolicyRepository.findByStatus("PENDING_APPROVAL");
        return pendingPolicies.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    private String convertApplicationToJson(PolicyApplicationRequest request) {
        // Simple JSON conversion (in real app, use ObjectMapper)
        return String.format("{\"firstName\":\"%s\",\"lastName\":\"%s\",\"email\":\"%s\",\"age\":%d}",
                request.getFirstName(), request.getLastName(), request.getEmail(), request.getAge());
    }

    private BigDecimal extractRiskScore(String aiAssessment) {
        // Enhanced risk score extraction
        try {
            if (aiAssessment.contains("LOW_RISK") || aiAssessment.contains("LOW RISK")) return new BigDecimal("25");
            if (aiAssessment.contains("MEDIUM_RISK") || aiAssessment.contains("MEDIUM RISK")) return new BigDecimal("50");
            if (aiAssessment.contains("HIGH_RISK") || aiAssessment.contains("HIGH RISK")) return new BigDecimal("85");
            
            // Try to extract numeric score if present
            String[] parts = aiAssessment.split("score[:\\s]+");
            if (parts.length > 1) {
                String scorePart = parts[1].split("[^0-9.]")[0];
                return new BigDecimal(scorePart);
            }
        } catch (Exception e) {
            // Default to medium risk
        }
        return new BigDecimal("50");
    }
    
    private String extractRiskLevel(String aiAssessment) {
        // Extract risk level from AI response
        try {
            if (aiAssessment.contains("LOW_RISK") || aiAssessment.contains("LOW RISK")) return "LOW";
            if (aiAssessment.contains("MEDIUM_RISK") || aiAssessment.contains("MEDIUM RISK")) return "MEDIUM";
            if (aiAssessment.contains("HIGH_RISK") || aiAssessment.contains("HIGH RISK")) return "HIGH";
        } catch (Exception e) {
            // Default to medium risk
        }
        return "MEDIUM";
    }

    public void save(UserPolicy userPolicy) {
        userPolicyRepository.save(userPolicy);
    }

    public UserPolicy findById(Long id) {
        return userPolicyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("UserPolicy not found"));
    }

    private UserPolicyDto convertToDto(UserPolicy userPolicy) {
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
        
        // Set related entities (simplified)
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

    // Get all pending applications for admin review
    public List<UserPolicyDto> getPendingApplications() {
        return userPolicyRepository.findByStatus("PENDING_APPROVAL").stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // Admin approve application
    public UserPolicyDto approveApplication(Long applicationId, String approvalNotes) {
        UserPolicy userPolicy = findById(applicationId);
        userPolicy.setStatus("ACTIVE");
        userPolicy.setApprovalNotes(approvalNotes);
        userPolicy.setStartDate(LocalDate.now());
        userPolicy.setEndDate(LocalDate.now().plusYears(1));
        userPolicy.setNextPaymentDate(LocalDate.now().plusMonths(1));
        userPolicy.setPaymentStatus("CURRENT");
        userPolicy.setUpdatedAt(LocalDateTime.now());
        
        // Create first payment record
        paymentService.createPremiumPayment(userPolicy);
        
        userPolicy = userPolicyRepository.save(userPolicy);
        return convertToDto(userPolicy);
    }

    // Admin reject application
    public UserPolicyDto rejectApplication(Long applicationId, String rejectionReason) {
        UserPolicy userPolicy = findById(applicationId);
        userPolicy.setStatus("REJECTED");
        userPolicy.setApprovalNotes(rejectionReason);
        userPolicy.setUpdatedAt(LocalDateTime.now());
        
        userPolicy = userPolicyRepository.save(userPolicy);
        return convertToDto(userPolicy);
    }

    // Get applications by user
    public List<UserPolicyDto> getUserApplications(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return userPolicyRepository.findByUser(user).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // Get all active policies
    public List<UserPolicyDto> getAllActivePolicies() {
        return userPolicyRepository.findByStatus("ACTIVE").stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // Calculate user risk score based on multiple factors
    public BigDecimal calculateUserRiskScore(PolicyApplicationRequest request) {
        BigDecimal baseScore = new BigDecimal("50"); // Base score
        
        // Age factor
        if (request.getAge() < 25) baseScore = baseScore.add(new BigDecimal("20"));
        else if (request.getAge() > 65) baseScore = baseScore.add(new BigDecimal("30"));
        else if (request.getAge() >= 25 && request.getAge() <= 45) baseScore = baseScore.subtract(new BigDecimal("10"));
        
        // Occupation factor
        if (request.getOccupation() != null) {
            String occupation = request.getOccupation().toLowerCase();
            if (occupation.contains("doctor") || occupation.contains("engineer") || occupation.contains("teacher")) {
                baseScore = baseScore.subtract(new BigDecimal("10")); // Low risk occupations
            } else if (occupation.contains("driver") || occupation.contains("construction") || occupation.contains("pilot")) {
                baseScore = baseScore.add(new BigDecimal("15")); // High risk occupations
            }
        }
        
        // Ensure score is between 0 and 100
        if (baseScore.compareTo(new BigDecimal("100")) > 0) baseScore = new BigDecimal("100");
        if (baseScore.compareTo(BigDecimal.ZERO) < 0) baseScore = BigDecimal.ZERO;
        
        return baseScore;
    }

    // Calculate premium for a policy application
    public BigDecimal calculatePremium(PolicyApplicationRequest request, User user) {
        // Get the base policy
        Policy policy = policyRepository.findById(request.getPolicyId())
                .orElseThrow(() -> new RuntimeException("Policy not found"));
        
        BigDecimal basePremium = policy.getMonthlyPremium();
        BigDecimal riskScore = calculateUserRiskScore(request);
        
        // Adjust premium based on risk score (0-100 scale)
        // Risk score of 50 = no adjustment, higher = increase premium, lower = decrease premium
        BigDecimal riskMultiplier = riskScore.divide(new BigDecimal("50"), 4, RoundingMode.HALF_UP);
        BigDecimal adjustedPremium = basePremium.multiply(riskMultiplier);
        
        // Apply minimum and maximum bounds
        BigDecimal minPremium = basePremium.multiply(new BigDecimal("0.5")); // 50% minimum
        BigDecimal maxPremium = basePremium.multiply(new BigDecimal("2.0")); // 200% maximum
        
        if (adjustedPremium.compareTo(minPremium) < 0) adjustedPremium = minPremium;
        if (adjustedPremium.compareTo(maxPremium) > 0) adjustedPremium = maxPremium;
        
        return adjustedPremium.setScale(2, RoundingMode.HALF_UP);
    }

    // Calculate user risk score by user ID
    public BigDecimal calculateUserRiskScore(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Create a mock application request with user data for calculation
        PolicyApplicationRequest mockRequest = new PolicyApplicationRequest();
        mockRequest.setAge(calculateAge(user.getDateOfBirth()));
        // Note: We might need to store more user profile data for better risk assessment
        
        return calculateUserRiskScore(mockRequest);
    }

    private int calculateAge(java.time.LocalDate birthDate) {
        if (birthDate == null) return 30; // Default age if not provided
        return java.time.Period.between(birthDate, java.time.LocalDate.now()).getYears();
    }
}
