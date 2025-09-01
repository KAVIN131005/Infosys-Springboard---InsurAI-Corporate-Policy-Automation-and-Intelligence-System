package com.example.insur.service;

import com.example.insur.entity.*;
import com.example.insur.repository.*;
import com.example.insur.dto.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ClaimService {

    @Autowired
    private ClaimRepository claimRepository;

    @Autowired
    private UserPolicyRepository userPolicyRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AiOrchestrationService aiOrchestrationService;

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private UserService userService;

    public ClaimDto submitClaim(Long userId, ClaimSubmissionRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserPolicy userPolicy = userPolicyRepository.findById(request.getUserPolicyId())
                .orElseThrow(() -> new RuntimeException("User policy not found"));

        if (!userPolicy.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to user policy");
        }

        if (!"ACTIVE".equals(userPolicy.getStatus())) {
            throw new RuntimeException("Policy is not active");
        }

        // Create claim
        Claim claim = new Claim();
        claim.setUserPolicy(userPolicy);
        claim.setSubmittedBy(user);
        claim.setType(request.getType());
        claim.setStatus("SUBMITTED");
        claim.setClaimAmount(request.getClaimAmount());
        claim.setIncidentDate(request.getIncidentDate());
        claim.setIncidentLocation(request.getIncidentLocation());
        claim.setIncidentDescription(request.getIncidentDescription());
        
        // Convert supporting documents list to JSON string
        if (request.getSupportingDocuments() != null) {
            claim.setSupportingDocuments(String.join(",", request.getSupportingDocuments()));
        }

        // AI Analysis
        try {
            String aiAnalysis = aiOrchestrationService.analyzeClaim(request);
            claim.setAiAnalysisResult(aiAnalysis);
            
            // Extract confidence and fraud scores from AI response
            BigDecimal confidenceScore = extractConfidenceScore(aiAnalysis);
            BigDecimal fraudScore = extractFraudScore(aiAnalysis);
            
            claim.setAiConfidenceScore(confidenceScore);
            claim.setFraudScore(fraudScore);

            // Auto-approve low-risk claims
            if (fraudScore.compareTo(new BigDecimal("30")) < 0 && 
                confidenceScore.compareTo(new BigDecimal("80")) > 0 &&
                request.getClaimAmount().compareTo(new BigDecimal("5000")) < 0) {
                
                claim.setStatus("APPROVED");
                claim.setApprovedAmount(request.getClaimAmount());
                claim.setAutoApproved(true);
                claim.setRequiresManualReview(false);
            } else {
                claim.setStatus("UNDER_REVIEW");
                claim.setRequiresManualReview(true);
            }

        } catch (Exception e) {
            claim.setStatus("UNDER_REVIEW");
            claim.setRequiresManualReview(true);
            claim.setAiAnalysisResult("AI analysis failed: " + e.getMessage());
        }

        claim = claimRepository.save(claim);

        // If auto-approved, create payment
        if ("APPROVED".equals(claim.getStatus())) {
            createClaimPayment(claim);
        }

        return convertToDto(claim);
    }

    // Legacy method for file upload
    public ClaimDto submitClaim(MultipartFile file, Long policyId) {
        String filePath = fileStorageService.storeFile(file);
        User user = userService.getCurrentUser();
        
        // Find active user policy for this policy
        // This is a simplified approach - in real app, need better policy selection
        ClaimSubmissionRequest request = new ClaimSubmissionRequest();
        request.setType("DOCUMENT_UPLOAD");
        request.setClaimAmount(new BigDecimal("1000")); // Default amount
        request.setIncidentDescription("Document upload claim");
        request.setSupportingDocuments(List.of(filePath));
        
        return submitClaim(user.getId(), request);
    }

    public List<ClaimDto> getUserClaims(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Claim> claims = claimRepository.findByUserOrderByCreatedAtDesc(user);
        return claims.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<ClaimDto> getClaimsForUser() {
        User user = userService.getCurrentUser();
        return getUserClaims(user.getId());
    }

    public ClaimDto getClaimById(Long id) {
        Claim claim = claimRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Claim not found"));
        return convertToDto(claim);
    }

    public ClaimDto getClaimByNumber(String claimNumber) {
        Claim claim = claimRepository.findByClaimNumber(claimNumber)
                .orElseThrow(() -> new RuntimeException("Claim not found"));
        return convertToDto(claim);
    }

    public List<ClaimDto> getPendingManualReview() {
        List<Claim> pendingClaims = claimRepository.findPendingManualReview();
        return pendingClaims.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public ClaimDto approveClaim(Long claimId, BigDecimal approvedAmount, String reviewerNotes, Long reviewerId) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new RuntimeException("Claim not found"));

        User reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> new RuntimeException("Reviewer not found"));

        if (!"UNDER_REVIEW".equals(claim.getStatus())) {
            throw new RuntimeException("Claim is not under review");
        }

        claim.setStatus("APPROVED");
        claim.setApprovedAmount(approvedAmount);
        claim.setReviewerNotes(reviewerNotes);
        claim.setReviewedBy(reviewer);
        claim.setReviewedAt(LocalDateTime.now());

        claim = claimRepository.save(claim);

        // Create payment for approved claim
        createClaimPayment(claim);

        return convertToDto(claim);
    }

    public ClaimDto rejectClaim(Long claimId, String rejectionReason, Long reviewerId) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new RuntimeException("Claim not found"));

        User reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> new RuntimeException("Reviewer not found"));

        claim.setStatus("REJECTED");
        claim.setRejectionReason(rejectionReason);
        claim.setReviewedBy(reviewer);
        claim.setReviewedAt(LocalDateTime.now());

        claim = claimRepository.save(claim);
        return convertToDto(claim);
    }

    private void createClaimPayment(Claim claim) {
        Payment payment = new Payment();
        payment.setUserPolicy(claim.getUserPolicy());
        payment.setClaim(claim);
        payment.setAmount(claim.getApprovedAmount());
        payment.setStatus("PENDING");
        payment.setType("CLAIM");
        payment.setDescription("Claim payment for " + claim.getClaimNumber());
        
        // For demo, mark as completed immediately
        payment.setStatus("COMPLETED");
        payment.setPaymentDate(LocalDateTime.now());
        payment.setTransactionId("CLM_" + System.currentTimeMillis());
    }

    private BigDecimal extractConfidenceScore(String aiAnalysis) {
        try {
            if (aiAnalysis.contains("HIGH_CONFIDENCE")) return new BigDecimal("90");
            if (aiAnalysis.contains("MEDIUM_CONFIDENCE")) return new BigDecimal("70");
            if (aiAnalysis.contains("LOW_CONFIDENCE")) return new BigDecimal("40");
        } catch (Exception e) {
            // Default
        }
        return new BigDecimal("70");
    }

    private BigDecimal extractFraudScore(String aiAnalysis) {
        try {
            if (aiAnalysis.contains("LOW_FRAUD")) return new BigDecimal("20");
            if (aiAnalysis.contains("MEDIUM_FRAUD")) return new BigDecimal("50");
            if (aiAnalysis.contains("HIGH_FRAUD")) return new BigDecimal("80");
        } catch (Exception e) {
            // Default
        }
        return new BigDecimal("30");
    }

    private ClaimDto convertToDto(Claim claim) {
        ClaimDto dto = new ClaimDto();
        dto.setId(claim.getId());
        dto.setClaimNumber(claim.getClaimNumber());
        dto.setType(claim.getType());
        dto.setStatus(claim.getStatus());
        dto.setClaimAmount(claim.getClaimAmount());
        dto.setApprovedAmount(claim.getApprovedAmount());
        dto.setIncidentDate(claim.getIncidentDate());
        dto.setIncidentLocation(claim.getIncidentLocation());
        dto.setIncidentDescription(claim.getIncidentDescription());
        dto.setAiAnalysisResult(claim.getAiAnalysisResult());
        dto.setAiConfidenceScore(claim.getAiConfidenceScore());
        dto.setFraudScore(claim.getFraudScore());
        dto.setReviewerNotes(claim.getReviewerNotes());
        dto.setRejectionReason(claim.getRejectionReason());
        dto.setAutoApproved(claim.getAutoApproved());
        dto.setRequiresManualReview(claim.getRequiresManualReview());
        dto.setReviewedAt(claim.getReviewedAt());
        dto.setCreatedAt(claim.getCreatedAt());
        dto.setUpdatedAt(claim.getUpdatedAt());

        // Convert supporting documents string back to list
        if (claim.getSupportingDocuments() != null) {
            dto.setSupportingDocuments(List.of(claim.getSupportingDocuments().split(",")));
        }

        return dto;
    }

    // Legacy method for backward compatibility
    private ClaimDto mapToDto(Claim claim) {
        return convertToDto(claim);
    }
}