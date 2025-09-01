package com.example.insur.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "claims")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Claim {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "claim_number", unique = true, nullable = false)
    private String claimNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_policy_id", nullable = false)
    private UserPolicy userPolicy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submitted_by", nullable = false)
    private User submittedBy;

    @Column(nullable = false)
    private String type; // ACCIDENT, MEDICAL, PROPERTY_DAMAGE, THEFT, NATURAL_DISASTER

    @Column(nullable = false)
    private String status; // SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED, PAID, CLOSED

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal claimAmount;

    @Column(precision = 12, scale = 2)
    private BigDecimal approvedAmount;

    @Column(name = "incident_date")
    private LocalDateTime incidentDate;

    @Column(name = "incident_location")
    private String incidentLocation;

    @Column(name = "incident_description", columnDefinition = "TEXT")
    private String incidentDescription;

    @Column(name = "supporting_documents", columnDefinition = "TEXT")
    private String supportingDocuments; // JSON array of file paths

    @Column(name = "ai_analysis_result", columnDefinition = "TEXT")
    private String aiAnalysisResult;

    @Column(name = "ai_confidence_score", precision = 5, scale = 2)
    private BigDecimal aiConfidenceScore;

    @Column(name = "fraud_score", precision = 5, scale = 2)
    private BigDecimal fraudScore;

    @Column(name = "reviewer_notes", columnDefinition = "TEXT")
    private String reviewerNotes;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "auto_approved")
    private Boolean autoApproved = false;

    @Column(name = "requires_manual_review")
    private Boolean requiresManualReview = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    private User reviewedBy;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "claim", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Payment> payments = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        generateClaimNumber();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    private void generateClaimNumber() {
        if (claimNumber == null) {
            claimNumber = "CLM" + System.currentTimeMillis();
        }
    }
}