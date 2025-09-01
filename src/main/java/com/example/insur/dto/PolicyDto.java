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
public class PolicyDto {
    private Long id;
    private String name;
    private String description;
    private String type;
    private String subType;
    private BigDecimal monthlyPremium;
    private BigDecimal yearlyPremium;
    private BigDecimal coverage;
    private BigDecimal deductible;
    private String status;
    private String riskLevel;
    private Boolean requiresApproval;
    private Integer minAge;
    private Integer maxAge;
    private String eligibilityCriteria;
    private String benefits;
    private String exclusions;
    private String terms;
    private String documentPath;
    private String imagePath;
    private String fileName;
    private String analysisResult;
    private String uploadedBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private UserDto broker;
    private List<ClauseDto> clauses;
    private Long activeSubscribers;
    private Boolean canApply; // Calculated field for user eligibility
}