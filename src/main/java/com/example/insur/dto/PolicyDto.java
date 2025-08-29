package com.example.insur.dto;

import lombok.Data;

@Data
public class PolicyDto {
    private Long id;
    private String fileName;
    private String analysisResult;
    private String uploadedBy;
}