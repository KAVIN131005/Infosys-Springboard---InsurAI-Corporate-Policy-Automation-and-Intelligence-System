package com.example.insur.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BrokerStatsDto {
    private Long totalPolicies;
    private Long activeClients;
    private Long pendingClaims;
    private Long totalClaims;
    private Double totalRevenue;
    private Double monthlyRevenue;
    private Long policiesThisMonth;
    private Long claimsThisMonth;
    private Double averagePolicyValue;
    private Double claimApprovalRate;
}
