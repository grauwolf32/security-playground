package app.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class SendMessageRequest {
    @NotNull
    private Integer toUserId;
    @NotBlank
    private String message;

    public SendMessageRequest() {}
    public SendMessageRequest(Integer toUserId, String message) { this.toUserId = toUserId; this.message = message; }
    public Integer getToUserId() { return toUserId; }
    public String getMessage() { return message; }
}