/**
 * The "contact your vet now" destination — the real home of the cardinal safety
 * affordance (VetLine routes here). This screen ROUTES the owner to their vet and
 * shows REFERENCE material from the vet's own recovery plan. It is calm guidance,
 * not an alarm, and it NEVER diagnoses, grades, or judges the pet's current state —
 * Goldvale helps the owner reach the people who decide what's urgent.
 *
 * Server component: no client state. The danger colour appears only on the call-to-
 * action accent, consistent with VetLine being the one place it lives.
 */
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { SectionHead } from "@/components/ui/SectionHead";
import { Ico } from "@/components/ui/icons";
import { A, C } from "@/components/ui/tokens";
import { telHref } from "@/lib/data/vet-contact";

const MAPS_EMERGENCY_URL =
  "https://www.google.com/maps/search/?api=1&query=emergency+vet+near+me";

export function VetContactScreen({
  petId,
  petName,
  clinic,
  phone,
  vetName,
  reasons,
}: {
  petId: string;
  petName: string;
  clinic: string | null;
  phone: string | null;
  vetName: string | null;
  reasons: { label: string; guidance: string }[];
}) {
  const tel = telHref(phone);
  const callLabel = `Call ${clinic ?? "your vet"}`;

  return (
    <main
      className="gv-scroll"
      style={{
        width: "100%", maxWidth: 440, margin: "0 auto", minHeight: "100dvh",
        display: "flex", flexDirection: "column", padding: "20px 16px 28px",
      }}
    >
      {/* back chevron */}
      <Link
        href={`/pets/${petId}`}
        aria-label={`Back to ${petName}`}
        style={{
          width: 34, height: 34, borderRadius: 999, border: `1px solid ${C.hair}`,
          background: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, textDecoration: "none", marginBottom: 18,
        }}
      >
        {Ico.chevL({ s: 17, c: C.charcoal })}
      </Link>

      {/* reassuring header */}
      <div style={{ padding: "0 2px" }}>
        <div style={{ fontFamily: "var(--serif)", fontSize: 27, fontWeight: 500, letterSpacing: -0.5, lineHeight: 1.12 }}>
          Contact your vet
        </div>
        <div style={{ fontSize: 14, color: "#4a544f", marginTop: 10, lineHeight: 1.55 }}>
          You know {petName} best. When something feels off, your vet would always rather
          hear from you than not.
        </div>
      </div>

      {/* primary action card */}
      <Card style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 12 }}>
        {tel ? (
          <a
            href={tel}
            aria-label={`${callLabel}${phone ? ` at ${phone}` : ""}`}
            style={{
              display: "flex", alignItems: "center", gap: 13, textDecoration: "none",
              padding: "15px 16px", borderRadius: 15, border: `1.5px solid ${C.danger}`,
              background: "rgba(192,73,43,0.06)",
            }}
          >
            <div
              style={{
                width: 42, height: 42, borderRadius: 12, flexShrink: 0, background: C.danger,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              {Ico.phone({ s: 20, c: "#fff" })}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15.5, fontWeight: 700, color: C.danger, letterSpacing: -0.2 }}>{callLabel}</div>
              <div style={{ fontSize: 13, color: "#7a4536", marginTop: 2, fontVariantNumeric: "tabular-nums" }}>{phone}</div>
            </div>
            {Ico.chevR({ s: 18, c: C.danger })}
          </a>
        ) : (
          <a
            href={MAPS_EMERGENCY_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex", alignItems: "center", gap: 13, textDecoration: "none",
              padding: "15px 16px", borderRadius: 15, border: `1.5px solid ${C.danger}`,
              background: "rgba(192,73,43,0.06)",
            }}
          >
            <div
              style={{
                width: 42, height: 42, borderRadius: 12, flexShrink: 0, background: C.danger,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              {Ico.alert({ s: 20, c: "#fff" })}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15.5, fontWeight: 700, color: C.danger, letterSpacing: -0.2 }}>Find an emergency vet near you</div>
              <div style={{ fontSize: 13, color: "#7a4536", marginTop: 2 }}>Opens a map of nearby clinics</div>
            </div>
            {Ico.chevR({ s: 18, c: C.danger })}
          </a>
        )}

        {/* always offer the maps fallback as a secondary option */}
        {tel && (
          <a
            href={MAPS_EMERGENCY_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex", alignItems: "center", gap: 11, textDecoration: "none",
              padding: "12px 14px", borderRadius: 13, border: `1px solid ${C.hair}`, background: C.field,
            }}
          >
            <span style={{ color: C.muted, flexShrink: 0 }}>{Ico.home({ s: 17, c: C.muted })}</span>
            <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600, color: "#4a544f" }}>
              Away from home? Find an emergency vet near you
            </span>
            {Ico.chevR({ s: 16, c: C.mutedSoft })}
          </a>
        )}

        {vetName && (
          <div style={{ fontSize: 12.5, color: C.muted, paddingTop: 1 }}>
            Your vet: <strong style={{ color: C.charcoal, fontWeight: 650 }}>{vetName}</strong>
          </div>
        )}
      </Card>

      {/* reasons card — reference from the vet's recovery plan */}
      <Card style={{ marginTop: 14 }}>
        {reasons.length > 0 ? (
          <>
            <SectionHead
              icon={Ico.flag({ s: 18, c: A.clay.c })}
              accent={A.clay}
              title="Reasons people call right away"
            />
            <div style={{ fontSize: 12.5, color: C.muted, marginTop: -4, marginBottom: 14, lineHeight: 1.5 }}>
              A reference from {petName}&rsquo;s recovery plan, shared by your vet. You don&rsquo;t need to be
              sure — that&rsquo;s what the call is for.
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {reasons.map((r, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex", gap: 11, alignItems: "flex-start",
                    background: C.field, border: `1px solid ${C.hairSoft}`, borderRadius: 13, padding: "12px 13px",
                  }}
                >
                  <span style={{ color: A.clay.c, flexShrink: 0, marginTop: 1 }}>{Ico.alert({ s: 16, c: A.clay.c })}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 650, color: C.charcoal, lineHeight: 1.4 }}>{r.label}</div>
                    <div style={{ fontSize: 12.5, color: C.muted, marginTop: 2, lineHeight: 1.45 }}>{r.guidance}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
            <span style={{ color: A.sage.c, flexShrink: 0, marginTop: 1 }}>{Ico.heart({ s: 18, c: A.sage.c })}</span>
            <div style={{ fontSize: 13.5, color: "#4a544f", lineHeight: 1.55 }}>
              Trust your instincts — sudden changes in comfort, movement, appetite, or toileting are always
              worth a call.
            </div>
          </div>
        )}
      </Card>

      <div style={{ flex: 1, minHeight: 16 }} />

      {/* non-clinical footer (mirrors the onboarding shield notes) */}
      <div
        style={{
          display: "flex", gap: 10, alignItems: "flex-start", background: C.field,
          border: `1px solid ${C.hairSoft}`, borderRadius: 14, padding: "13px 14px", margin: "16px 2px 0",
        }}
      >
        <span style={{ color: C.sage, flexShrink: 0, marginTop: 1 }}>{Ico.shield({ s: 17, c: C.sage })}</span>
        <div style={{ fontSize: 12.5, color: "#42504b", lineHeight: 1.5 }}>
          Goldvale doesn&rsquo;t diagnose or decide what&rsquo;s urgent — it helps you reach the people who do.
        </div>
      </div>
    </main>
  );
}
