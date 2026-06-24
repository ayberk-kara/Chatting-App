package edu.sabanciuniv.chatup.repository;

import edu.sabanciuniv.chatup.model.Group;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface GroupRepository extends MongoRepository<Group, String> {
    List<Group> findByMembersContaining(String memberEmail);
}
