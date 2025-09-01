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
@Table(name = "policies")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Policy {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String type; // HEALTH, AUTO, LIFE, PROPERTY, TRAVEL

    @Column(nullable = false)
    private String subType; // CAR_INSURANCE, HEALTH_BASIC, etc.

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal monthlyPremium;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal yearlyPremium;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal coverage;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal deductible;

    @Column(nullable = false)
    private String status; // DRAFT, PENDING_APPROVAL, ACTIVE, INACTIVE, REJECTED

    @Column(nullable = false)
    private String riskLevel; // LOW, MEDIUM, HIGH

    @Column(nullable = false)
    private Boolean requiresApproval = false;

    @Column(nullable = false)
    private Integer minAge = 18;

    @Column(nullable = false)
    private Integer maxAge = 65;

    @Column(columnDefinition = "TEXT")
    private String eligibilityCriteria;

    @Column(columnDefinition = "TEXT")
    private String benefits;

    @Column(columnDefinition = "TEXT")
    private String exclusions;

    @Column(columnDefinition = "TEXT")
    private String terms;

    @Column(name = "document_path")
    private String documentPath;

    @Column(name = "image_path")
    private String imagePath;

    @Column(name = "file_name")
    private String fileName;

    @Column(name = "file_path")
    private String filePath;

    @Column(name = "analysis_result", columnDefinition = "TEXT")
    private String analysisResult;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "broker_id")
    private User broker;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by")
    private User uploadedBy;

    @OneToMany(mappedBy = "policy", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Clause> clauses = new ArrayList<>();

    @OneToMany(mappedBy = "policy", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<UserPolicy> userPolicies = new ArrayList<>();

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