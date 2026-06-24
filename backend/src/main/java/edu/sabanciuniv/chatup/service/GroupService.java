package edu.sabanciuniv.chatup.service;

import edu.sabanciuniv.chatup.model.Group;
import edu.sabanciuniv.chatup.model.Message;
import edu.sabanciuniv.chatup.model.User;
import edu.sabanciuniv.chatup.repository.GroupRepository;
import edu.sabanciuniv.chatup.repository.MessageRepository;
import edu.sabanciuniv.chatup.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GroupService {
    private final GroupRepository groupRepository;
    private final UserRepository userRepository;
    private final MessageRepository messageRepository;

    public Group createGroup(String creatorEmail, String groupName, Set<String> memberEmails) {
        // Validate creator exists
        userRepository.findByEmail(creatorEmail).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Creator not found"));

        // Validate all members exist
        memberEmails.forEach(email -> 
            userRepository.findByEmail(email)
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND, 
                            "Member not found: " + email))
        );

        // Create group
        Group group = new Group();
        group.setName(groupName);
        group.setCreatorId(creatorEmail);
        group.setMembers(memberEmails);
        group.getMembers().add(creatorEmail);  // Add creator to members
        group.setCreatedAt(LocalDateTime.now());
        group.setUpdatedAt(LocalDateTime.now());

        return groupRepository.save(group);
    }

    public Group addMember(String groupId, String memberEmail) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Group not found"));

        // Validate member exists
        userRepository.findByEmail(memberEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // Add member
        group.getMembers().add(memberEmail);
        group.setUpdatedAt(LocalDateTime.now());

        return groupRepository.save(group);
    }

    public Message sendGroupMessage(String senderEmail, String groupId, String content) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Group not found"));

        // Verify sender is a member
        if (!group.getMembers().contains(senderEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not a member of this group");
        }

        // Create and save message
        Message message = new Message();
        message.setSenderId(senderEmail);
        message.setGroupId(groupId);
        message.setContent(content);
        message.setTimestamp(LocalDateTime.now());
        message.setGroupMessage(true);

        return messageRepository.save(message);
    }

    public List<Message> getGroupMessages(String groupId, String userEmail) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Group not found"));

        // Verify user is a member
        if (!group.getMembers().contains(userEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not a member of this group");
        }

        return messageRepository.findByGroupIdOrderByTimestampDesc(groupId);
    }

    public Set<String> getGroupMembers(String groupId, String userEmail) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Group not found"));

        // Verify user is a member
        if (!group.getMembers().contains(userEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not a member of this group");
        }

        return group.getMembers();
    }

    public List<Group> getUserGroups(String userEmail) {
        // Validate user exists
        userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // Find all groups where user is a member
        return groupRepository.findByMembersContaining(userEmail);
    }

    public Group getGroupDetails(String groupId, String userEmail) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Group not found"));

        // Verify user is a member
        if (!group.getMembers().contains(userEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not a member of this group");
        }

        return group;
    }
}
