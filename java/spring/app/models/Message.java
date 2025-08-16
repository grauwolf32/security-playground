package app.model;

import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name = "messages")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Message {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // В целях простоты — FK числом, без каскадов
    private Integer sender;   // users.id
    private Integer receiver; // users.id

    @Lob
    private String message;
}
