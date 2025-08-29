package com.example.insur.service;

import com.example.insur.entity.Clause;
import com.example.insur.repository.ClauseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ClauseService {

    private final ClauseRepository clauseRepository;

    public Clause saveClause(Clause clause) {
        return clauseRepository.save(clause);
    }
}