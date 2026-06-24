package edu.sabanciuniv.chatup.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@Document(collection = "messages")
public class Message {
    @Id
    private String id;
    private String senderId;
    private String recipientId;
    private String content;
    private LocalDateTime timestamp;
    private boolean isGroupMessage;
    private String groupId;
    private boolean isRead;
    private boolean isDeleted;
    private LocalDateTime readAt;
    private LocalDateTime deletedAt;
}
