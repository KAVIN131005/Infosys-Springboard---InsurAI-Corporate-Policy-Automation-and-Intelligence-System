package com.example.insur.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsDto {
    private Long totalUsers;
    private Long totalPolicies;
    private Long totalClaims;
    private Long pendingClaims;
    private Long approvedClaims;
    private Long rejectedClaims;
    private Long activePolicies;
    private Long pendingPolicies;
    private Double totalRevenue;
    private Double monthlyRevenue;
    private Long newUsersThisMonth;
    private Long newPoliciesThisMonth;
    private Double claimApprovalRate;
    private Double averageClaimAmount;
}
