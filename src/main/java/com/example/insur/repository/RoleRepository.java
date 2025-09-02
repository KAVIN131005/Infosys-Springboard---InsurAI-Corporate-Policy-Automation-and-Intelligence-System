package com.example.insur.repository;

import com.example.insur.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(String name);
    
    @Query("SELECT r FROM Role r WHERE r.name = :name ORDER BY r.id LIMIT 1")
    Optional<Role> findFirstByName(@Param("name") String name);
}