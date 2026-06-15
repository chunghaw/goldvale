/**
 * The "contact your vet now" escalation destination — the data behind the cardinal
 * safety affordance. This layer ROUTES the owner to their vet and surfaces REFERENCE
 * material (the vet-supplied red-flag rows for the pet's protocol). It never assesses,
 * grades, or judges the pet's current state — Goldvale doesn't decide what's urgent.
 *
 * Pure helper (telHref) is unit-tested; getVetContact is a thin relational read.
 */
import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import {
  pets, owners, exercisePlans, protocolInstances, redFlagRules,
} from "@/lib/db/schema";

export interface VetContact {
  petName: string;
  clinic: string | null;
  phone: string | null;
  vetName: string | null;
  reasons: { label: string; guidance: string }[];
}

/**
 * Build a dialable `tel:` href from a free-text phone string. Keeps a single leading
 * "+" (country code) and digits; drops spaces, parens, dashes, and any other noise.
 * Returns null when there are no usable digits.
 */
export function telHref(phone: string | null): string | null {
  if (!phone) return null;
  const hasPlus = phone.trim().startsWith("+");
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  return `tel:${hasPlus ? "+" : ""}${digits}`;
}

/**
 * Resolve the escalation context for a pet: their owner's vet clinic + phone, the
 * prescriber on the most recent active plan, and the red-flag reference rows for the
 * pet's active protocol (empty when the pet has no protocol). Returns null if the pet
 * doesn't exist (the route turns that into notFound).
 */
export async function getVetContact(petId: string): Promise<VetContact | null> {
  const db = getDb();

  const [row] = await db
    .select({
      petName: pets.name,
      clinic: owners.vetClinic,
      phone: owners.vetPhone,
    })
    .from(pets)
    .innerJoin(owners, eq(owners.id, pets.ownerId))
    .where(eq(pets.id, petId))
    .limit(1);

  if (!row) return null;

  const [plan] = await db
    .select({ prescriberName: exercisePlans.prescriberName })
    .from(exercisePlans)
    .where(and(eq(exercisePlans.petId, petId), eq(exercisePlans.status, "active")))
    .orderBy(desc(exercisePlans.createdAt))
    .limit(1);

  const [protocol] = await db
    .select({ templateId: protocolInstances.templateId })
    .from(protocolInstances)
    .where(and(eq(protocolInstances.petId, petId), eq(protocolInstances.status, "active")))
    .orderBy(desc(protocolInstances.onsetDate))
    .limit(1);

  const reasons = protocol
    ? await db
        .select({ label: redFlagRules.label, guidance: redFlagRules.guidance })
        .from(redFlagRules)
        .where(eq(redFlagRules.templateId, protocol.templateId))
    : [];

  return {
    petName: row.petName,
    clinic: row.clinic,
    phone: row.phone,
    vetName: plan?.prescriberName ?? null,
    reasons,
  };
}
