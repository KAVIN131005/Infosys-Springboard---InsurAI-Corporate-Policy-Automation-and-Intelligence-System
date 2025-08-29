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
        dto.setFileName(policy.getFileName());
        dto.setAnalysisResult(policy.getAnalysisResult());
        dto.setUploadedBy(policy.getUploadedBy().getUsername());
        return dto;
    }
}