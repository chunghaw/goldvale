/**
 * Materialized-view refresh helper for the check-in write path.
 *
 * `adherence_rollup_mv` and `rolling_baseline_mv` derive from the time-series
 * tables a check-in writes to. Without a refresh, the dashboard's "this week"
 * adherence + MCID-crossing flag stay stuck on whatever the last bulk seed
 * produced. CONCURRENTLY is safe here — both views have the UNIQUE index it
 * requires (`db/schema.sql:311,322`).
 *
 * Failures are SWALLOWED with a warn: a stale rollup is fine, but the check-in
 * write that just succeeded must never be lost to a refresh hiccup (lock
 * contention, transient pool error, etc.).
 */
import { sql, type SQL } from "drizzle-orm";

/** Minimum surface a refresh-capable client needs — anything Drizzle-shaped fits. */
export interface MaterializedViewRefresher {
  execute(query: SQL): Promise<unknown>;
}

const REFRESHES: { name: string; query: SQL }[] = [
  { name: "adherence_rollup_mv", query: sql`REFRESH MATERIALIZED VIEW CONCURRENTLY adherence_rollup_mv` },
  { name: "rolling_baseline_mv", query: sql`REFRESH MATERIALIZED VIEW CONCURRENTLY rolling_baseline_mv` },
];

/**
 * Best-effort refresh of both check-in-derived materialized views. Resolves on
 * partial success; one view's failure does not block the other.
 */
export async function refreshCheckinViews(db: MaterializedViewRefresher): Promise<void> {
  for (const { name, query } of REFRESHES) {
    try {
      await db.execute(query);
    } catch (err) {
      // never throw — a stale rollup is recoverable; a lost check-in is not.
      const reason = err instanceof Error ? err.message : String(err);
      console.warn(`[checkin] materialized view refresh skipped for ${name}:`, reason);
    }
  }
}
