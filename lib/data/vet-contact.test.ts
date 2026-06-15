import { describe, it, expect } from "vitest";
import { telHref } from "./vet-contact";

describe("telHref", () => {
  it("keeps a leading + and strips spaces", () => {
    expect(telHref("+61 2 9555 0142")).toBe("tel:+61295550142");
  });

  it("returns null for null", () => {
    expect(telHref(null)).toBeNull();
  });

  it("strips parens and dashes (no leading +)", () => {
    expect(telHref("(02) 9555 0142")).toBe("tel:0295550142");
  });

  it("returns null for an empty string", () => {
    expect(telHref("")).toBeNull();
  });

  it("returns null when there are no digits", () => {
    expect(telHref("call us")).toBeNull();
  });

  it("drops a + that is not leading", () => {
    expect(telHref("02-9555-0142")).toBe("tel:0295550142");
  });
});
