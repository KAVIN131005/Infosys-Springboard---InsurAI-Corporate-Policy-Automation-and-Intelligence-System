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

        // Enhanced AI Analysis with Risk Assessment
        try {
            String aiAnalysis = aiOrchestrationService.analyzeClaim(request);
            claim.setAiAnalysisResult(aiAnalysis);
            
            // Enhanced confidence and fraud risk assessment
            BigDecimal confidenceScore = extractConfidenceScore(aiAnalysis);
            BigDecimal fraudScore = extractFraudScore(aiAnalysis);
            BigDecimal riskScore = calculateRiskScore(request, confidenceScore, fraudScore);
            
            claim.setAiConfidenceScore(confidenceScore);
            claim.setFraudScore(fraudScore);

            // Enhanced Auto-approval Logic: If Risk >= 90%, AI auto-approves
            if (riskScore.compareTo(new BigDecimal("90")) >= 0) {
                // High confidence, low fraud risk = AI Auto-Approval
                claim.setStatus("APPROVED");
                claim.setApprovedAmount(request.getClaimAmount());
                claim.setAutoApproved(true);
                claim.setRequiresManualReview(false);
                claim.setReviewerNotes("AI Auto-Approved: Risk Score " + riskScore + "%, Confidence: " + confidenceScore + "%, Fraud Risk: " + fraudScore + "%");
                
                // Immediate payment processing for AI-approved claims
                processImmediatePayment(claim);
                
            } else if (riskScore.compareTo(new BigDecimal("70")) >= 0) {
                // Medium risk = Requires Admin approval
                claim.setStatus("PENDING_ADMIN_REVIEW");
                claim.setRequiresManualReview(true);
                claim.setReviewerNotes("Requires Admin Review: Risk Score " + riskScore + "%, Confidence: " + confidenceScore + "%, Fraud Risk: " + fraudScore + "%");
                
            } else {
                // Low confidence or high fraud risk = Manual review required
                claim.setStatus("UNDER_REVIEW");
                claim.setRequiresManualReview(true);
                claim.setReviewerNotes("Manual Review Required: Risk Score " + riskScore + "%, High fraud risk or low confidence detected");
            }

        } catch (Exception e) {
            claim.setStatus("UNDER_REVIEW");
            claim.setRequiresManualReview(true);
            claim.setAiAnalysisResult("AI analysis failed: " + e.getMessage());
            claim.setReviewerNotes("AI analysis unavailable - manual review required");
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

    /**
     * Calculate comprehensive risk score based on AI analysis and claim details
     */
    private BigDecimal calculateRiskScore(ClaimSubmissionRequest request, BigDecimal confidenceScore, BigDecimal fraudScore) {
        try {
            // Base risk score from AI confidence (higher confidence = higher risk score)
            BigDecimal riskScore = confidenceScore;
            
            // Adjust for fraud risk (higher fraud = lower risk score)
            BigDecimal fraudPenalty = fraudScore.multiply(new BigDecimal("0.5"));
            riskScore = riskScore.subtract(fraudPenalty);
            
            // Adjust for claim amount (higher amounts need more scrutiny)
            if (request.getClaimAmount().compareTo(new BigDecimal("10000")) > 0) {
                riskScore = riskScore.subtract(new BigDecimal("10"));
            } else if (request.getClaimAmount().compareTo(new BigDecimal("5000")) > 0) {
                riskScore = riskScore.subtract(new BigDecimal("5"));
            }
            
            // Adjust for completeness of information
            int completenessScore = 0;
            if (request.getIncidentDate() != null) completenessScore += 20;
            if (request.getIncidentLocation() != null && !request.getIncidentLocation().trim().isEmpty()) completenessScore += 15;
            if (request.getIncidentDescription() != null && request.getIncidentDescription().length() > 50) completenessScore += 15;
            if (request.getSupportingDocuments() != null && !request.getSupportingDocuments().isEmpty()) completenessScore += 20;
            
            // Scale completeness to 0-10 range and add to risk score
            riskScore = riskScore.add(new BigDecimal(completenessScore / 10));
            
            // Ensure risk score is between 0 and 100
            if (riskScore.compareTo(BigDecimal.ZERO) < 0) riskScore = BigDecimal.ZERO;
            if (riskScore.compareTo(new BigDecimal("100")) > 0) riskScore = new BigDecimal("100");
            
            return riskScore;
        } catch (Exception e) {
            // Default to medium risk if calculation fails
            return new BigDecimal("60");
        }
    }

    /**
     * Process immediate payment for AI auto-approved claims
     */
    private void processImmediatePayment(Claim claim) {
        try {
            Payment payment = new Payment();
            payment.setUserPolicy(claim.getUserPolicy());
            payment.setClaim(claim);
            payment.setAmount(claim.getApprovedAmount());
            payment.setStatus("PROCESSING");
            payment.setType("CLAIM_AUTO_APPROVED");
            payment.setDescription("AI Auto-Approved Claim Payment for " + claim.getClaimNumber());
            payment.setPaymentDate(LocalDateTime.now());
            payment.setTransactionId("AUTO_CLM_" + System.currentTimeMillis());
            
            // For demo purposes, mark as completed immediately
            // In real implementation, this would integrate with payment gateway
            payment.setStatus("COMPLETED");
            
            // Save the payment (assumes PaymentService has save method)
            paymentService.processClaimPayment(payment);
            
            // Update claim with payment reference
            claim.setReviewerNotes(claim.getReviewerNotes() + " | Payment processed automatically: " + payment.getTransactionId());
            
        } catch (Exception e) {
            // If payment fails, update claim status but don't fail the claim
            claim.setReviewerNotes(claim.getReviewerNotes() + " | Payment processing failed: " + e.getMessage());
            // Could also set a flag for manual payment processing
        }
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

    public List<ClaimDto> getAllClaims() {
        return claimRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public ClaimDto getUserClaimDetails(Long claimId, String username) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new RuntimeException("Claim not found"));
        
        // Check if user owns this claim
        if (!claim.getSubmittedBy().getUsername().equals(username)) {
            throw new RuntimeException("Unauthorized access to claim");
        }
        
        return convertToDto(claim);
    }

    public void updateClaimStatus(Long claimId, String status) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new RuntimeException("Claim not found"));
        
        User currentUser = userService.getCurrentUser();
        
        claim.setStatus(status.toUpperCase());
        claim.setReviewedBy(currentUser);
        claim.setReviewedAt(LocalDateTime.now());
        claim.setUpdatedAt(LocalDateTime.now());
        claimRepository.save(claim);
    }

    // Enhanced approval method for AdminController
    public void approveClaim(Long claimId) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new RuntimeException("Claim not found"));
        
        User currentUser = userService.getCurrentUser();
        
        if (!"UNDER_REVIEW".equals(claim.getStatus())) {
            throw new RuntimeException("Claim is not under review");
        }
        
        claim.setStatus("APPROVED");
        claim.setApprovedAmount(claim.getClaimAmount());
        claim.setReviewerNotes("Manually approved by admin");
        claim.setReviewedBy(currentUser);
        claim.setReviewedAt(LocalDateTime.now());
        claim.setUpdatedAt(LocalDateTime.now());
        
        claimRepository.save(claim);
        
        // Process payment for admin approved claim
        processImmediatePayment(claim);
    }

    // Enhanced rejection method for AdminController
    public void rejectClaim(Long claimId, String reason) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new RuntimeException("Claim not found"));
        
        User currentUser = userService.getCurrentUser();
        
        if (!"UNDER_REVIEW".equals(claim.getStatus())) {
            throw new RuntimeException("Claim is not under review");
        }
        
        claim.setStatus("REJECTED");
        claim.setRejectionReason(reason);
        claim.setReviewedBy(currentUser);
        claim.setReviewedAt(LocalDateTime.now());
        claim.setUpdatedAt(LocalDateTime.now());
        
        claimRepository.save(claim);
    }
}