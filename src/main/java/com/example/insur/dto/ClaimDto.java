package com.example.insur.dto;

import lombok.Data;

@Data
public class ClaimDto {
    private Long id;
    private Long policyId;
    private String status;
    private String analysisResult;
}