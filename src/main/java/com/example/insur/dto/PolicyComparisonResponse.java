package com.example.insur.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PolicyComparisonResponse {
    private List<PolicyDetails> policies;
    private ComparisonMatrix comparisonMatrix;
    private List<String> comparisonCriteria;
    private String recommendedPolicy;
    private String comparisonSummary;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PolicyDetails {
        private Long id;
        private String name;
        private String type;
        private String description;
        private BigDecimal premium;
        private BigDecimal coverage;
        private Integer termYears;
        private List<String> benefits;
        private List<String> exclusions;
        private Map<String, Object> features;
        private String eligibilityCriteria;
        private BigDecimal deductible;
        private String claimProcess;
        private Integer maxClaimsPerYear;
        private String renewalTerms;
        private String cancellationPolicy;
        private Double rating;
        private Integer customerReviews;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ComparisonMatrix {
        private List<String> criteria;
        private Map<String, Map<String, Object>> policyComparison;
        private Map<String, String> winnerByCriteria;
        private Map<String, String> analysis;
    }
}