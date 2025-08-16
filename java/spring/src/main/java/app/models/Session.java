package app.models;

import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name = "sessions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Session {
    @Id
    @Column(length = 256)
    private String id; // токен

    private Integer userId;   // users.id
    private Long expiredAt;   // unix epoch seconds
}
