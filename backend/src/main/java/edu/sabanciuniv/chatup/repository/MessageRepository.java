package edu.sabanciuniv.chatup.repository;

import edu.sabanciuniv.chatup.model.Message;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface MessageRepository extends MongoRepository<Message, String> {
    List<Message> findBySenderIdAndRecipientIdOrRecipientIdAndSenderIdOrderByTimestampDesc(
            String senderId1, String recipientId1,
            String senderId2, String recipientId2
    );
    
    List<Message> findByRecipientIdAndIsReadFalseAndIsDeletedFalse(String recipientId);
    
    long countByRecipientIdAndIsReadFalseAndIsDeletedFalse(String recipientId);
    
    List<Message> findDistinctBySenderIdOrRecipientIdOrderByTimestampDesc(String userId1, String userId2);

    List<Message> findByGroupIdOrderByTimestampDesc(String groupId);
}
