package com.example.insur.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Clause {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String text;

    @ManyToOne
    private Policy policy;
}