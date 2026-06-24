package edu.sabanciuniv.chatup.service;

import edu.sabanciuniv.chatup.model.Message;
import edu.sabanciuniv.chatup.model.User;
import edu.sabanciuniv.chatup.repository.MessageRepository;
import edu.sabanciuniv.chatup.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    public Message sendMessage(String senderEmail, String recipientEmail, String content) {
        // Validate sender
        User sender = userRepository.findByEmail(senderEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sender not found"));

        // Validate recipient
        User recipient = userRepository.findByEmail(recipientEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Recipient not found"));

        // Check if they are friends
        if (!sender.getFriends().contains(recipientEmail)) {
            throw new ResponseStatusException(
                HttpStatus.FORBIDDEN, 
                "Cannot send message. You must be friends with the recipient"
            );
        }

        // Create and save message
        Message message = new Message();
        message.setSenderId(senderEmail);
        message.setRecipientId(recipientEmail);
        message.setContent(content);
        message.setTimestamp(LocalDateTime.now());
        message.setGroupMessage(false);
        message.setRead(false);
        message.setDeleted(false);

        return messageRepository.save(message);
    }

    public List<Message> getConversationHistory(String userEmail, String otherEmail) {
        // Validate both users exist
        userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        userRepository.findByEmail(otherEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Other user not found"));

        // Get all messages where:
        // (sender = userEmail AND recipient = otherEmail) OR
        // (sender = otherEmail AND recipient = userEmail)
        List<Message> messages = messageRepository.findAll().stream()
                .filter(msg -> !msg.isGroupMessage()) // Exclude group messages
                .filter(msg -> !msg.isDeleted())      // Exclude deleted messages
                .filter(msg -> 
                    (msg.getSenderId().equals(userEmail) && msg.getRecipientId().equals(otherEmail)) ||
                    (msg.getSenderId().equals(otherEmail) && msg.getRecipientId().equals(userEmail))
                )
                .sorted((m1, m2) -> m2.getTimestamp().compareTo(m1.getTimestamp()))
                .toList();

        return messages;
    }

    public void markMessageAsRead(String messageId, String userEmail) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Message not found"));

        // Verify the user is the recipient
        if (!message.getRecipientId().equals(userEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot mark this message as read");
        }

        message.setRead(true);
        message.setReadAt(LocalDateTime.now());
        messageRepository.save(message);
    }

    public void deleteMessage(String messageId, String userEmail) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Message not found"));

        // Verify the user is either sender or recipient
        if (!message.getSenderId().equals(userEmail) && !message.getRecipientId().equals(userEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot delete this message");
        }

        message.setDeleted(true);
        message.setDeletedAt(LocalDateTime.now());
        messageRepository.save(message);
    }

    public long getUnreadMessageCount(String userEmail) {
        return messageRepository.countByRecipientIdAndIsReadFalseAndIsDeletedFalse(userEmail);
    }

    public List<Message> getUnreadMessages(String userEmail) {
        return messageRepository.findByRecipientIdAndIsReadFalseAndIsDeletedFalse(userEmail);
    }

    public List<Message> getRecentConversations(String userEmail) {
        return messageRepository.findDistinctBySenderIdOrRecipientIdOrderByTimestampDesc(
                userEmail, userEmail
        );
    }
}
