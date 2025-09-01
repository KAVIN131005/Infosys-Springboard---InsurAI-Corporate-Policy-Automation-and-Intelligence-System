package com.example.insur.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserPolicyDto {
    private Long id;
    private UserDto user;
    private PolicyDto policy;
    private String status;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal monthlyPremium;
    private BigDecimal totalPremiumPaid;
    private LocalDate nextPaymentDate;
    private String paymentStatus;
    private String approvalNotes;
    private BigDecimal riskScore;
    private String aiAssessment;
    private String applicationData;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer activeClaims;
    private Boolean canClaim; // Calculated field
}
