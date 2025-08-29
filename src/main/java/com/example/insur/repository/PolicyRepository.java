package com.example.insur.repository;

import com.example.insur.entity.Policy;
import com.example.insur.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PolicyRepository extends JpaRepository<Policy, Long> {
    List<Policy> findByUploadedBy(User user);
}