package com.example.insur.service;

import com.example.insur.entity.*;
import com.example.insur.repository.*;
import com.example.insur.dto.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private UserPolicyRepository userPolicyRepository;

    public Payment createPremiumPayment(UserPolicy userPolicy) {
        Payment payment = new Payment();
        payment.setUserPolicy(userPolicy);
        payment.setAmount(userPolicy.getMonthlyPremium());
        payment.setStatus("PENDING");
        payment.setType("PREMIUM");
        payment.setDueDate(LocalDateTime.now().plusDays(30));
        payment.setDescription("Monthly premium payment for " + userPolicy.getPolicy().getName());

        return paymentRepository.save(payment);
    }

    public Payment processPayment(Long paymentId, String paymentMethod, String transactionId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        payment.setStatus("COMPLETED");
        payment.setPaymentMethod(paymentMethod);
        payment.setTransactionId(transactionId);
        payment.setPaymentDate(LocalDateTime.now());

        // Update user policy payment status
        UserPolicy userPolicy = payment.getUserPolicy();
        userPolicy.setTotalPremiumPaid(
                userPolicy.getTotalPremiumPaid().add(payment.getAmount())
        );
        userPolicy.setNextPaymentDate(userPolicy.getNextPaymentDate().plusMonths(1));
        userPolicyRepository.save(userPolicy);

        return paymentRepository.save(payment);
    }

    public List<PaymentDto> getUserPayments(Long userId) {
        List<Payment> payments = paymentRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return payments.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<PaymentDto> getOverduePayments() {
        List<Payment> overduePayments = paymentRepository.findOverduePayments(LocalDateTime.now());
        return overduePayments.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Process claim payment for auto-approved claims
     */
    public Payment processClaimPayment(Payment payment) {
        // Validate payment details
        if (payment.getClaim() == null) {
            throw new RuntimeException("Payment must be associated with a claim");
        }
        
        if (payment.getAmount() == null || payment.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Payment amount must be positive");
        }
        
        // Set default values if not provided
        if (payment.getPaymentDate() == null) {
            payment.setPaymentDate(LocalDateTime.now());
        }
        
        if (payment.getStatus() == null) {
            payment.setStatus("PROCESSING");
        }
        
        if (payment.getTransactionId() == null) {
            payment.setTransactionId("CLM_" + System.currentTimeMillis());
        }
        
        // Save and return the payment
        return paymentRepository.save(payment);
    }

    private PaymentDto convertToDto(Payment payment) {
        PaymentDto dto = new PaymentDto();
        dto.setId(payment.getId());
        dto.setAmount(payment.getAmount());
        dto.setStatus(payment.getStatus());
        dto.setType(payment.getType());
        dto.setPaymentMethod(payment.getPaymentMethod());
        dto.setTransactionId(payment.getTransactionId());
        dto.setPaymentDate(payment.getPaymentDate());
        dto.setDueDate(payment.getDueDate());
        dto.setDescription(payment.getDescription());
        dto.setFailureReason(payment.getFailureReason());
        dto.setCreatedAt(payment.getCreatedAt());
        dto.setUpdatedAt(payment.getUpdatedAt());
        return dto;
    }
}
