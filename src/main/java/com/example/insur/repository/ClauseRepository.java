package com.example.insur.repository;

// Update the import to the correct package where Clause is defined
import com.example.insur.entity.Clause;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClauseRepository extends JpaRepository<Clause, Long> {
}