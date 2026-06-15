/**
 * Pattern-memory recall surface — "days like this". The pgvector kNN payoff made
 * visible: Goldvale embeds the surfaced pattern and finds the owner's own past
 * journal days that resemble it *by meaning*, then frames them for the vet.
 *
 * Non-clinical: this is RECALL of what the owner logged — it ranks similarity, it
 * never interprets, grades, or diagnoses.
 */
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Hero } from "@/components/ui/Hero";
import { VetLine } from "@/components/ui/VetLine";
import { Ico } from "@/components/ui/icons";
import { C } from "@/components/ui/tokens";
import type { JournalAnalogue } from "@/lib/data/queries";
import type { PatternMemory, PetHeader } from "@/lib/data/view";

export function RecallScreen({
  header,
  pattern,
  analogues,
  query,
}: {
  header: PetHeader;
  pattern: PatternMemory;
  analogues: JournalAnalogue[];
  query: string;
}) {
  return (
    <main className="gv-scroll" style={{ width: "100%", maxWidth: 440, margin: "0 auto", padding: "24px 16px 32px" }}>
      <Hero
        avatarSrc={header.photoUrl}
        avatarAlt={header.name}
        eyebrow="Pattern memory"
        title="Days like this"
        badge={<>{Ico.sparkles({ s: 12, c: "#fff" })} kNN</>}
      >
        <div
          style={{
            position: "relative",
            marginTop: 14,
            background: "rgba(255,255,255,0.14)",
            borderRadius: 13,
            padding: "10px 12px",
            border: "1px solid rgba(255,255,255,0.16)",
            fontSize: 12.5,
            lineHeight: 1.4,
            color: "rgba(255,255,255,0.94)",
          }}
        >
          {pattern.lead} <strong style={{ fontWeight: 700 }}>{pattern.emphasis}</strong>. Goldvale matched the days{" "}
          {header.name} logged that resemble this — by meaning, not keywords.
        </div>
      </Hero>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
            <span style={{ display: "flex", color: C.sage }}>{Ico.sparkles({ s: 15, c: C.sage })}</span>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase", color: C.sage }}>
              Most similar days
            </span>
          </div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 14, lineHeight: 1.45 }}>
            Searched for &ldquo;{query}&rdquo; across {header.name}&rsquo;s journal.
          </div>

          {analogues.length === 0 ? (
            <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.5 }}>
              No journal days to compare yet — they&rsquo;ll appear here as notes are added.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {analogues.map((a, i) => {
                const pct = Math.round(a.similarity * 100);
                return (
                  <div
                    key={i}
                    style={{
                      background: C.field,
                      border: `1px solid ${C.hairSoft}`,
                      borderRadius: 13,
                      padding: "12px 13px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: C.charcoal, fontVariantNumeric: "tabular-nums" }}>
                        {a.date}
                      </span>
                      <div style={{ flex: 1 }} />
                      <span style={{ fontSize: 11, fontWeight: 700, color: C.sage, fontVariantNumeric: "tabular-nums" }}>
                        {pct}% match
                      </span>
                    </div>
                    <div style={{ height: 5, borderRadius: 999, background: "#e3e8e5", overflow: "hidden", marginBottom: 9 }}>
                      <div style={{ width: `${pct}%`, height: "100%", borderRadius: 999, background: C.sage, opacity: 0.7 }} />
                    </div>
                    <div style={{ fontSize: 13, color: "#3c453f", lineHeight: 1.5 }}>{a.text}</div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <div style={{ fontSize: 11.5, color: C.muted, textAlign: "center", lineHeight: 1.5, padding: "2px 14px" }}>
          {pattern.vetFraming} These are {header.name}&rsquo;s own notes, surfaced for your vet — not a diagnosis.
        </div>

        <Link
          href={`/pets/${header.id}`}
          className="gv-press"
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: 13,
            border: `1px solid ${C.hair}`,
            background: "#fff",
            color: C.charcoal,
            fontSize: 13.5,
            fontWeight: 650,
            textAlign: "center",
            textDecoration: "none",
          }}
        >
          Back to {header.name}&rsquo;s dashboard
        </Link>
        <VetLine petId={header.id} />
        <div style={{ height: 6 }} />
      </div>
    </main>
  );
}
