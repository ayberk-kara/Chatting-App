package edu.sabanciuniv.chatup.repository;

import edu.sabanciuniv.chatup.model.FriendRequest;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface FriendRequestRepository extends MongoRepository<FriendRequest, String> {
    List<FriendRequest> findByReceiverIdAndStatus(String receiverId, FriendRequest.RequestStatus status);
    List<FriendRequest> findBySenderIdAndStatus(String senderId, FriendRequest.RequestStatus status);
    Optional<FriendRequest> findBySenderIdAndReceiverId(String senderId, String receiverId);
}
