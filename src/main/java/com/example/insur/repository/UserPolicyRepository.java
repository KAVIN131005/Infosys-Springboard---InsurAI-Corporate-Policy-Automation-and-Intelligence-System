package com.example.insur.repository;

import com.example.insur.entity.UserPolicy;
import com.example.insur.entity.User;
import com.example.insur.entity.Policy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserPolicyRepository extends JpaRepository<UserPolicy, Long> {
    
    List<UserPolicy> findByUser(User user);
    
    List<UserPolicy> findByUserAndStatus(User user, String status);
    
    List<UserPolicy> findByPolicy(Policy policy);
    
    List<UserPolicy> findByStatus(String status);
    
    Optional<UserPolicy> findByUserAndPolicy(User user, Policy policy);
    
    @Query("SELECT up FROM UserPolicy up WHERE up.nextPaymentDate <= :date AND up.paymentStatus = 'CURRENT'")
    List<UserPolicy> findDuePayments(@Param("date") LocalDate date);
    
    @Query("SELECT up FROM UserPolicy up WHERE up.user = :user AND up.status = 'ACTIVE'")
    List<UserPolicy> findActiveUserPolicies(@Param("user") User user);
    
    @Query("SELECT COUNT(up) FROM UserPolicy up WHERE up.policy = :policy AND up.status = 'ACTIVE'")
    Long countActivePoliciesByPolicy(@Param("policy") Policy policy);
    
    @Query("SELECT up FROM UserPolicy up WHERE up.endDate <= :date AND up.status = 'ACTIVE'")
    List<UserPolicy> findExpiringPolicies(@Param("date") LocalDate date);
}
