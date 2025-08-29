package com.example.insur.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Policy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fileName;

    private String filePath;

    private String analysisResult;

    @ManyToOne
    private User uploadedBy;
}