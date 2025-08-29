package com.example.insur.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Claim {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String filePath;

    private String status;

    private String analysisResult;

    @ManyToOne
    private Policy policy;

    @ManyToOne
    private User submittedBy;
}