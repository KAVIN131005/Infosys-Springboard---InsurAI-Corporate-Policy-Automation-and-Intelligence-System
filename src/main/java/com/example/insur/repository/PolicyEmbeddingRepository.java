package com.example.insur.repository;

// Update the import path to match the actual location of PolicyEmbedding
import com.example.insur.entity.PolicyEmbedding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PolicyEmbeddingRepository extends JpaRepository<PolicyEmbedding, Long> {
}