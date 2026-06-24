package edu.sabanciuniv.chatup.controller;

import edu.sabanciuniv.chatup.dto.FriendRequestDto;
import edu.sabanciuniv.chatup.dto.SuccessResponse;
import edu.sabanciuniv.chatup.dto.UserDto;
import edu.sabanciuniv.chatup.model.FriendRequest;
import edu.sabanciuniv.chatup.security.UserPrincipal;
import edu.sabanciuniv.chatup.service.FriendService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/friends")
@RequiredArgsConstructor
public class FriendController {
    private final FriendService friendService;

    @PostMapping("/add")
    public ResponseEntity<?> sendFriendRequest(@AuthenticationPrincipal UserPrincipal currentUser, @RequestBody FriendRequestDto request) {
        try {
            friendService.sendFriendRequest(currentUser.getUsername(), request.getEmail());
            return ResponseEntity.ok().body(new SuccessResponse("Friend request sent successfully"));
        } catch (ResponseStatusException e) {
            throw e;  // Will be handled by GlobalExceptionHandler
        }
    }

    @PostMapping("/accept")
    public ResponseEntity<?> acceptFriendRequest(@AuthenticationPrincipal UserPrincipal currentUser, @RequestBody FriendRequestDto request) {
        try {
            friendService.acceptFriendRequest(currentUser.getUsername(), request.getEmail());
            return ResponseEntity.ok().body(new SuccessResponse("Friend request accepted successfully"));
        } catch (ResponseStatusException e) {
            throw e;
        }
    }

    @GetMapping
    public ResponseEntity<List<UserDto>> getFriendList(@AuthenticationPrincipal UserPrincipal currentUser) {
        List<UserDto> friends = friendService.getFriendListWithDetails(currentUser.getUsername());
        return ResponseEntity.ok(friends);
    }

    @GetMapping("/pending")
    public ResponseEntity<List<FriendRequest>> getPendingRequests(@AuthenticationPrincipal UserPrincipal currentUser) {
        List<FriendRequest> pendingRequests = friendService.getPendingRequests(currentUser.getUsername());
        return ResponseEntity.ok(pendingRequests);
    }
}
