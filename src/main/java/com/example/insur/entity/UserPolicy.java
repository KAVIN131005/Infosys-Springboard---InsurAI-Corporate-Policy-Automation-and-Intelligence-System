package com.example.insur.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "user_policies")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserPolicy {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "policy_id", nullable = false)
    private Policy policy;

    @Column(nullable = false)
    private String status; // APPLIED, PENDING_APPROVAL, ACTIVE, REJECTED, CANCELLED, EXPIRED

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "monthly_premium", precision = 10, scale = 2)
    private BigDecimal monthlyPremium;

    @Column(name = "total_premium_paid", precision = 12, scale = 2)
    private BigDecimal totalPremiumPaid = BigDecimal.ZERO;

    @Column(name = "next_payment_date")
    private LocalDate nextPaymentDate;

    @Column(name = "payment_status")
    private String paymentStatus; // CURRENT, OVERDUE, CANCELLED

    @Column(name = "approval_notes", columnDefinition = "TEXT")
    private String approvalNotes;

    @Column(name = "risk_score", precision = 5, scale = 2)
    private BigDecimal riskScore;

    @Column(name = "ai_assessment", columnDefinition = "TEXT")
    private String aiAssessment;

    @Column(name = "application_data", columnDefinition = "JSON")
    private String applicationData; // Store application form data as JSON

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "userPolicy", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Payment> payments = new ArrayList<>();

    @OneToMany(mappedBy = "userPolicy", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Claim> claims = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
