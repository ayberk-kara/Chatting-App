package edu.sabanciuniv.chatup.controller;

import edu.sabanciuniv.chatup.dto.MessageRequest;
import edu.sabanciuniv.chatup.dto.SuccessResponse;
import edu.sabanciuniv.chatup.model.Message;
import edu.sabanciuniv.chatup.security.UserPrincipal;
import edu.sabanciuniv.chatup.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    @PostMapping("/send")
    public ResponseEntity<Message> sendMessage(@AuthenticationPrincipal UserPrincipal currentUser, @RequestBody MessageRequest request) {
        Message message = messageService.sendMessage(
            currentUser.getUsername(),
            request.getRecipientEmail(),
            request.getContent()
        );
        return ResponseEntity.ok(message);
    }

    @GetMapping
    public ResponseEntity<List<Message>> getConversationHistory(@AuthenticationPrincipal UserPrincipal currentUser, @RequestParam String otherEmail) {
        List<Message> messages = messageService.getConversationHistory(
            currentUser.getUsername(),
            otherEmail
        );
        return ResponseEntity.ok(messages);
    }

    @PostMapping("/{messageId}/read")
    public ResponseEntity<SuccessResponse> markAsRead(@AuthenticationPrincipal UserPrincipal currentUser, @PathVariable String messageId) {
        messageService.markMessageAsRead(messageId, currentUser.getUsername());
        return ResponseEntity.ok(new SuccessResponse("Message marked as read"));
    }

    @DeleteMapping("/{messageId}")
    public ResponseEntity<SuccessResponse> deleteMessage(@AuthenticationPrincipal UserPrincipal currentUser, @PathVariable String messageId) {
        messageService.deleteMessage(messageId, currentUser.getUsername());
        return ResponseEntity.ok(new SuccessResponse("Message deleted successfully"));
    }

    @GetMapping("/unread/count")
    public ResponseEntity<Long> getUnreadCount(@AuthenticationPrincipal UserPrincipal currentUser) {
        long count = messageService.getUnreadMessageCount(currentUser.getUsername());
        return ResponseEntity.ok(count);
    }

    @GetMapping("/unread")
    public ResponseEntity<List<Message>> getUnreadMessages(@AuthenticationPrincipal UserPrincipal currentUser) {
        List<Message> messages = messageService.getUnreadMessages(currentUser.getUsername());
        return ResponseEntity.ok(messages);
    }

    @GetMapping("/recent")
    public ResponseEntity<List<Message>> getRecentConversations(@AuthenticationPrincipal UserPrincipal currentUser) {
        List<Message> conversations = messageService.getRecentConversations(currentUser.getUsername());
        return ResponseEntity.ok(conversations);
    }
}
