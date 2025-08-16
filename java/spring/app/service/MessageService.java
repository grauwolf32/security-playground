package demo.service;

import demo.dto.SendMessageRequest;
import demo.model.Message;
import demo.repo.MessageRepo;
import demo.repo.UserRepo;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MessageService {
    private final MessageRepo messages;
    private final UserRepo users;

    public MessageService(MessageRepo messages, UserRepo users) {
        this.messages = messages; this.users = users;
    }

    public void send(Integer fromUserId, SendMessageRequest req) {
        users.findById(req.toUserId()).orElseThrow(() -> new IllegalArgumentException("Receiver not found"));
        users.findById(fromUserId).orElseThrow(() -> new IllegalArgumentException("Sender not found"));
        messages.save(Message.builder()
                .sender(fromUserId)
                .receiver(req.toUserId())
                .message(req.message())
                .build());
    }

    public List<Message> inbox(Integer userId) {
        return messages.findByReceiverOrderByIdDesc(userId);
    }

    public List<Message> outbox(Integer userId) {
        return messages.findBySenderOrderByIdDesc(userId);
    }
}
