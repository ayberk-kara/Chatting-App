package edu.sabanciuniv.chatup.service;

import edu.sabanciuniv.chatup.model.FriendRequest;
import edu.sabanciuniv.chatup.model.User;
import edu.sabanciuniv.chatup.repository.FriendRequestRepository;
import edu.sabanciuniv.chatup.repository.UserRepository;
import edu.sabanciuniv.chatup.dto.UserDto;
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
public class FriendService {

    private final UserRepository userRepository;
    private final FriendRequestRepository friendRequestRepository;

    public void sendFriendRequest(String currentUserEmail, String friendEmail) {
        // Can't send request to yourself
        if (currentUserEmail.equals(friendEmail)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot send friend request to yourself");
        }

        // Check if friend exists
        User friend = userRepository.findByEmail(friendEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // Check if they're already friends
        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Current user not found"));

        if (currentUser.getFriends().contains(friendEmail)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Already friends with this user");
        }

        // Check if request already exists
        if (friendRequestRepository.findBySenderIdAndReceiverId(currentUserEmail, friendEmail).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Friend request already sent");
        }

        // Create and save friend request
        FriendRequest request = new FriendRequest();
        request.setSenderId(currentUserEmail);
        request.setReceiverId(friendEmail);
        request.setStatus(FriendRequest.RequestStatus.PENDING);
        request.setCreatedAt(LocalDateTime.now());
        request.setUpdatedAt(LocalDateTime.now());

        friendRequestRepository.save(request);
    }

    public void acceptFriendRequest(String currentUserEmail, String friendEmail) {
        // Find and validate friend request
        FriendRequest request = friendRequestRepository
                .findBySenderIdAndReceiverId(friendEmail, currentUserEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Friend request not found"));

        if (request.getStatus() != FriendRequest.RequestStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Friend request already processed");
        }

        // Update request status
        request.setStatus(FriendRequest.RequestStatus.ACCEPTED);
        request.setUpdatedAt(LocalDateTime.now());
        friendRequestRepository.save(request);

        // Update both users' friend lists
        User currentUser = userRepository.findByEmail(currentUserEmail).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Current user not found"));
        User friend = userRepository.findByEmail(friendEmail).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Friend user not found"));

        currentUser.getFriends().add(friendEmail);
        friend.getFriends().add(currentUserEmail);

        userRepository.save(currentUser);
        userRepository.save(friend);
    }

    public List<UserDto> getFriendListWithDetails(String currentUserEmail) {
        // Get current user
        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // Get friend details
        return currentUser.getFriends().stream()
                .map(friendEmail -> userRepository.findByEmail(friendEmail)
                        .map(friend -> UserDto.builder()
                                .email(friend.getEmail())
                                .firstName(friend.getFirstName())
                                .lastName(friend.getLastName())
                                .build())
                        .orElse(null))
                .filter(dto -> dto != null)
                .collect(Collectors.toList());
    }

    public List<FriendRequest> getPendingRequests(String currentUserEmail) {
        return friendRequestRepository.findByReceiverIdAndStatus(currentUserEmail, FriendRequest.RequestStatus.PENDING);
    }
}
