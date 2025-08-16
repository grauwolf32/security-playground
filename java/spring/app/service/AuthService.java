package app.service;

import app.dto.LoginRequest;
import app.dto.RegisterRequest;
import app.dto.TokenResponse;
import app.model.Session;
import app.model.User;
import app.repo.SessionRepo;
import app.repo.UserRepo;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;

@Service
public class AuthService {
    private final UserRepo users;
    private final SessionRepo sessions;
    private final SecureRandom rnd = new SecureRandom();

    public AuthService(UserRepo users, SessionRepo sessions) {
        this.users = users; this.sessions = sessions;
    }

    public void register(RegisterRequest req) {
        users.findByName(req.name()).ifPresent(u -> {
            throw new IllegalArgumentException("User already exists");
        });
        String hash = BCrypt.hashpw(req.password(), BCrypt.gensalt());
        users.save(User.builder().name(req.name()).password(hash).build());
    }

    public TokenResponse login(LoginRequest req) {
        User u = users.findByName(req.name())
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));
        if (!BCrypt.checkpw(req.password(), u.getPassword())) {
            throw new IllegalArgumentException("Invalid credentials");
        }
        String token = generateToken();
        long ttl = Instant.now().plusSeconds(60 * 60 * 12).getEpochSecond(); // 12h
        sessions.save(Session.builder().id(token).userId(u.getId()).expiredAt(ttl).build());
        return new TokenResponse(token);
    }

    private String generateToken() {
        byte[] b = new byte[24];
        rnd.nextBytes(b);
        return java.util.Base64.getUrlEncoder().withoutPadding().encodeToString(b);
    }
}
