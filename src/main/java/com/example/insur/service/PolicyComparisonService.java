package com.example.insur.service;

import com.example.insur.dto.PolicyComparisonRequest;
import com.example.insur.dto.PolicyComparisonResponse;
import com.example.insur.entity.Policy;
import com.example.insur.entity.User;
import com.example.insur.repository.PolicyRepository;
import com.example.insur.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PolicyComparisonService {

    private final PolicyRepository policyRepository;
    private final UserRepository userRepository;

    public PolicyComparisonResponse comparePolicies(PolicyComparisonRequest request) {
        log.info("Starting policy comparison for user: {} with policies: {}", 
                request.getUserId(), request.getPolicyIds());

        // Validate user
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Fetch policies
        List<Policy> policies = policyRepository.findAllById(request.getPolicyIds());
        
        if (policies.size() != request.getPolicyIds().size()) {
            throw new RuntimeException("Some policies not found");
        }

        // Convert to detailed policy information
        List<PolicyComparisonResponse.PolicyDetails> policyDetails = policies.stream()
                .map(this::convertToPolicyDetails)
                .collect(Collectors.toList());

        // Create comparison matrix
        PolicyComparisonResponse.ComparisonMatrix comparisonMatrix = createComparisonMatrix(policies);

        // Determine comparison criteria based on type
        List<String> criteria = getComparisonCriteria(request.getComparisonType());

        // Generate recommendation
        String recommendedPolicy = generateRecommendation(policies, user);

        // Generate comparison summary
        String comparisonSummary = generateComparisonSummary(policies, comparisonMatrix);

        return new PolicyComparisonResponse(
                policyDetails,
                comparisonMatrix,
                criteria,
                recommendedPolicy,
                comparisonSummary
        );
    }

    private PolicyComparisonResponse.PolicyDetails convertToPolicyDetails(Policy policy) {
        PolicyComparisonResponse.PolicyDetails details = new PolicyComparisonResponse.PolicyDetails();
        details.setId(policy.getId());
        details.setName(policy.getName());
        details.setType(policy.getType());
        details.setDescription(policy.getDescription());
        details.setPremium(policy.getMonthlyPremium()); // Using monthlyPremium from entity
        details.setCoverage(policy.getCoverage());
        details.setTermYears(calculateTermYears(policy)); // Calculate based on age range
        
        // Parse benefits and exclusions
        details.setBenefits(parseBenefits(policy.getBenefits()));
        details.setExclusions(parseExclusions(policy.getExclusions()));
        
        // Create features map based on available fields
        Map<String, Object> features = new HashMap<>();
        features.put("riskLevel", policy.getRiskLevel());
        features.put("requiresApproval", policy.getRequiresApproval());
        features.put("subType", policy.getSubType());
        features.put("yearlyPremium", policy.getYearlyPremium());
        features.put("ageRange", policy.getMinAge() + " - " + policy.getMaxAge() + " years");
        details.setFeatures(features);
        
        details.setEligibilityCriteria(policy.getEligibilityCriteria());
        details.setDeductible(policy.getDeductible());
        details.setClaimProcess(generateClaimProcessDescription(policy));
        details.setMaxClaimsPerYear(generateMaxClaims(policy));
        details.setRenewalTerms(generateRenewalTerms(policy));
        details.setCancellationPolicy(generateCancellationPolicy(policy));
        
        // Generate rating and reviews (mock data for now)
        details.setRating(generatePolicyRating(policy));
        details.setCustomerReviews(generateCustomerReviews(policy));
        
        return details;
    }

    private Integer calculateTermYears(Policy policy) {
        // Calculate typical term based on age range
        return policy.getMaxAge() - policy.getMinAge();
    }

    private Integer generateMaxClaims(Policy policy) {
        // Generate based on policy type
        switch (policy.getType()) {
            case "HEALTH": return 5;
            case "AUTO": return 3;
            case "LIFE": return 1;
            case "TRAVEL": return 2;
            default: return 3;
        }
    }

    private List<String> parseBenefits(String benefits) {
        if (benefits == null || benefits.trim().isEmpty()) {
            return Arrays.asList("Standard coverage", "24/7 support", "Online claim processing");
        }
        return Arrays.asList(benefits.split(","));
    }

    private List<String> parseExclusions(String exclusions) {
        if (exclusions == null || exclusions.trim().isEmpty()) {
            return Arrays.asList("Pre-existing conditions", "War-related incidents", "Intentional self-harm");
        }
        return Arrays.asList(exclusions.split(","));
    }

    private PolicyComparisonResponse.ComparisonMatrix createComparisonMatrix(List<Policy> policies) {
        List<String> criteria = Arrays.asList(
                "Monthly Premium", "Yearly Premium", "Coverage", "Deductible", "Risk Level", 
                "Age Range", "Benefits Count", "Requires Approval"
        );

        Map<String, Map<String, Object>> policyComparison = new HashMap<>();
        Map<String, String> winnerByCriteria = new HashMap<>();
        Map<String, String> analysis = new HashMap<>();

        for (Policy policy : policies) {
            Map<String, Object> policyData = new HashMap<>();
            policyData.put("Monthly Premium", policy.getMonthlyPremium());
            policyData.put("Yearly Premium", policy.getYearlyPremium());
            policyData.put("Coverage", policy.getCoverage());
            policyData.put("Deductible", policy.getDeductible());
            policyData.put("Risk Level", policy.getRiskLevel());
            policyData.put("Age Range", policy.getMinAge() + "-" + policy.getMaxAge());
            policyData.put("Benefits Count", parseBenefits(policy.getBenefits()).size());
            policyData.put("Requires Approval", policy.getRequiresApproval());
            
            policyComparison.put(policy.getName(), policyData);
        }

        // Determine winners for each criteria
        determineWinners(policies, winnerByCriteria, analysis);

        PolicyComparisonResponse.ComparisonMatrix matrix = new PolicyComparisonResponse.ComparisonMatrix();
        matrix.setCriteria(criteria);
        matrix.setPolicyComparison(policyComparison);
        matrix.setWinnerByCriteria(winnerByCriteria);
        matrix.setAnalysis(analysis);

        return matrix;
    }

    private void determineWinners(List<Policy> policies, Map<String, String> winnerByCriteria, Map<String, String> analysis) {
        // Lowest monthly premium wins
        Policy lowestMonthlyPremium = policies.stream()
                .min(Comparator.comparing(Policy::getMonthlyPremium))
                .orElse(policies.get(0));
        winnerByCriteria.put("Monthly Premium", lowestMonthlyPremium.getName());
        analysis.put("Monthly Premium", "Lower premium means more affordable monthly payments");

        // Lowest yearly premium wins
        Policy lowestYearlyPremium = policies.stream()
                .min(Comparator.comparing(Policy::getYearlyPremium))
                .orElse(policies.get(0));
        winnerByCriteria.put("Yearly Premium", lowestYearlyPremium.getName());
        analysis.put("Yearly Premium", "Lower yearly premium provides better value for annual payments");

        // Highest coverage wins
        Policy highestCoverage = policies.stream()
                .max(Comparator.comparing(Policy::getCoverage))
                .orElse(policies.get(0));
        winnerByCriteria.put("Coverage", highestCoverage.getName());
        analysis.put("Coverage", "Higher coverage provides better financial protection");

        // Lowest deductible wins
        Policy lowestDeductible = policies.stream()
                .min(Comparator.comparing(Policy::getDeductible))
                .orElse(policies.get(0));
        winnerByCriteria.put("Deductible", lowestDeductible.getName());
        analysis.put("Deductible", "Lower deductible means less out-of-pocket expense during claims");

        // Best risk level (LOW is best)
        Policy bestRisk = policies.stream()
                .filter(p -> "LOW".equals(p.getRiskLevel()))
                .findFirst()
                .orElse(policies.get(0));
        winnerByCriteria.put("Risk Level", bestRisk.getName());
        analysis.put("Risk Level", "Lower risk level typically means better terms and conditions");

        // Most benefits
        Policy mostBenefits = policies.stream()
                .max(Comparator.comparing(p -> parseBenefits(p.getBenefits()).size()))
                .orElse(policies.get(0));
        winnerByCriteria.put("Benefits Count", mostBenefits.getName());
        analysis.put("Benefits Count", "More benefits provide comprehensive coverage and value");
    }

    private List<String> getComparisonCriteria(String comparisonType) {
        switch (comparisonType != null ? comparisonType : "basic") {
            case "detailed":
                return Arrays.asList("Premium", "Coverage", "Benefits", "Exclusions", "Claim Process", 
                                   "Renewal Terms", "Tax Benefits", "Loan Facility", "Surrender Value");
            case "premium":
                return Arrays.asList("Premium", "Payment Frequency", "Premium Waiver", "Discount Options");
            default:
                return Arrays.asList("Premium", "Coverage", "Term Years", "Benefits", "Deductible");
        }
    }

    private String generateRecommendation(List<Policy> policies, User user) {
        // Simple recommendation logic based on user profile
        Policy recommended = policies.get(0);
        
        // Calculate user age from date of birth if available
        Integer userAge = calculateUserAge(user);
        
        if (userAge != null && userAge < 30) {
            // Young users - prioritize health and term insurance with high coverage
            recommended = policies.stream()
                    .filter(p -> "HEALTH".equals(p.getType()) || "LIFE".equals(p.getType()))
                    .max(Comparator.comparing(Policy::getCoverage))
                    .orElse(policies.get(0));
        } else if (userAge != null && userAge > 50) {
            // Older users - prioritize low-risk policies with good coverage
            recommended = policies.stream()
                    .filter(p -> "LOW".equals(p.getRiskLevel()))
                    .max(Comparator.comparing(Policy::getCoverage))
                    .orElse(policies.get(0));
        } else {
            // Middle-aged users - balance of coverage and premium
            recommended = policies.stream()
                    .min(Comparator.comparing(p -> 
                        p.getMonthlyPremium().divide(p.getCoverage(), 6, RoundingMode.HALF_UP)))
                    .orElse(policies.get(0));
        }

        return String.format("Based on your profile, we recommend '%s' as it offers the best value for your needs. " +
                "It provides excellent coverage at an affordable premium with good additional benefits.",
                recommended.getName());
    }

    private Integer calculateUserAge(User user) {
        if (user.getDateOfBirth() != null) {
            return java.time.Period.between(user.getDateOfBirth(), java.time.LocalDate.now()).getYears();
        }
        return null;
    }

    private String generateComparisonSummary(List<Policy> policies, PolicyComparisonResponse.ComparisonMatrix matrix) {
        StringBuilder summary = new StringBuilder();
        summary.append("Policy Comparison Summary:\n\n");
        
        summary.append("🏆 Winners by Category:\n");
        matrix.getWinnerByCriteria().forEach((criteria, winner) -> 
            summary.append(String.format("• %s: %s\n", criteria, winner)));
        
        summary.append("\n💡 Key Insights:\n");
        summary.append("• Premium Range: ₹").append(getPremiumRange(policies)).append("\n");
        summary.append("• Coverage Range: ₹").append(getCoverageRange(policies)).append("\n");
        summary.append("• Term Options: ").append(getTermRange(policies)).append(" years\n");
        
        return summary.toString();
    }

    private String getPremiumRange(List<Policy> policies) {
        BigDecimal min = policies.stream().map(Policy::getMonthlyPremium).min(BigDecimal::compareTo).orElse(BigDecimal.ZERO);
        BigDecimal max = policies.stream().map(Policy::getMonthlyPremium).max(BigDecimal::compareTo).orElse(BigDecimal.ZERO);
        return String.format("%s - %s", min, max);
    }

    private String getCoverageRange(List<Policy> policies) {
        BigDecimal min = policies.stream().map(Policy::getCoverage).min(BigDecimal::compareTo).orElse(BigDecimal.ZERO);
        BigDecimal max = policies.stream().map(Policy::getCoverage).max(BigDecimal::compareTo).orElse(BigDecimal.ZERO);
        return String.format("%s - %s", min, max);
    }

    private String getTermRange(List<Policy> policies) {
        int min = policies.stream().mapToInt(p -> calculateTermYears(p)).min().orElse(0);
        int max = policies.stream().mapToInt(p -> calculateTermYears(p)).max().orElse(0);
        return min == max ? String.valueOf(min) : String.format("%d - %d", min, max);
    }

    // Helper methods for additional details
    private String generateClaimProcessDescription(Policy policy) {
        return "Online claim submission → Document verification → Assessment → Approval → Settlement (7-14 business days)";
    }

    private String generateRenewalTerms(Policy policy) {
        return "Auto-renewable up to age 65. Premium may be revised based on claim history and age.";
    }

    private String generateCancellationPolicy(Policy policy) {
        return "Free-look period: 15 days. Surrender charges applicable for first 3 years.";
    }

    private Double generatePolicyRating(Policy policy) {
        // Mock rating based on policy features
        double rating = 4.0;
        
        // Higher rating for lower risk
        if ("LOW".equals(policy.getRiskLevel())) {
            rating += 0.5;
        } else if ("HIGH".equals(policy.getRiskLevel())) {
            rating -= 0.3;
        }
        
        // Higher rating for lower deductible
        if (policy.getDeductible().compareTo(new BigDecimal("5000")) < 0) {
            rating += 0.2;
        }
        
        // Higher rating for comprehensive benefits
        if (parseBenefits(policy.getBenefits()).size() > 3) {
            rating += 0.3;
        }
        
        return Math.min(5.0, rating);
    }

    private Integer generateCustomerReviews(Policy policy) {
        // Mock review count based on policy type
        int baseReviews = 150;
        switch (policy.getType()) {
            case "HEALTH": return baseReviews + 200;
            case "AUTO": return baseReviews + 150;
            case "LIFE": return baseReviews + 100;
            case "TRAVEL": return baseReviews + 50;
            default: return baseReviews;
        }
    }

    public List<Policy> getAvailablePoliciesForComparison(Long userId) {
        log.info("Fetching available policies for comparison for user: {}", userId);
        
        // Return all active policies that user can compare
        return policyRepository.findByStatus("ACTIVE");
    }

    public PolicyComparisonResponse getQuickComparison(List<Long> policyIds) {
        log.info("Generating quick comparison for policies: {}", policyIds);
        
        PolicyComparisonRequest request = new PolicyComparisonRequest();
        request.setPolicyIds(policyIds);
        request.setComparisonType("basic");
        request.setUserId(1L); // Default user for quick comparison
        
        return comparePolicies(request);
    }
}
