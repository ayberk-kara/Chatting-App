package edu.sabanciuniv.chatup.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Data
@Document(collection = "groups")
public class Group {
    @Id
    private String id;
    private String name;
    private String creatorId;
    private Set<String> members = new HashSet<>();
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
