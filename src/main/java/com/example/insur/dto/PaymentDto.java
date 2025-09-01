package com.example.insur.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentDto {
    private Long id;
    private UserPolicyDto userPolicy;
    private BigDecimal amount;
    private String status;
    private String type;
    private String paymentMethod;
    private String transactionId;
    private LocalDateTime paymentDate;
    private LocalDateTime dueDate;
    private String description;
    private String failureReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
