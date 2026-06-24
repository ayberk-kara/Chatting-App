package edu.sabanciuniv.chatup.dto;

import lombok.Data;
import lombok.Builder;

@Data
@Builder
public class UserDto {
    private String email;
    private String firstName;
    private String lastName;
    // We don't include sensitive fields like password
} 