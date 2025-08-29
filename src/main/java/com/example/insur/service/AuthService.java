package com.example.insur.service;

import com.example.insur.config.JwtService;
import com.example.insur.dto.JwtResponse;
import com.example.insur.dto.LoginRequest;
import com.example.insur.dto.RegisterRequest;
import com.example.insur.entity.Role;
import com.example.insur.entity.User;
import com.example.insur.repository.RoleRepository;
import com.example.insur.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public JwtResponse register(RegisterRequest request) {
        Role role = roleRepository.findByName(request.getRole()).orElseThrow();
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(role);
        userRepository.save(user);

        String jwtToken = jwtService.generateToken(user);
        return buildJwtResponse(jwtToken, user);
    }

    public JwtResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );
        User user = userRepository.findByUsername(request.getUsername()).orElseThrow();
        String jwtToken = jwtService.generateToken(user);
        return buildJwtResponse(jwtToken, user);
    }

    private JwtResponse buildJwtResponse(String jwtToken, User user) {
        JwtResponse jwtResponse = new JwtResponse();
        jwtResponse.setToken(jwtToken);
        jwtResponse.setId(user.getId());
        jwtResponse.setUsername(user.getUsername());
        jwtResponse.setRole(user.getRole().getName());
        return jwtResponse;
    }
}