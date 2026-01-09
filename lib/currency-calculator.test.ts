import { describe, it, expect } from "vitest";
import {
  convertNewToOld,
  convertOldToNew,
  calculateChange,
  formatNumber,
  validateInput,
} from "./currency-calculator";

describe("Currency Calculator", () => {
  describe("convertNewToOld", () => {
    it("should convert 1 new to 100 old", () => {
      expect(convertNewToOld(1)).toBe(100);
    });

    it("should convert 215 new to 21500 old", () => {
      expect(convertNewToOld(215)).toBe(21500);
    });

    it("should convert 10 new to 1000 old", () => {
      expect(convertNewToOld(10)).toBe(1000);
    });

    it("should handle zero", () => {
      expect(convertNewToOld(0)).toBe(0);
    });

    it("should handle large numbers", () => {
      expect(convertNewToOld(5000)).toBe(500000);
    });
  });

  describe("convertOldToNew", () => {
    it("should convert 100 old to 1 new", () => {
      expect(convertOldToNew(100)).toBe(1);
    });

    it("should convert 21500 old to 215 new", () => {
      expect(convertOldToNew(21500)).toBe(215);
    });

    it("should convert 1000 old to 10 new", () => {
      expect(convertOldToNew(1000)).toBe(10);
    });

    it("should handle zero", () => {
      expect(convertOldToNew(0)).toBe(0);
    });

    it("should round correctly", () => {
      expect(convertOldToNew(150)).toBe(2); // 150/100 = 1.5, rounds to 2
    });
  });

  describe("calculateChange", () => {
    it("should return null when paid less than price", () => {
      const result = calculateChange(215, 20000); // 215 new = 21500 old, paid 20000
      expect(result).toBeNull();
    });

    it("should calculate change correctly - example from requirements", () => {
      // Price: 215 new (21500 old)
      // Paid: 22000 old
      // Change: 500 old (5 new)
      const result = calculateChange(215, 22000);
      expect(result).not.toBeNull();
      expect(result?.oldCurrency).toBe(500);
      expect(result?.newCurrency).toBe(5);
    });

    it("should return zero change when exact amount paid", () => {
      const result = calculateChange(215, 21500);
      expect(result).not.toBeNull();
      expect(result?.oldCurrency).toBe(0);
      expect(result?.newCurrency).toBe(0);
    });

    it("should generate suggestions for change", () => {
      const result = calculateChange(100, 11000); // 100 new = 10000 old, paid 11000, change 1000 old (10 new)
      expect(result).not.toBeNull();
      expect(result?.suggestions.length).toBeGreaterThan(0);
    });

    it("should handle large amounts", () => {
      const result = calculateChange(5000, 510000); // 5000 new = 500000 old, paid 510000, change 10000 old (100 new)
      expect(result).not.toBeNull();
      expect(result?.oldCurrency).toBe(10000);
      expect(result?.newCurrency).toBe(100);
    });

    it("should handle small amounts", () => {
      const result = calculateChange(10, 1100); // 10 new = 1000 old, paid 1100, change 100 old (1 new)
      expect(result).not.toBeNull();
      expect(result?.oldCurrency).toBe(100);
      expect(result?.newCurrency).toBe(1);
    });
  });

  describe("formatNumber", () => {
    it("should format numbers with Arabic locale", () => {
      const formatted = formatNumber(1000);
      expect(formatted).toBe("١٬٠٠٠");
    });

    it("should format zero", () => {
      const formatted = formatNumber(0);
      expect(formatted).toBe("٠");
    });

    it("should format large numbers", () => {
      const formatted = formatNumber(1000000);
      expect(formatted).toBe("١٬٠٠٠٬٠٠٠");
    });
  });

  describe("validateInput", () => {
    it("should return null for valid inputs", () => {
      const error = validateInput(100, 10000);
      expect(error).toBeNull();
    });

    it("should reject zero price", () => {
      const error = validateInput(0, 10000);
      expect(error).not.toBeNull();
    });

    it("should reject zero paid amount", () => {
      const error = validateInput(100, 0);
      expect(error).not.toBeNull();
    });

    it("should reject negative price", () => {
      const error = validateInput(-100, 10000);
      expect(error).not.toBeNull();
    });

    it("should reject negative paid amount", () => {
      const error = validateInput(100, -10000);
      expect(error).not.toBeNull();
    });

    it("should reject non-integer price", () => {
      const error = validateInput(100.5, 10000);
      expect(error).not.toBeNull();
    });

    it("should reject non-integer paid amount", () => {
      const error = validateInput(100, 10000.5);
      expect(error).not.toBeNull();
    });
  });

  describe("Real-world scenarios", () => {
    it("scenario 1: buying item for 215 new, paying 22000 old, getting 500 old back", () => {
      const result = calculateChange(215, 22000);
      expect(result).not.toBeNull();
      expect(result?.oldCurrency).toBe(500);
      expect(result?.newCurrency).toBe(5);
      expect(result?.suggestions.length).toBeGreaterThan(0);
    });

    it("scenario 2: buying item for 100 new, paying 10000 old exactly", () => {
      const result = calculateChange(100, 10000);
      expect(result).not.toBeNull();
      expect(result?.oldCurrency).toBe(0);
      expect(result?.newCurrency).toBe(0);
    });

    it("scenario 3: buying item for 50 new, paying 5500 old, getting 500 old back", () => {
      const result = calculateChange(50, 5500);
      expect(result).not.toBeNull();
      expect(result?.oldCurrency).toBe(500);
      expect(result?.newCurrency).toBe(5);
    });

    it("scenario 4: buying item for 1000 new, paying 100000 old, getting 0 old back", () => {
      // 1000 new = 100000 old, paid 100000 old, change = 0
      const result = calculateChange(1000, 100000);
      expect(result).not.toBeNull();
      expect(result?.oldCurrency).toBe(0);
      expect(result?.newCurrency).toBe(0);
    });

    it("scenario 5: buying item for 1000 new, paying 110000 old, getting 10000 old back", () => {
      // 1000 new = 100000 old, paid 110000 old, change = 10000 old (100 new)
      const result = calculateChange(1000, 110000);
      expect(result).not.toBeNull();
      expect(result?.oldCurrency).toBe(10000);
      expect(result?.newCurrency).toBe(100);
    });
  });
});
