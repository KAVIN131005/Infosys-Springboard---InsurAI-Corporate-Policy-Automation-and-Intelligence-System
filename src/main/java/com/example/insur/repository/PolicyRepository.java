package com.example.insur.repository;

import com.example.insur.entity.Policy;
import com.example.insur.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface PolicyRepository extends JpaRepository<Policy, Long> {
    
    List<Policy> findByBroker(User broker);
    
    List<Policy> findByUploadedBy(User uploadedBy);
    
    List<Policy> findByStatus(String status);
    
    List<Policy> findByType(String type);
    
    List<Policy> findByTypeAndStatus(String type, String status);
    
    List<Policy> findByRiskLevel(String riskLevel);
    
    @Query("SELECT p FROM Policy p WHERE p.status = 'ACTIVE' AND p.monthlyPremium BETWEEN :minPremium AND :maxPremium")
    List<Policy> findActivePoliciesByPremiumRange(@Param("minPremium") BigDecimal minPremium, 
                                                 @Param("maxPremium") BigDecimal maxPremium);
    
    @Query("SELECT p FROM Policy p WHERE p.status = 'ACTIVE' AND " +
           "(:type IS NULL OR p.type = :type) AND " +
           "(:subType IS NULL OR p.subType = :subType) AND " +
           "(:minAge IS NULL OR p.minAge <= :minAge) AND " +
           "(:maxAge IS NULL OR p.maxAge >= :maxAge)")
    List<Policy> findAvailablePolicies(@Param("type") String type,
                                     @Param("subType") String subType,
                                     @Param("minAge") Integer minAge,
                                     @Param("maxAge") Integer maxAge);
    
    @Query("SELECT p FROM Policy p WHERE p.status = 'PENDING_APPROVAL'")
    List<Policy> findPendingApprovalPolicies();
    
    @Query("SELECT p FROM Policy p WHERE p.requiresApproval = false AND p.status = 'ACTIVE'")
    List<Policy> findAutoApprovablePolicies();
}