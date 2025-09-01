package com.example.insur.repository;

import com.example.insur.entity.Claim;
import com.example.insur.entity.User;
import com.example.insur.entity.UserPolicy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ClaimRepository extends JpaRepository<Claim, Long> {
    
    List<Claim> findBySubmittedBy(User user);
    
    List<Claim> findByUserPolicy(UserPolicy userPolicy);
    
    List<Claim> findByStatus(String status);
    
    List<Claim> findByType(String type);
    
    Optional<Claim> findByClaimNumber(String claimNumber);
    
    @Query("SELECT c FROM Claim c WHERE c.userPolicy.user = :user ORDER BY c.createdAt DESC")
    List<Claim> findByUserOrderByCreatedAtDesc(@Param("user") User user);
    
    @Query("SELECT c FROM Claim c WHERE c.status = 'UNDER_REVIEW' AND c.requiresManualReview = false")
    List<Claim> findPendingAutoReview();
    
    @Query("SELECT c FROM Claim c WHERE c.status = 'UNDER_REVIEW' AND c.requiresManualReview = true")
    List<Claim> findPendingManualReview();
    
    @Query("SELECT c FROM Claim c WHERE c.fraudScore > :threshold")
    List<Claim> findHighFraudRiskClaims(@Param("threshold") Double threshold);
    
    @Query("SELECT c FROM Claim c WHERE c.createdAt BETWEEN :startDate AND :endDate")
    List<Claim> findClaimsByDateRange(@Param("startDate") LocalDateTime startDate, 
                                     @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT COUNT(c) FROM Claim c WHERE c.userPolicy.policy.id = :policyId AND c.status = 'APPROVED'")
    Long countApprovedClaimsByPolicy(@Param("policyId") Long policyId);
}