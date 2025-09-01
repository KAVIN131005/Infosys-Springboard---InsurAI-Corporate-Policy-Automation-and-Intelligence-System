package com.example.insur.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_policy_id", nullable = false)
    private UserPolicy userPolicy;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false)
    private String status; // PENDING, COMPLETED, FAILED, REFUNDED

    @Column(nullable = false)
    private String type; // PREMIUM, CLAIM, REFUND

    @Column(name = "payment_method")
    private String paymentMethod; // CREDIT_CARD, DEBIT_CARD, BANK_TRANSFER, UPI

    @Column(name = "transaction_id")
    private String transactionId;

    @Column(name = "payment_date")
    private LocalDateTime paymentDate;

    @Column(name = "due_date")
    private LocalDateTime dueDate;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "failure_reason")
    private String failureReason;

    @Column(name = "payment_gateway_response", columnDefinition = "TEXT")
    private String paymentGatewayResponse;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "claim_id")
    private Claim claim;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

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