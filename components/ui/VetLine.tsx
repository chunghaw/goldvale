/**
 * The bounded "contact your vet now" element — the ONLY place the danger colour
 * appears. Red flags route here; Goldvale never makes the judgement itself
 * (lib/domain/guardrails.ts). Rendered as a plain link so it works in server
 * components; routes to the real /pets/[id]/vet-contact escalation screen.
 */
import { C } from "./tokens";

export function VetLine({
  petId,
  href,
  paddingTop = 6,
}: {
  petId: string;
  href?: string;
  paddingTop?: number;
}) {
  return (
    <div
      style={{
        textAlign: "center",
        fontSize: 12,
        color: C.muted,
        padding: `${paddingTop}px 0 2px`,
        lineHeight: 1.5,
      }}
    >
      Noticed something worrying?{" "}
      <a
        href={href ?? `/pets/${petId}/vet-contact`}
        style={{
          color: C.danger,
          fontWeight: 650,
          textDecoration: "underline",
          textUnderlineOffset: 2,
          cursor: "pointer",
        }}
      >
        Contact your vet now
      </a>
    </div>
  );
}
