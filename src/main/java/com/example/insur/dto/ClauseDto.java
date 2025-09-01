package com.example.insur.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClauseDto {
    private Long id;
    private String title;
    private String content;
    private String type;
    private Boolean mandatory;
}
