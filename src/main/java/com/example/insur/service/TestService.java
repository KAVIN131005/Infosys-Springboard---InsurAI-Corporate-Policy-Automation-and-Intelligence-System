package com.example.insur.service;

import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.HashMap;

@Service
public class TestService {
    
    public Map<String, Object> testMethod() {
        Map<String, Object> result = new HashMap<>();
        result.put("status", "working");
        return result;
    }
}
