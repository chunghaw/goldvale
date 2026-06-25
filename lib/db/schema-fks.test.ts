import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Lock the foreign keys we just added on exercise_session_events into the two
 * canonical sources. If anyone reverts these accidentally, the test fails.
 */
const repo = join(__dirname, "..", "..");
const sql = readFileSync(join(repo, "db", "schema.sql"), "utf8");
const ts = readFileSync(join(repo, "lib", "db", "schema.ts"), "utf8");
const migration = readFileSync(join(repo, "scripts", "migrate-fk-sessions.ts"), "utf8");

describe("exercise_session_events — FK constraints (relational integrity for partitioned events)", () => {
  it("db/schema.sql declares pet_id REFERENCES pets ON DELETE CASCADE", () => {
    // single-line tolerant: collapse whitespace then look for the canonical fragment
    const flat = sql.replace(/\s+/g, " ");
    expect(flat).toContain("pet_id uuid NOT NULL REFERENCES pets(id) ON DELETE CASCADE");
  });

  it("db/schema.sql declares exercise_id REFERENCES exercises ON DELETE RESTRICT", () => {
    const flat = sql.replace(/\s+/g, " ");
    expect(flat).toContain("exercise_id text NOT NULL REFERENCES exercises(id) ON DELETE RESTRICT");
  });

  it("lib/db/schema.ts mirrors the FKs (cascade for pet, restrict for exercise)", () => {
    const flat = ts.replace(/\s+/g, " ");
    expect(flat).toMatch(/petId: uuid\("pet_id"\)\.notNull\(\)\.references\(\(\) => pets\.id, \{ onDelete: "cascade" \}\)/);
    expect(flat).toMatch(/exerciseId: text\("exercise_id"\)\.notNull\(\)\.references\(\(\) => exercises\.id, \{ onDelete: "restrict" \}\)/);
  });

  it("scripts/migrate-fk-sessions.ts adds both constraints with the matching ON DELETE rules", () => {
    expect(migration).toContain("FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE");
    expect(migration).toContain("FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE RESTRICT");
    // idempotency guard — the DO/EXCEPTION pattern lets us re-run safely
    expect(migration).toContain("duplicate_object");
  });
});
