package app.web;

import app.dto.SendMessageRequest;
import app.models.Message;
import app.security.AuthContext;
import app.security.SessionFilter;
import app.service.MessageService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
public class MessageController {
    private final MessageService svc;

    public MessageController(MessageService svc) { this.svc = svc; }

    private Integer requireUser(HttpServletRequest req) {
        AuthContext ctx = (AuthContext) req.getAttribute(SessionFilter.ATTR);
        if (ctx == null) throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.UNAUTHORIZED, "Missing or expired session");
        return ctx.getUserId();
    }

    @PostMapping("/send")
    public ResponseEntity<?> send(HttpServletRequest req, @Valid @RequestBody SendMessageRequest body) {
        svc.send(requireUser(req), body);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/inbox")
    public List<Message> inbox(HttpServletRequest req) {
        return svc.inbox(requireUser(req));
    }

    @GetMapping("/outbox")
    public List<Message> outbox(HttpServletRequest req) {
        return svc.outbox(requireUser(req));
    }
}
