package com.example.insur.repository;

import com.example.insur.entity.Claim;
import com.example.insur.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

// Ensure that the Claim entity exists at com.example.insur.entity.Claim
// If the Claim class is in a different package, update the import accordingly.

import java.util.List;

@Repository
public interface ClaimRepository extends JpaRepository<Claim, Long> {
    List<Claim> findBySubmittedBy(User user);
}