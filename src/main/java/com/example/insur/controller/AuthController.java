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

import com.example.insur.dto.UserDto;
import com.example.insur.service.UserService;

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
}