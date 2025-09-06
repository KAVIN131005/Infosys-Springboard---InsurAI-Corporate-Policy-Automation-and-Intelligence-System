package com.example.insur.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserStatsDto {
    private Long activePolicies;
    private Long totalClaims;
    private Long pendingClaims;
    private Long approvedClaims;
    private Long rejectedClaims;
    private Double totalPremium;
    private Double totalCoverage;
    private Long appliedPolicies;
    private Double lastClaimAmount;
    private String lastClaimStatus;
}
