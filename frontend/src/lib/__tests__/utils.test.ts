import { describe, it, expect } from "vitest";
import { cn, banglaNumber, formatDateBn, sanitizeRedirectPath } from "../utils";

describe("Utility functions", () => {
  describe("cn helper", () => {
    it("merges tailwind classes properly with overrides", () => {
      expect(cn("px-2 py-1", "bg-black", { "text-white": true })).toBe("px-2 py-1 bg-black text-white");
      expect(cn("px-2", "px-4")).toBe("px-4");
      expect(cn("text-red-500", undefined, null, false, "text-blue-500")).toBe("text-blue-500");
    });
  });

  describe("banglaNumber numeral converter", () => {
    it("converts digits to Bengali numerals correctly", () => {
      expect(banglaNumber("1234567890")).toBe("১২৩৪৫৬৭৮৯০");
      expect(banglaNumber(24)).toBe("২৪");
      expect(banglaNumber(161)).toBe("১৬১");
      expect(banglaNumber("Batch 90, Session 12")).toBe("Batch ৯০, Session ১২");
    });

    it("handles zero and negative numbers", () => {
      expect(banglaNumber(0)).toBe("০");
      expect(banglaNumber(-5)).toBe("-৫");
    });
  });

  describe("formatDateBn date formatter", () => {
    it("formats ISO string dates into Bengali date format", () => {
      const formatted = formatDateBn("2024-05-15T12:00:00Z");
      expect(formatted).toContain("২০২৪");
    });

    it("handles Date object directly", () => {
      const formatted = formatDateBn(new Date(2024, 0, 1));
      expect(formatted).toContain("২০২৪");
    });

    it("returns empty string gracefully for invalid date strings", () => {
      expect(formatDateBn("not-a-valid-date")).toBe("");
    });
  });

  describe("sanitizeRedirectPath security defense", () => {
    it("allows valid relative internal paths", () => {
      expect(sanitizeRedirectPath("/feed")).toBe("/feed");
      expect(sanitizeRedirectPath("/sessions/day-1")).toBe("/sessions/day-1");
      expect(sanitizeRedirectPath("/profile?tab=security")).toBe("/profile?tab=security");
      expect(sanitizeRedirectPath("/admin/sessions")).toBe("/admin/sessions");
    });

    it("blocks absolute URL open redirects and malicious protocols", () => {
      expect(sanitizeRedirectPath("https://evil.com")).toBe("/feed");
      expect(sanitizeRedirectPath("http://attacker.com/login")).toBe("/feed");
      expect(sanitizeRedirectPath("//evil.com")).toBe("/feed");
      expect(sanitizeRedirectPath("///evil.com")).toBe("/feed");
      expect(sanitizeRedirectPath("javascript:alert(1)")).toBe("/feed");
      expect(sanitizeRedirectPath("data:text/html,<script>alert(1)</script>")).toBe("/feed");
    });

    it("handles null, undefined, or empty path fallbacks", () => {
      expect(sanitizeRedirectPath(null)).toBe("/feed");
      expect(sanitizeRedirectPath(undefined)).toBe("/feed");
      expect(sanitizeRedirectPath("")).toBe("/feed");
      expect(sanitizeRedirectPath("", "/login")).toBe("/login");
    });
  });
});
