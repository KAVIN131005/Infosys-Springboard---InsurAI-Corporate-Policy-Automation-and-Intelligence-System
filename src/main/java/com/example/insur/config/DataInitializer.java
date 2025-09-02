package com.example.insur.config;

import com.example.insur.entity.User;
import com.example.insur.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {
    
    private final UserRepository userRepository;
    
    @Override
    public void run(String... args) throws Exception {
        // Update any existing users to be verified and active
        updateExistingUsers();
    }
    
    private void updateExistingUsers() {
        try {
            List<User> unverifiedUsers = userRepository.findByIsVerifiedFalse();
            if (!unverifiedUsers.isEmpty()) {
                log.info("Found {} unverified users. Updating them to verified status.", unverifiedUsers.size());
                
                for (User user : unverifiedUsers) {
                    user.setIsVerified(true);
                    if (user.getIsActive() == null || !user.getIsActive()) {
                        user.setIsActive(true);
                    }
                    userRepository.save(user);
                }
                
                log.info("Successfully updated {} users to verified status.", unverifiedUsers.size());
            } else {
                log.info("No unverified users found.");
            }
        } catch (Exception e) {
            log.error("Error updating existing users: {}", e.getMessage());
        }
    }
}
