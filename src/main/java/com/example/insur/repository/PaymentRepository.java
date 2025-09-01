package com.example.insur.repository;

import com.example.insur.entity.Payment;
import com.example.insur.entity.UserPolicy;
import com.example.insur.entity.Claim;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    
    List<Payment> findByUserPolicy(UserPolicy userPolicy);
    
    List<Payment> findByStatus(String status);
    
    List<Payment> findByType(String type);
    
    List<Payment> findByClaim(Claim claim);
    
    List<Payment> findByTransactionId(String transactionId);
    
    @Query("SELECT p FROM Payment p WHERE p.userPolicy.user.id = :userId ORDER BY p.createdAt DESC")
    List<Payment> findByUserIdOrderByCreatedAtDesc(@Param("userId") Long userId);
    
    @Query("SELECT p FROM Payment p WHERE p.status = 'PENDING' AND p.dueDate <= :date")
    List<Payment> findOverduePayments(@Param("date") LocalDateTime date);
    
    @Query("SELECT p FROM Payment p WHERE p.userPolicy = :userPolicy AND p.type = 'PREMIUM' ORDER BY p.createdAt DESC")
    List<Payment> findPremiumPaymentsByUserPolicy(@Param("userPolicy") UserPolicy userPolicy);
    
    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.userPolicy = :userPolicy AND p.status = 'COMPLETED' AND p.type = 'PREMIUM'")
    Double getTotalPaidPremiums(@Param("userPolicy") UserPolicy userPolicy);
    
    @Query("SELECT p FROM Payment p WHERE p.paymentDate BETWEEN :startDate AND :endDate AND p.status = 'COMPLETED'")
    List<Payment> findCompletedPaymentsByDateRange(@Param("startDate") LocalDateTime startDate, 
                                                  @Param("endDate") LocalDateTime endDate);
}