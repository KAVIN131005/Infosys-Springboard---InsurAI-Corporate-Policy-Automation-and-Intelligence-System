package com.example.insur.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClaimDto {
    private Long id;
    private String claimNumber;
    private UserPolicyDto userPolicy;
    private UserDto submittedBy;
    private String type;
    private String status;
    private BigDecimal claimAmount;
    private BigDecimal approvedAmount;
    private LocalDateTime incidentDate;
    private String incidentLocation;
    private String incidentDescription;
    private List<String> supportingDocuments;
    private String aiAnalysisResult;
    private BigDecimal aiConfidenceScore;
    private BigDecimal fraudScore;
    private String reviewerNotes;
    private String rejectionReason;
    private Boolean autoApproved;
    private Boolean requiresManualReview;
    private UserDto reviewedBy;
    private LocalDateTime reviewedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<PaymentDto> payments;
}