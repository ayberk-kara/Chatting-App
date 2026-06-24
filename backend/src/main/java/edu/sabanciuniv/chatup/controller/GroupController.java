package edu.sabanciuniv.chatup.controller;

import edu.sabanciuniv.chatup.dto.CreateGroupRequest;
import edu.sabanciuniv.chatup.dto.GroupMessageRequest;
import edu.sabanciuniv.chatup.model.Group;
import edu.sabanciuniv.chatup.model.Message;
import edu.sabanciuniv.chatup.security.UserPrincipal;
import edu.sabanciuniv.chatup.service.GroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/groups")
@RequiredArgsConstructor
public class GroupController {

    private final GroupService groupService;

    @PostMapping("/create")
    public ResponseEntity<Group> createGroup(@AuthenticationPrincipal UserPrincipal currentUser, @RequestBody CreateGroupRequest request) {
        Group group = groupService.createGroup(
            currentUser.getUsername(),
            request.getName(),
            request.getMemberEmails()
        );
        return ResponseEntity.ok(group);
    }

    @PostMapping("/{groupId}/add-member")
    public ResponseEntity<Group> addMember(@AuthenticationPrincipal UserPrincipal currentUser, @PathVariable String groupId, @RequestParam String memberEmail) {
        Group group = groupService.addMember(groupId, memberEmail);
        return ResponseEntity.ok(group);
    }

    @PostMapping("/{groupId}/send")
    public ResponseEntity<Message> sendGroupMessage(@AuthenticationPrincipal UserPrincipal currentUser, @PathVariable String groupId, @RequestBody GroupMessageRequest request) {
        Message message = groupService.sendGroupMessage(currentUser.getUsername(), groupId, request.getContent());
        return ResponseEntity.ok(message);
    }

    @GetMapping("/{groupId}/messages")
    public ResponseEntity<List<Message>> getGroupMessages(@AuthenticationPrincipal UserPrincipal currentUser, @PathVariable String groupId) {
        List<Message> messages = groupService.getGroupMessages(groupId, currentUser.getUsername());
        return ResponseEntity.ok(messages);
    }

    @GetMapping("/{groupId}/members")
    public ResponseEntity<Set<String>> getGroupMembers(@AuthenticationPrincipal UserPrincipal currentUser, @PathVariable String groupId) {
        Set<String> members = groupService.getGroupMembers(groupId, currentUser.getUsername());
        return ResponseEntity.ok(members);
    }

    @GetMapping
    public ResponseEntity<List<Group>> getUserGroups(@AuthenticationPrincipal UserPrincipal currentUser) {
        List<Group> groups = groupService.getUserGroups(currentUser.getUsername());
        return ResponseEntity.ok(groups);
    }

    @GetMapping("/{groupId}")
    public ResponseEntity<Group> getGroupDetails(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable String groupId) {
        Group group = groupService.getGroupDetails(groupId, currentUser.getUsername());
        return ResponseEntity.ok(group);
    }
}
