package app.service;

import app.dto.SendMessageRequest;
import app.models.Message;
import app.repo.MessageRepo;
import app.repo.UserRepo;
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
        users.findById(req.getToUserId()).orElseThrow(() -> new IllegalArgumentException("Receiver not found"));
        users.findById(fromUserId).orElseThrow(() -> new IllegalArgumentException("Sender not found"));
        messages.save(Message.builder()
                .sender(fromUserId)
                .receiver(req.getToUserId())
                .message(req.getMessage())
                .build());
    }

    public List<Message> inbox(Integer userId) {
        return messages.findByReceiverOrderByIdDesc(userId);
    }

    public List<Message> outbox(Integer userId) {
        return messages.findBySenderOrderByIdDesc(userId);
    }
}
