package com.example.insur.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class PolicyEmbedding {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private byte[] embedding;

    @ManyToOne
    private Policy policy;
}