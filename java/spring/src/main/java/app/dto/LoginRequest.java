package app.dto;

import jakarta.validation.constraints.NotBlank;

public class LoginRequest {
    @NotBlank
    private String name;
    @NotBlank
    private String password;

    public LoginRequest() {}
    public LoginRequest(String name, String password) { this.name = name; this.password = password; }
    public String getName() { return name; }
    public String getPassword() { return password; }
}
