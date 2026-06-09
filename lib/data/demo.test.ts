import { describe, expect, it } from "vitest";
import { buildOscarView } from "./demo";
import { bandFor, changeDirection, crossedMcid, GENPUP_M } from "@/lib/domain/mobility";
import { DEFAULT_PROGRESSION } from "@/lib/domain/progression";
import { checkNonClinical } from "@/lib/domain/guardrails";

describe("buildOscarView — clinical figures come from lib/domain, not hardcoded", () => {
  const view = buildOscarView();
  const { mobility, progression } = view.dashboard;

  it("bands the current mobility score with the real banding function", () => {
    expect(mobility.band).toBe(bandFor(mobility.current));
    expect(mobility.band).toBe("mild"); // 34 is in the 28–54 band
  });

  it("derives improvement, MCID crossing and direction from the domain", () => {
    expect(mobility.improvement).toBe(mobility.baseline - mobility.current);
    expect(mobility.crossedMcid).toBe(crossedMcid(mobility.current, mobility.baseline));
    expect(mobility.crossedMcid).toBe(true); // 8-point change meets MCID
    expect(mobility.mcid).toBe(GENPUP_M.mcid);
    expect(mobility.direction).toBe(changeDirection(mobility.current, mobility.baseline));
    expect(mobility.direction).toBe("better");
  });

  it("only fires the progression nudge when the domain criteria are met", () => {
    expect(progression.fires).toBe(true);
    expect(progression.cleanSessions).toBe(DEFAULT_PROGRESSION.minCleanSessions);
  });

  it("the snapshot mobility figure agrees with the trend", () => {
    expect(view.brief.snapshot[0].value).toBe(String(mobility.current));
    expect(view.brief.band).toBe(mobility.band);
  });
});

describe("buildOscarView — every narrative line is non-clinical", () => {
  const view = buildOscarView();

  const narratives: string[] = [
    view.dashboard.pattern.lead,
    view.dashboard.pattern.vetFraming,
    view.dashboard.progression.question,
    view.checkin.insight.lead,
    view.checkin.insight.vetFraming,
    ...view.brief.mentions.map((m) => m.body),
  ];

  it.each(narratives)("passes the guardrail: %s", (text) => {
    expect(checkNonClinical(text).ok).toBe(true);
  });
});
