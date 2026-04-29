import { db } from "../connection";
import { User } from "../../types/models";

export const usersRepo = {
  byId(id: number): User | undefined {
    return db.prepare("SELECT * FROM users WHERE id = ?").get(id) as
      | User
      | undefined;
  },

  byEmail(email: string): User | undefined {
    return db.prepare("SELECT * FROM users WHERE email = ?").get(email) as
      | User
      | undefined;
  },

  insert(input: {
    email: string;
    displayName: string;
    phone: string | null;
    passwordHash: string;
    totpSecret: string | null;
  }): User {
    const info = db
      .prepare(
        "INSERT INTO users (email, display_name, phone, password_hash, totp_secret) VALUES (?, ?, ?, ?, ?)",
      )
      .run(
        input.email,
        input.displayName,
        input.phone,
        input.passwordHash,
        input.totpSecret,
      );
    return this.byId(Number(info.lastInsertRowid))!;
  },

  list(): User[] {
    return db.prepare("SELECT * FROM users ORDER BY id").all() as User[];
  },
};
