package app.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RegisterRequest {
    @NotBlank @Size(max = 256)
    private String name;
    @NotBlank @Size(max = 256)
    private String password;

    public RegisterRequest() {}
    public RegisterRequest(String name, String password) { this.name = name; this.password = password; }
    public String getName() { return name; }
    public String getPassword() { return password; }
}
