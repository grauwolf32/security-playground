import { db } from "../connection";
import { AuditEntry } from "../../types/models";

export const auditRepo = {
  log(userId: number | null, action: string, details: string): void {
    db.prepare(
      "INSERT INTO audit_entries (user_id, action, details) VALUES (?, ?, ?)",
    ).run(userId, action, details);
  },

  recent(limit: number = 200): AuditEntry[] {
    return db
      .prepare(
        "SELECT * FROM audit_entries ORDER BY id DESC LIMIT ?",
      )
      .all(limit) as AuditEntry[];
  },
};
