package edu.sabanciuniv.chatup.dto;

import lombok.Data;

@Data
public class MessageRequest {
    private String recipientEmail;
    private String content;
}
