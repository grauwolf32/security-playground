package demo.web;

import demo.dto.SendMessageRequest;
import demo.model.Message;
import demo.security.AuthContext;
import demo.security.SessionFilter;
import demo.service.MessageService;
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
        return ctx.userId();
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
