package com.example.insur.service;

import com.example.insur.dto.ClaimDto;
import com.example.insur.entity.Claim;
import com.example.insur.entity.Policy;
import com.example.insur.repository.ClaimRepository;
import com.example.insur.repository.PolicyRepository;
import lombok.RequiredArgsConstructor;

// import org.apache.catalina.User; // Removed incorrect import
import com.example.insur.entity.User;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClaimService {

    private final ClaimRepository claimRepository;
    private final PolicyRepository policyRepository;
    private final FileStorageService fileStorageService;
    private final AiOrchestrationService aiOrchestrationService;
    private final UserService userService;

    public ClaimDto submitClaim(MultipartFile file, Long policyId) {
        String filePath = fileStorageService.storeFile(file);
        Policy policy = policyRepository.findById(policyId).orElseThrow();
        String analysis = aiOrchestrationService.analyzeClaim(filePath, policy);

        User user = userService.getCurrentUser();
        Claim claim = new Claim();
        claim.setFilePath(filePath);
        claim.setStatus("PENDING");
        claim.setAnalysisResult(analysis);
        claim.setPolicy(policy);
        claim.setSubmittedBy(user);
        claim = claimRepository.save(claim);

        return mapToDto(claim);
    }

    public List<ClaimDto> getClaimsForUser() {
        User user = userService.getCurrentUser();
        return claimRepository.findBySubmittedBy(user).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public ClaimDto getClaimById(Long id) {
        Claim claim = claimRepository.findById(id).orElseThrow();
        return mapToDto(claim);
    }

    private ClaimDto mapToDto(Claim claim) {
        ClaimDto dto = new ClaimDto();
        dto.setId(claim.getId());
        dto.setPolicyId(claim.getPolicy().getId());
        dto.setStatus(claim.getStatus());
        dto.setAnalysisResult(claim.getAnalysisResult());
        return dto;
    }
}