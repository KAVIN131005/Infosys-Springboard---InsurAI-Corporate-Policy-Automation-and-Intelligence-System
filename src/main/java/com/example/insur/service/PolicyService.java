package com.example.insur.service;

import com.example.insur.dto.PolicyDto;
import com.example.insur.entity.Policy;
import com.example.insur.entity.User;
import com.example.insur.entity.UserPolicy;
import com.example.insur.repository.PolicyRepository;

import lombok.RequiredArgsConstructor;
import org.apache.tika.Tika;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.Period;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PolicyService {

    private final PolicyRepository policyRepository;
    private final FileStorageService fileStorageService;
    private final AiOrchestrationService aiOrchestrationService;
    private final UserService userService;
    private final UserPolicyService userPolicyService;

    public PolicyDto uploadPolicy(MultipartFile file) {
        try {
            String filePath = fileStorageService.storeFile(file);
            Tika tika = new Tika();
            String text;
            try {
                text = tika.parseToString(file.getInputStream());
            } catch (org.apache.tika.exception.TikaException e) {
                throw new RuntimeException("Failed to parse file with Tika", e);
            }

            String analysis = aiOrchestrationService.analyzePolicy(text);

            User user = userService.getCurrentUser();
            Policy policy = new Policy();
            policy.setFileName(file.getOriginalFilename());
            policy.setFilePath(filePath);
            policy.setAnalysisResult(analysis);
            policy.setUploadedBy(user);
            policy = policyRepository.save(policy);

            return mapToDto(policy);
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload policy", e);
        }
    }

    public PolicyDto uploadPolicy(MultipartFile file, String name, String description, String username) {
        try {
            String filePath = fileStorageService.storeFile(file);
            Tika tika = new Tika();
            String text;
            try {
                text = tika.parseToString(file.getInputStream());
            } catch (org.apache.tika.exception.TikaException e) {
                throw new RuntimeException("Failed to parse file with Tika", e);
            }

            String analysis = aiOrchestrationService.analyzePolicy(text);

            Policy policy = new Policy();
            policy.setName(name != null ? name : file.getOriginalFilename());
            policy.setDescription(description);
            policy.setFileName(file.getOriginalFilename());
            policy.setFilePath(filePath);
            policy.setAnalysisResult(analysis);
            
            // Set uploadedBy: resolve User by username or use current user
            User uploader = null;
            if (username != null && !username.isBlank()) {
                try {
                    uploader = userService.findByUsername(username);
                } catch (Exception ex) {
                    uploader = userService.getCurrentUser();
                }
            } else {
                uploader = userService.getCurrentUser();
            }
            policy.setUploadedBy(uploader);
            policy.setBroker(uploader); // Set broker as well

            policy.setStatus("PENDING");
            
            // Extract policy details from AI analysis
            extractPolicyDetailsFromAnalysis(policy, analysis);
            
            policy.setCreatedAt(LocalDateTime.now());
            policy = policyRepository.save(policy);

            return mapToDto(policy);
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload policy", e);
        }
    }

    public List<PolicyDto> getAllPolicies() {
        return policyRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public PolicyDto createPolicy(PolicyDto policyDto) {
        Policy policy = new Policy();
        policy.setName(policyDto.getName());
        policy.setDescription(policyDto.getDescription());
        policy.setType(policyDto.getType());
        policy.setSubType(policyDto.getSubType());
        policy.setMonthlyPremium(policyDto.getMonthlyPremium());
        policy.setYearlyPremium(policyDto.getYearlyPremium());
        policy.setCoverage(policyDto.getCoverage());
        policy.setDeductible(policyDto.getDeductible());
        policy.setStatus("PENDING");
        policy.setCreatedAt(LocalDateTime.now());
        policy = policyRepository.save(policy);
        return mapToDto(policy);
    }

    public PolicyDto updatePolicy(Long id, PolicyDto policyDto) {
        Policy policy = policyRepository.findById(id).orElseThrow(() -> new RuntimeException("Policy not found"));
        policy.setName(policyDto.getName());
        policy.setDescription(policyDto.getDescription());
        policy.setType(policyDto.getType());
        policy.setSubType(policyDto.getSubType());
        policy.setMonthlyPremium(policyDto.getMonthlyPremium());
        policy.setYearlyPremium(policyDto.getYearlyPremium());
        policy.setCoverage(policyDto.getCoverage());
        policy.setDeductible(policyDto.getDeductible());
        policy.setUpdatedAt(LocalDateTime.now());
        policy = policyRepository.save(policy);
        return mapToDto(policy);
    }

    public PolicyDto updateBrokerPolicy(Long id, PolicyDto policyDto, String username) {
        Policy policy = policyRepository.findById(id).orElseThrow(() -> new RuntimeException("Policy not found"));
        String uploaderUsername = policy.getUploadedBy() != null ? policy.getUploadedBy().getUsername() : null;
        if (uploaderUsername == null || !uploaderUsername.equals(username)) {
            throw new RuntimeException("Unauthorized to update this policy");
        }
        return updatePolicy(id, policyDto);
    }

    public void deletePolicy(Long id) {
        policyRepository.deleteById(id);
    }

    public void deleteBrokerPolicy(Long id, String username) {
        Policy policy = policyRepository.findById(id).orElseThrow(() -> new RuntimeException("Policy not found"));
        String uploaderUsername = policy.getUploadedBy() != null ? policy.getUploadedBy().getUsername() : null;
        if (uploaderUsername == null || !uploaderUsername.equals(username)) {
            throw new RuntimeException("Unauthorized to delete this policy");
        }
        policyRepository.deleteById(id);
    }



    public PolicyDto applyForPolicy(Long policyId, String username) {
        Policy policy = policyRepository.findById(policyId).orElseThrow(() -> new RuntimeException("Policy not found"));
        User user = userService.findByUsername(username);
        
        // Check if policy is active and available
        if (!"ACTIVE".equals(policy.getStatus())) {
            throw new RuntimeException("Policy is not available for application");
        }
        
        // Check if user already applied for this policy
        boolean alreadyApplied = user.getUserPolicies().stream()
                .anyMatch(up -> up.getPolicy().getId().equals(policyId) && 
                         !"REJECTED".equals(up.getStatus()) && !"CANCELLED".equals(up.getStatus()));
        
        if (alreadyApplied) {
            throw new RuntimeException("You have already applied for this policy");
        }
        
        // Create UserPolicy application
        UserPolicy userPolicy = new UserPolicy();
        userPolicy.setUser(user);
        userPolicy.setPolicy(policy);
        userPolicy.setStatus("APPLIED");
        userPolicy.setMonthlyPremium(policy.getMonthlyPremium());
        
        // AI Risk Assessment
        String aiAssessment = aiOrchestrationService.assessUserRisk(user, policy);
        userPolicy.setAiAssessment(aiAssessment);
        
        // Calculate risk score based on age and other factors
        BigDecimal riskScore = calculateUserRiskScore(user, policy);
        userPolicy.setRiskScore(riskScore);
        
        // Auto-approve low risk applications
        if (riskScore.compareTo(new BigDecimal("30")) <= 0) {
            userPolicy.setStatus("ACTIVE");
            userPolicy.setStartDate(LocalDate.now());
            userPolicy.setEndDate(LocalDate.now().plusYears(1));
            userPolicy.setApprovalNotes("Auto-approved based on low risk assessment");
        } else if (riskScore.compareTo(new BigDecimal("70")) > 0) {
            userPolicy.setStatus("PENDING_APPROVAL");
            userPolicy.setApprovalNotes("High risk - requires manual approval");
        } else {
            userPolicy.setStatus("PENDING_APPROVAL");
            userPolicy.setApprovalNotes("Medium risk - requires manual review");
        }
        
        // Save through UserPolicyService
        userPolicyService.save(userPolicy);
        
        return mapToDto(policy);
    }

    public List<PolicyDto> getPoliciesForUser() {
        User user = userService.getCurrentUser();
        return policyRepository.findByUploadedBy(user).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public PolicyDto getPolicyById(Long id) {
        Policy policy = policyRepository.findById(id).orElseThrow();
        return mapToDto(policy);
    }

    public List<PolicyDto> getAllActivePolicies() {
        return policyRepository.findByStatus("ACTIVE").stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    // Method for users to see available policies for purchase
    public List<PolicyDto> getAvailablePolicies() {
        // Return all ACTIVE policies that users can apply for
        return policyRepository.findByStatus("ACTIVE").stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    // Method for admins to approve/reject policies
    public PolicyDto approvePolicy(Long policyId) {
        Policy policy = policyRepository.findById(policyId)
                .orElseThrow(() -> new RuntimeException("Policy not found"));
        policy.setStatus("ACTIVE");
        policy.setUpdatedAt(LocalDateTime.now());
        policy = policyRepository.save(policy);
        return mapToDto(policy);
    }

    public PolicyDto rejectPolicy(Long policyId, String reason) {
        Policy policy = policyRepository.findById(policyId)
                .orElseThrow(() -> new RuntimeException("Policy not found"));
        policy.setStatus("REJECTED");
        policy.setUpdatedAt(LocalDateTime.now());
        policy = policyRepository.save(policy);
        return mapToDto(policy);
    }

    // Method to get policies pending approval
    public List<PolicyDto> getPendingPolicies() {
        return policyRepository.findByStatus("PENDING").stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<PolicyDto> getBrokerPolicies(String username) {
        User broker = userService.findByUsername(username);
        return policyRepository.findByBroker(broker).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<PolicyDto> getPoliciesByStatus(String status) {
        return policyRepository.findByStatus(status).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<PolicyDto> getPoliciesByType(String type) {
        return policyRepository.findByTypeAndStatus(type, "ACTIVE").stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private PolicyDto mapToDto(Policy policy) {
        PolicyDto dto = new PolicyDto();
        dto.setId(policy.getId());
        dto.setName(policy.getName());
        dto.setDescription(policy.getDescription());
        dto.setType(policy.getType());
        dto.setSubType(policy.getSubType());
        dto.setMonthlyPremium(policy.getMonthlyPremium());
        dto.setYearlyPremium(policy.getYearlyPremium());
        dto.setCoverage(policy.getCoverage());
        dto.setDeductible(policy.getDeductible());
        dto.setStatus(policy.getStatus());
        dto.setRiskLevel(policy.getRiskLevel());
        dto.setRequiresApproval(policy.getRequiresApproval());
        dto.setFileName(policy.getFileName());
        dto.setAnalysisResult(policy.getAnalysisResult());
        dto.setUploadedBy(policy.getUploadedBy() != null ? policy.getUploadedBy().getUsername() : "System");
        dto.setCreatedAt(policy.getCreatedAt());
        dto.setUpdatedAt(policy.getUpdatedAt());
        return dto;
    }

    private void extractPolicyDetailsFromAnalysis(Policy policy, String analysis) {
        // Simple AI analysis parsing - in real implementation, use proper JSON parsing
        try {
            if (analysis.contains("HEALTH")) {
                policy.setType("HEALTH");
                policy.setSubType("HEALTH_BASIC");
            } else if (analysis.contains("AUTO")) {
                policy.setType("AUTO");
                policy.setSubType("CAR_INSURANCE");
            } else if (analysis.contains("LIFE")) {
                policy.setType("LIFE");
                policy.setSubType("LIFE_TERM");
            } else if (analysis.contains("HOME")) {
                policy.setType("PROPERTY");
                policy.setSubType("HOME_INSURANCE");
            } else {
                policy.setType("GENERAL");
                policy.setSubType("GENERAL_COVERAGE");
            }

            // Extract premium from analysis (simplified)
            // Try to parse explicit numeric values from analysis (e.g. "$200" or "monthly premium: 200")
            boolean parsedPremium = false;
            try {
                java.util.regex.Pattern monthlyPattern = java.util.regex.Pattern.compile("(?i)(monthly\\s*premium|monthly premium|premium)[:\\s\\$]*([0-9]{1,3}(?:,[0-9]{3})*(?:\\.[0-9]{1,2})?)");
                java.util.regex.Matcher m = monthlyPattern.matcher(analysis);
                if (m.find()) {
                    String num = m.group(2).replaceAll(",", "");
                    java.math.BigDecimal monthly = new java.math.BigDecimal(num);
                    policy.setMonthlyPremium(monthly);
                    policy.setYearlyPremium(monthly.multiply(new java.math.BigDecimal("12")));
                    parsedPremium = true;
                }
            } catch (Exception e) {
                // ignore and fall back to token-based parsing
            }

            if (!parsedPremium) {
                if (analysis.contains("HIGH_PREMIUM")) {
                    policy.setMonthlyPremium(new BigDecimal("500.00"));
                    policy.setYearlyPremium(new BigDecimal("6000.00"));
                } else if (analysis.contains("LOW_PREMIUM")) {
                    policy.setMonthlyPremium(new BigDecimal("50.00"));
                    policy.setYearlyPremium(new BigDecimal("600.00"));
                } else {
                    policy.setMonthlyPremium(new BigDecimal("200.00"));
                    policy.setYearlyPremium(new BigDecimal("2400.00"));
                }
            }

            // Set coverage based on type
            // Try to parse explicit coverage value from analysis (e.g. "$25,000" or "coverage: 25000")
            boolean parsedCoverage = false;
            try {
                java.util.regex.Pattern coveragePattern = java.util.regex.Pattern.compile("(?i)(coverage|sum insured|sum insured:)[:\\s\\$]*([0-9]{1,3}(?:,[0-9]{3})*(?:\\.[0-9]{1,2})?)");
                java.util.regex.Matcher c = coveragePattern.matcher(analysis);
                if (c.find()) {
                    String num = c.group(2).replaceAll(",", "");
                    java.math.BigDecimal coverageValue = new java.math.BigDecimal(num);
                    policy.setCoverage(coverageValue);
                    parsedCoverage = true;
                }
            } catch (Exception e) {
                // ignore and fall back to defaults
            }

            if (!parsedCoverage) {
                switch (policy.getType()) {
                    case "HEALTH":
                        policy.setCoverage(new BigDecimal("100000.00"));
                        policy.setDeductible(new BigDecimal("1000.00"));
                        break;
                    case "AUTO":
                        policy.setCoverage(new BigDecimal("50000.00"));
                        policy.setDeductible(new BigDecimal("500.00"));
                        break;
                    case "LIFE":
                        policy.setCoverage(new BigDecimal("500000.00"));
                        policy.setDeductible(new BigDecimal("0.00"));
                        break;
                    default:
                        policy.setCoverage(new BigDecimal("25000.00"));
                        policy.setDeductible(new BigDecimal("250.00"));
                }
            }

            // Set risk level
            if (analysis.contains("HIGH_RISK")) {
                policy.setRiskLevel("HIGH");
                policy.setRequiresApproval(true);
            } else if (analysis.contains("LOW_RISK")) {
                policy.setRiskLevel("LOW");
                policy.setRequiresApproval(false);
            } else {
                policy.setRiskLevel("MEDIUM");
                policy.setRequiresApproval(true);
            }
        } catch (Exception e) {
            // Default values if parsing fails
            policy.setType("GENERAL");
            policy.setSubType("GENERAL_COVERAGE");
            policy.setMonthlyPremium(new BigDecimal("100.00"));
            policy.setYearlyPremium(new BigDecimal("1200.00"));
            policy.setCoverage(new BigDecimal("25000.00"));
            policy.setDeductible(new BigDecimal("250.00"));
            policy.setRiskLevel("MEDIUM");
            policy.setRequiresApproval(true);
        }
    }

    private BigDecimal calculateUserRiskScore(User user, Policy policy) {
        BigDecimal riskScore = new BigDecimal("50"); // Base score

        try {
            // Age-based risk calculation
            if (user.getDateOfBirth() != null) {
                int age = Period.between(user.getDateOfBirth(), LocalDate.now()).getYears();
                
                if (age < 25) {
                    riskScore = riskScore.add(new BigDecimal("20")); // Young drivers higher risk
                } else if (age > 65) {
                    riskScore = riskScore.add(new BigDecimal("15")); // Senior drivers higher risk
                } else if (age >= 35 && age <= 55) {
                    riskScore = riskScore.subtract(new BigDecimal("10")); // Mature drivers lower risk
                }
            }

            // Policy type risk adjustment
            switch (policy.getType()) {
                case "AUTO":
                    riskScore = riskScore.add(new BigDecimal("10")); // Auto insurance generally higher risk
                    break;
                case "LIFE":
                    riskScore = riskScore.subtract(new BigDecimal("5")); // Life insurance lower risk
                    break;
                case "HEALTH":
                    riskScore = riskScore.add(new BigDecimal("5")); // Health insurance medium risk
                    break;
            }

            // Premium-based adjustment (higher premium usually means higher risk)
            if (policy.getMonthlyPremium().compareTo(new BigDecimal("300")) > 0) {
                riskScore = riskScore.add(new BigDecimal("10"));
            } else if (policy.getMonthlyPremium().compareTo(new BigDecimal("100")) < 0) {
                riskScore = riskScore.subtract(new BigDecimal("5"));
            }

            // Ensure score is within bounds
            if (riskScore.compareTo(new BigDecimal("0")) < 0) {
                riskScore = new BigDecimal("0");
            } else if (riskScore.compareTo(new BigDecimal("100")) > 0) {
                riskScore = new BigDecimal("100");
            }

        } catch (Exception e) {
            riskScore = new BigDecimal("50"); // Default medium risk if calculation fails
        }

        return riskScore;
    }
}