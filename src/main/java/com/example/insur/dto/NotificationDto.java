package com.example.insur.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDto {
    private Long id;
    private String title;
    private String message;
    private String type; // success, warning, error, info
    private Boolean isRead;
    private Long userId;
    private String recipient; // admin, broker, user
    private LocalDateTime createdAt;
}
