package app.security;

public class AuthContext {
    private final Integer userId;
    public AuthContext(Integer userId) { this.userId = userId; }
    public Integer getUserId() { return userId; }
}
