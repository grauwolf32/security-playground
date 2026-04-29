import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const DATA_DIR = path.join(__dirname, "..", "..", "data");
const DB_PATH = path.join(DATA_DIR, "vault-pay.db");
const SCHEMA_PATH = path.join(__dirname, "schema.sql");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

export function applyMigrations(): void {
  const sql = fs.readFileSync(SCHEMA_PATH, "utf-8");
  db.exec(sql);
}
