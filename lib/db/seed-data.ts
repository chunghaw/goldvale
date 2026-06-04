/**
 * Seed data — the scale registry, exercise library, environmental modifications,
 * and condition protocols. Grounded in open sources (WSAVA/AAHA, AKC/CARE, open
 * TPLO/IVDD protocols). GenPup-M item wording loads separately from the CC-BY S2
 * supplementary; here we register the instrument + licensing only (no fabricated
 * clinical item text, and no reproduction of license-gated forms).
 */
import type { InferInsertModel } from "drizzle-orm";
import {
  scaleInstruments, exercises, modificationTypes,
  protocolTemplates, protocolPhases, redFlagRules,
} from "./schema";

export const SCALE_INSTRUMENTS: InferInsertModel<typeof scaleInstruments>[] = [
  { id: "genpup_m", displayName: "GenPup-M (canine mobility)", species: ["dog"], itemCount: 24, license: "embeddable", mcid: "8", sourceUrl: "https://doi.org/10.1371/journal.pone.0291911" },
  { id: "hcpi", displayName: "Helsinki Chronic Pain Index", species: ["dog"], itemCount: 11, license: "embeddable", mcid: null, sourceUrl: null },
  { id: "load", displayName: "Liverpool Osteoarthritis in Dogs", species: ["dog"], itemCount: 13, license: "vet_administered", mcid: "4", sourceUrl: null },
  { id: "cbpi", displayName: "Canine Brief Pain Inventory", species: ["dog"], itemCount: 10, license: "vet_administered", mcid: null, sourceUrl: null },
  { id: "fmpi", displayName: "Feline Musculoskeletal Pain Index", species: ["cat"], itemCount: 17, license: "gated", mcid: null, sourceUrl: null },
  { id: "bcs", displayName: "Body Condition Score (9-pt)", species: ["dog", "cat"], itemCount: 1, license: "embeddable", mcid: null, sourceUrl: null },
  { id: "mcs", displayName: "Muscle Condition Score", species: ["dog", "cat"], itemCount: 1, license: "embeddable", mcid: null, sourceUrl: null },
];

// Controlled vocabulary. howtoUrl left null until the open-reference cards (AKC
// cavaletti guide, CARE therapeutic-exercise principles) are attached.
export const EXERCISES: InferInsertModel<typeof exercises>[] = [
  { id: "sit_to_stand", displayName: "Sit-to-stand", species: ["dog", "cat"], defaultFitt: { sets: 3, reps: 5 }, isActiveExercise: true },
  { id: "weight_shift", displayName: "Weight shifts", species: ["dog", "cat"], defaultFitt: { sets: 2, reps: 8 }, isActiveExercise: true },
  { id: "cookie_stretch", displayName: "Cookie (lateral-flexion) stretch", species: ["dog"], defaultFitt: { sets: 1, reps: 5 }, isActiveExercise: true },
  { id: "three_leg_stand", displayName: "Three-leg stand", species: ["dog"], defaultFitt: { sets: 2, holdSec: 5 }, isActiveExercise: true },
  { id: "cavaletti", displayName: "Cavaletti rails", species: ["dog"], defaultFitt: { passes: 3 }, isActiveExercise: true },
  { id: "leash_walk", displayName: "Controlled leash walk", species: ["dog"], defaultFitt: { minutes: 5 }, isActiveExercise: true },
  { id: "balance_pad", displayName: "Balance-pad work", species: ["dog"], defaultFitt: { holdSec: 10 }, isActiveExercise: true },
  { id: "prom", displayName: "Passive range-of-motion (PROM)", species: ["dog", "cat"], defaultFitt: { reps: 10 }, isActiveExercise: false },
];

export const MODIFICATION_TYPES: InferInsertModel<typeof modificationTypes>[] = [
  { id: "non_slip_mat", displayName: "Non-slip mats / rugs", rationale: "Traction reduces slips and fall risk on hard floors." },
  { id: "ramp", displayName: "Ramps & steps (no jumping)", rationale: "Avoids high-impact jumps onto/off furniture or into the car." },
  { id: "raised_bowl", displayName: "Raised food & water bowls", rationale: "Reduces neck and joint strain while eating." },
  { id: "ortho_bed", displayName: "Orthopedic bedding", rationale: "Cushions joints and supports comfortable rest." },
  { id: "traction_path", displayName: "Clear traction path", rationale: "A continuous non-slip route to food, water, and the door." },
];

export const PROTOCOL_TEMPLATES: InferInsertModel<typeof protocolTemplates>[] = [
  { id: "tplo_post_op", displayName: "TPLO / cruciate post-op recovery", species: ["dog"] },
  { id: "ivdd_conservative", displayName: "IVDD / neuro conservative recovery", species: ["dog"] },
];

export const PROTOCOL_PHASES: InferInsertModel<typeof protocolPhases>[] = [
  { templateId: "tplo_post_op", weekFrom: 0, weekTo: 2, activities: { confinement: "strict", leashWalks: "5-min, elimination only", cryotherapy: "15-20 min, 2-3x/day", prom: "bicycle 10 reps 3x/day if instructed" }, milestone: null },
  { templateId: "tplo_post_op", weekFrom: 2, weekTo: 4, activities: { thermo: "switch ice→heat after 3-5 days", leashWalks: "gradual increase", add: ["weight_shift", "sit_to_stand"] }, milestone: null },
  { templateId: "tplo_post_op", weekFrom: 4, weekTo: 8, activities: { leashWalks: "build to 15-20 min by week 8" }, milestone: "8-week radiograph gates off-leash activity" },
  { templateId: "ivdd_conservative", weekFrom: 0, weekTo: 2, activities: { confinement: "strict crate rest", support: "sling/towel-supported standing", massage: "gentle limb massage 2x/day", prom: "if instructed" }, milestone: null },
  { templateId: "ivdd_conservative", weekFrom: 2, weekTo: 6, activities: { balance: "gentle weight-shifting", proprioception: "controlled", walks: "very short, supported" }, milestone: null },
];

export const RED_FLAG_RULES: InferInsertModel<typeof redFlagRules>[] = [
  { templateId: "tplo_post_op", label: "Sudden lameness after a period of improvement", guidance: "Contact your vet now." },
  { templateId: "tplo_post_op", label: "Swelling, heat, or discharge/odor at the incision", guidance: "Contact your vet now." },
  { templateId: "tplo_post_op", label: "Clicking sound in the knee", guidance: "Contact your vet now." },
  { templateId: "ivdd_conservative", label: "Sudden worsening of weakness or coordination", guidance: "Contact your vet now." },
  { templateId: "ivdd_conservative", label: "New or complete loss of deep pain sensation", guidance: "This is an emergency — contact your vet now." },
  { templateId: "ivdd_conservative", label: "Unable to urinate", guidance: "This is an emergency — contact your vet now." },
];
