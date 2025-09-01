package com.example.insur.service;

import com.example.insur.entity.*;
import com.example.insur.repository.*;
import com.example.insur.dto.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
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
            
            // Extract risk score from AI response (simplified)
            BigDecimal riskScore = extractRiskScore(riskAssessment);
            userPolicy.setRiskScore(riskScore);

            // Auto-approve if low risk and policy allows
            if (!policy.getRequiresApproval() && riskScore.compareTo(new BigDecimal("30")) < 0) {
                userPolicy.setStatus("ACTIVE");
                userPolicy.setStartDate(LocalDate.now());
                userPolicy.setEndDate(LocalDate.now().plusYears(1));
                userPolicy.setNextPaymentDate(LocalDate.now().plusMonths(1));
                userPolicy.setPaymentStatus("CURRENT");
                
                // Create first payment record
                paymentService.createPremiumPayment(userPolicy);
            } else {
                userPolicy.setStatus("PENDING_APPROVAL");
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
        userPolicy.setApprovalNotes(approvalNotes);

        userPolicy = userPolicyRepository.save(userPolicy);

        // Create first payment record
        paymentService.createPremiumPayment(userPolicy);

        return convertToDto(userPolicy);
    }

    public UserPolicyDto rejectPolicy(Long userPolicyId, String rejectionReason) {
        UserPolicy userPolicy = userPolicyRepository.findById(userPolicyId)
                .orElseThrow(() -> new RuntimeException("User policy not found"));

        userPolicy.setStatus("REJECTED");
        userPolicy.setApprovalNotes(rejectionReason);

        userPolicy = userPolicyRepository.save(userPolicy);
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
        // Simplified risk score extraction
        try {
            if (aiAssessment.contains("LOW_RISK")) return new BigDecimal("20");
            if (aiAssessment.contains("MEDIUM_RISK")) return new BigDecimal("50");
            if (aiAssessment.contains("HIGH_RISK")) return new BigDecimal("80");
        } catch (Exception e) {
            // Default to medium risk
        }
        return new BigDecimal("50");
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
}
