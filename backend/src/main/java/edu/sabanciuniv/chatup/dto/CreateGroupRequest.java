package edu.sabanciuniv.chatup.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.Set;

@Data
public class CreateGroupRequest {
    @NotBlank
    private String name;
    
    @NotEmpty
    private Set<String> memberEmails;
}
