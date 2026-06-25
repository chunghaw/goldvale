import { describe, expect, it, vi, afterEach } from "vitest";
import { refreshCheckinViews } from "./refresh-mv";
import type { SQL } from "drizzle-orm";

afterEach(() => vi.restoreAllMocks());

describe("refreshCheckinViews — non-fatal CONCURRENTLY refresh of both check-in MVs", () => {
  it("refreshes both adherence + baseline materialized views", async () => {
    const captured: SQL[] = [];
    const db = { execute: vi.fn(async (q: SQL) => { captured.push(q); }) };
    await refreshCheckinViews(db);

    expect(db.execute).toHaveBeenCalledTimes(2);
    // drizzle SQL fragments expose their literal chunks; inspect them so the
    // test breaks if someone swaps in the wrong view name or drops CONCURRENTLY.
    const sqlText = captured.map((q) => JSON.stringify(q)).join("\n");
    expect(sqlText).toContain("CONCURRENTLY adherence_rollup_mv");
    expect(sqlText).toContain("CONCURRENTLY rolling_baseline_mv");
  });

  it("swallows a refresh failure — the caller's write must never be lost", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const db = {
      execute: vi.fn()
        .mockRejectedValueOnce(new Error("PG: could not acquire lock"))
        .mockResolvedValueOnce(undefined),
    };

    await expect(refreshCheckinViews(db)).resolves.toBeUndefined();
    // both views attempted even though the first one threw
    expect(db.execute).toHaveBeenCalledTimes(2);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]?.[0]).toMatch(/adherence_rollup_mv/);
  });

  it("swallows failures on BOTH refreshes without throwing", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const db = { execute: vi.fn().mockRejectedValue(new Error("transient")) };
    await expect(refreshCheckinViews(db)).resolves.toBeUndefined();
    expect(db.execute).toHaveBeenCalledTimes(2);
  });
});
