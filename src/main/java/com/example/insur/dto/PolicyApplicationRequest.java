package com.example.insur.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PolicyApplicationRequest {
    private Long policyId;
    private String applicationData; // JSON string with user application details
    
    // Personal Information
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private String address;
    private String city;
    private String state;
    private String postalCode;
    
    // Policy Specific Information
    private Integer age;
    private String occupation;
    private String medicalHistory;
    private String previousClaims;
    private Boolean hasExistingPolicies;
    private String additionalInformation;
    
    // Financial information - optional
    private java.math.BigDecimal annualSalary; // optional, used for auto-approval rules
    
    // Risk Assessment Fields
    private String vehicleDetails; // For auto insurance
    private String propertyDetails; // For property insurance
    private String healthConditions; // For health insurance
}
