package com.example.insur.controller;

import com.example.insur.dto.JwtResponse;
import com.example.insur.dto.LoginRequest;
import com.example.insur.dto.RegisterRequest;
import com.example.insur.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import com.example.insur.dto.UserDto;
import com.example.insur.service.UserService;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserService userService;

    @PostMapping("/register")
        public ResponseEntity<JwtResponse> register(@RequestBody RegisterRequest request) {
            JwtResponse response = authService.register(request);
            return ResponseEntity.ok(response);
        }

    @PostMapping("/login")
        public ResponseEntity<JwtResponse> login(@RequestBody LoginRequest request) {
            JwtResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        }

    @GetMapping("/me")
    public ResponseEntity<UserDto> me() {
        try {
            UserDto dto = userService.getCurrentUserDto();
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.ok(null);
        }
    }

    @GetMapping("/verify")
    public ResponseEntity<Map<String, Object>> verifyToken() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            Map<String, Object> response = new HashMap<>();
            
            if (authentication != null && authentication.isAuthenticated() && 
                !authentication.getPrincipal().equals("anonymousUser")) {
                response.put("valid", true);
                response.put("username", authentication.getName());
            } else {
                response.put("valid", false);
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("valid", false);
            return ResponseEntity.ok(response);
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<JwtResponse> refreshToken(@RequestBody Map<String, String> request) {
        try {
            String refreshToken = request.get("refreshToken");
            JwtResponse response = authService.refreshToken(refreshToken);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout() {
        try {
            SecurityContextHolder.clearContext();
            Map<String, String> response = new HashMap<>();
            response.put("message", "Logged out successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Logout failed");
            return ResponseEntity.badRequest().body(response);
        }
    }
}