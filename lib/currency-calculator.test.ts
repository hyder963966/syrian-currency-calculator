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

  describe("calculateChange - User Example", () => {
    it("should calculate 30 new change (3 x 10 new or 3 x 1000 old or 1 x 1000 + 1 x 2000 old)", () => {
      // Price: 220 new (22000 old)
      // Paid: 25000 old (250 new)
      // Change: 3000 old (30 new)
      const result = calculateChange(220, 25000);
      
      expect(result).not.toBeNull();
      expect(result?.newCurrency).toBe(30);
      expect(result?.oldCurrency).toBe(3000);
      
      // Should have suggestions
      expect(result?.suggestions.length).toBeGreaterThan(0);
      
      // Check for new currency suggestion: 3 x 10
      const newSuggestion = result?.suggestions.find(s => 
        s.newDenominations.length > 0 && s.oldDenominations.length === 0
      );
      expect(newSuggestion).toBeDefined();
      
      if (newSuggestion) {
        const tenDenom = newSuggestion.newDenominations.find(d => d.denomination === 10);
        expect(tenDenom?.count).toBe(3);
      }
      
      // Check for old currency suggestion: 3 x 1000 or 1 x 1000 + 1 x 2000
      const oldSuggestion = result?.suggestions.find(s => 
        s.oldDenominations.length > 0 && s.newDenominations.length === 0
      );
      expect(oldSuggestion).toBeDefined();
      
      if (oldSuggestion) {
        const total = oldSuggestion.oldDenominations.reduce((sum, d) => sum + d.denomination * d.count, 0);
        expect(total).toBe(3000);
      }
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

    it("should suggest 1 x 100 for 100 new change", () => {
      const result = calculateChange(100, 20000); // 100 new = 10000 old, paid 20000, change 10000 old (100 new)
      expect(result).not.toBeNull();
      expect(result?.newCurrency).toBe(100);
      
      const newSuggestion = result?.suggestions.find(s => 
        s.newDenominations.length > 0 && s.oldDenominations.length === 0
      );
      
      if (newSuggestion) {
        const hundredDenom = newSuggestion.newDenominations.find(d => d.denomination === 100);
        expect(hundredDenom?.count).toBe(1);
      }
    });

    it("should suggest 1 x 500 for 500 new change", () => {
      const result = calculateChange(100, 60000); // 100 new = 10000 old, paid 60000, change 50000 old (500 new)
      expect(result).not.toBeNull();
      expect(result?.newCurrency).toBe(500);
      
      const newSuggestion = result?.suggestions.find(s => 
        s.newDenominations.length > 0 && s.oldDenominations.length === 0
      );
      
      if (newSuggestion) {
        const fivehundredDenom = newSuggestion.newDenominations.find(d => d.denomination === 500);
        expect(fivehundredDenom?.count).toBe(1);
      }
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

    it("scenario 6: buying item for 220 new, paying 25000 old, getting 3000 old back (30 new)", () => {
      // 220 new = 22000 old, paid 25000 old, change = 3000 old (30 new)
      const result = calculateChange(220, 25000);
      expect(result).not.toBeNull();
      expect(result?.oldCurrency).toBe(3000);
      expect(result?.newCurrency).toBe(30);
      expect(result?.suggestions.length).toBeGreaterThan(0);
    });
  });

  describe("Denomination combinations", () => {
    it("should combine 1 x 200 + 1 x 25 + 1 x 10 for 235 new", () => {
      const result = calculateChange(100, 33500); // 100 new = 10000 old, paid 33500, change 23500 old (235 new)
      expect(result).not.toBeNull();
      expect(result?.newCurrency).toBe(235);
      
      const newSuggestion = result?.suggestions.find(s => 
        s.newDenominations.length > 0 && s.oldDenominations.length === 0
      );
      
      if (newSuggestion) {
        const total = newSuggestion.newDenominations.reduce((sum, d) => sum + d.denomination * d.count, 0);
        expect(total).toBe(235);
      }
    });

    it("should suggest old currency combinations correctly", () => {
      const result = calculateChange(100, 15000); // 100 new = 10000 old, paid 15000, change 5000 old (50 new)
      expect(result).not.toBeNull();
      expect(result?.oldCurrency).toBe(5000);
      
      const oldSuggestion = result?.suggestions.find(s => 
        s.oldDenominations.length > 0 && s.newDenominations.length === 0
      );
      
      if (oldSuggestion) {
        const fivethousandDenom = oldSuggestion.oldDenominations.find(d => d.denomination === 5000);
        expect(fivethousandDenom?.count).toBe(1);
      }
    });
  });
});
