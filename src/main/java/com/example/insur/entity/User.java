
package com.example.insur.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "users")
@Data
public class User implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column
    private String address;

    @Column
    private String city;

    @Column
    private String state;

    @Column(name = "postal_code")
    private String postalCode;

    @Column
    private String country;

    @Column(name = "profile_image")
    private String profileImage;

    @Column(name = "is_verified")
    private Boolean isVerified = false;

    @Column(name = "verification_token")
    private String verificationToken;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<UserPolicy> userPolicies = new ArrayList<>();

    @OneToMany(mappedBy = "broker", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Policy> createdPolicies = new ArrayList<>();

    @OneToMany(mappedBy = "submittedBy", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Claim> submittedClaims = new ArrayList<>();

    @OneToMany(mappedBy = "reviewedBy", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Claim> reviewedClaims = new ArrayList<>();

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.getName()));
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return isActive;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return isActive && isVerified;
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Helper methods
    public String getFullName() {
        return (firstName != null ? firstName : "") + " " + (lastName != null ? lastName : "");
    }

    public boolean isAdmin() {
        return role != null && "ADMIN".equals(role.getName());
    }

    public boolean isBroker() {
        return role != null && "BROKER".equals(role.getName());
    }

    public boolean isUser() {
        return role != null && "USER".equals(role.getName());
    }
}