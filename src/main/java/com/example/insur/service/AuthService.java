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
        // Check if user already exists
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }
        
        Role role = roleRepository.findFirstByName(request.getRole()).orElseThrow(() -> 
            new RuntimeException("Role not found: " + request.getRole()));
        
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEmail(request.getEmail());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhoneNumber(request.getPhoneNumber());
        
        // Optional fields - set only if provided
        if (request.getDateOfBirth() != null) {
            user.setDateOfBirth(request.getDateOfBirth());
        }
        if (request.getAddress() != null && !request.getAddress().trim().isEmpty()) {
            user.setAddress(request.getAddress());
        }
        if (request.getCity() != null && !request.getCity().trim().isEmpty()) {
            user.setCity(request.getCity());
        }
        if (request.getState() != null && !request.getState().trim().isEmpty()) {
            user.setState(request.getState());
        }
        if (request.getPostalCode() != null && !request.getPostalCode().trim().isEmpty()) {
            user.setPostalCode(request.getPostalCode());
        }
        if (request.getCountry() != null && !request.getCountry().trim().isEmpty()) {
            user.setCountry(request.getCountry());
        }
        
        user.setRole(role);
        user.setIsVerified(true);  // Auto-verify users on registration
        user.setIsActive(true);    // Ensure user is active
        
        User savedUser = userRepository.save(user);

        // Return response without token - user must login manually
        return buildRegistrationResponse(savedUser);
    }

    public JwtResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );
        User user = userRepository.findByUsernameOrEmail(request.getUsername(), request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        String jwtToken = jwtService.generateToken(user);
        return buildJwtResponse(jwtToken, user);
    }

    private JwtResponse buildJwtResponse(String jwtToken, User user) {
        JwtResponse jwtResponse = new JwtResponse();
        jwtResponse.setToken(jwtToken);
        jwtResponse.setId(user.getId());
        jwtResponse.setUsername(user.getUsername());
        jwtResponse.setEmail(user.getEmail());
        jwtResponse.setFirstName(user.getFirstName());
        jwtResponse.setLastName(user.getLastName());
        jwtResponse.setRole(user.getRole().getName());
        return jwtResponse;
    }

    private JwtResponse buildRegistrationResponse(User user) {
        JwtResponse jwtResponse = new JwtResponse();
        // No token - user must login manually
        jwtResponse.setToken(null);
        jwtResponse.setId(user.getId());
        jwtResponse.setUsername(user.getUsername());
        jwtResponse.setEmail(user.getEmail());
        jwtResponse.setFirstName(user.getFirstName());
        jwtResponse.setLastName(user.getLastName());
        jwtResponse.setRole(user.getRole().getName());
        return jwtResponse;
    }
}