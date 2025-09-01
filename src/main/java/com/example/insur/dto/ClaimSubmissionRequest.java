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
public class ClaimSubmissionRequest {
    private Long userPolicyId;
    private String type;
    private BigDecimal claimAmount;
    private LocalDateTime incidentDate;
    private String incidentLocation;
    private String incidentDescription;
    private List<String> supportingDocuments; // File paths or base64 encoded files
    
    // Incident specific details
    private String policeReportNumber;
    private String hospitalName;
    private String doctorName;
    private String witnesses;
    private String damageDescription;
    private String emergencyServices;
}
