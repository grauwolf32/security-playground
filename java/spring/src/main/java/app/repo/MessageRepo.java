package app.repo;

import app.models.Message;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MessageRepo extends JpaRepository<Message, Integer> {
    List<Message> findByReceiverOrderByIdDesc(Integer receiver);
    List<Message> findBySenderOrderByIdDesc(Integer sender);
}