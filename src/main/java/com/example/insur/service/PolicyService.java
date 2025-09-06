package com.example.insur.service;

import com.example.insur.dto.PolicyDto;
import com.example.insur.entity.Policy;
import com.example.insur.entity.User;
import com.example.insur.repository.PolicyRepository;

import lombok.RequiredArgsConstructor;
import org.apache.tika.Tika;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PolicyService {

    private final PolicyRepository policyRepository;
    private final FileStorageService fileStorageService;
    private final AiOrchestrationService aiOrchestrationService;
    private final UserService userService;

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
            // Note: For now setting uploadedBy to null due to string/User mismatch
            // In real implementation, should find User by username and set the User object
            policy.setStatus("PENDING");
            policy.setType("GENERAL");
            policy.setMonthlyPremium(BigDecimal.valueOf(100.00)); // Default value
            policy.setYearlyPremium(BigDecimal.valueOf(1200.00)); // Default value
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
        if (!username.equals(policy.getUploadedBy())) {
            throw new RuntimeException("Unauthorized to update this policy");
        }
        return updatePolicy(id, policyDto);
    }

    public void deletePolicy(Long id) {
        policyRepository.deleteById(id);
    }

    public void deleteBrokerPolicy(Long id, String username) {
        Policy policy = policyRepository.findById(id).orElseThrow(() -> new RuntimeException("Policy not found"));
        if (!username.equals(policy.getUploadedBy())) {
            throw new RuntimeException("Unauthorized to delete this policy");
        }
        policyRepository.deleteById(id);
    }

    public void approvePolicy(Long id) {
        Policy policy = policyRepository.findById(id).orElseThrow(() -> new RuntimeException("Policy not found"));
        policy.setStatus("ACTIVE");
        policy.setUpdatedAt(LocalDateTime.now());
        policyRepository.save(policy);
    }

    public void rejectPolicy(Long id, String reason) {
        Policy policy = policyRepository.findById(id).orElseThrow(() -> new RuntimeException("Policy not found"));
        policy.setStatus("REJECTED");
        policy.setUpdatedAt(LocalDateTime.now());
        policyRepository.save(policy);
    }

    public PolicyDto applyForPolicy(Long policyId, String username) {
        Policy policy = policyRepository.findById(policyId).orElseThrow(() -> new RuntimeException("Policy not found"));
        // Logic for user applying for policy - create UserPolicy entry
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
}