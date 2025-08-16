package app.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.*;

@Entity @Table(name = "users")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Size(max = 256)
    @Column(unique = true)
    private String name;

    // Храним BCRYPT-хеш
    @Size(max = 256)
    private String password;
}
