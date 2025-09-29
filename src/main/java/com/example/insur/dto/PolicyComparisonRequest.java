package com.example.insur.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PolicyComparisonRequest {
    private List<Long> policyIds;
    private Long userId;
    private String comparisonType; // "basic", "detailed", "premium"
}
