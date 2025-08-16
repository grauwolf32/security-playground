package app.security;

import app.model.Session;
import app.repo.SessionRepo;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Instant;
import java.util.Optional;

@Component
public class SessionFilter implements Filter {
    private final SessionRepo sessions;
    public static final String ATTR = "auth.ctx";

    public SessionFilter(SessionRepo sessions) { this.sessions = sessions; }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest req = (HttpServletRequest) request;
        String token = req.getHeader("X-Session-Id");
        if (token != null && !token.isBlank()) {
            Optional<Session> s = sessions.findById(token);
            if (s.isPresent() && s.get().getExpiredAt() != null &&
                s.get().getExpiredAt() > Instant.now().getEpochSecond()) {
                request.setAttribute(ATTR, new AuthContext(s.get().getUserId()));
            }
        }
        chain.doFilter(request, response);
    }
}
