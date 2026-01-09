/**
 * منطق حساب العملة السورية الجديدة والقديمة
 * العملة الجديدة = العملة القديمة / 100
 */

// فئات العملات
export const NEW_CURRENCY_DENOMINATIONS = [10, 25, 50, 100, 200, 500];
export const OLD_CURRENCY_DENOMINATIONS = [500, 1000, 2000, 5000];

// تحويل بين العملتين
export const CONVERSION_RATE = 100; // 1 جديدة = 100 قديمة

export function convertNewToOld(newCurrency: number): number {
  return newCurrency * CONVERSION_RATE;
}

export function convertOldToNew(oldCurrency: number): number {
  return Math.round(oldCurrency / CONVERSION_RATE);
}

export function formatNumber(num: number): string {
  const englishNum = Math.floor(num).toString();
  const formatted = englishNum.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  
  const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return formatted.split("").map(char => {
    if (char >= "0" && char <= "9") {
      return arabicDigits[parseInt(char)];
    }
    if (char === ",") {
      return "٬";
    }
    return char;
  }).join("");
}

export function validateInput(priceInNew: number, paidInOld: number): string | null {
  if (priceInNew <= 0) {
    return "المبلغ المراد دفعه يجب أن يكون أكبر من صفر";
  }
  if (paidInOld <= 0) {
    return "المبلغ المدفوع يجب أن يكون أكبر من صفر";
  }
  if (!Number.isInteger(priceInNew)) {
    return "المبلغ المراد دفعه يجب أن يكون رقماً صحيحاً";
  }
  if (!Number.isInteger(paidInOld)) {
    return "المبلغ المدفوع يجب أن يكون رقماً صحيحاً";
  }
  return null;
}

export interface ChangeSuggestion {
  id: string;
  newDenominations: { denomination: number; count: number; imageVariant?: string }[];
  oldDenominations: { denomination: number; count: number; imageVariant?: string }[];
  description: string;
}

export interface CurrencyChange {
  newCurrency: number;
  oldCurrency: number;
  suggestions: ChangeSuggestion[];
  smartSuggestions?: SmartSuggestion[];
}

export interface SmartSuggestion {
  id: string;
  type: "add_to_new" | "add_to_old";
  additionalAmount: number;
  additionalAmountInOld: number;
  newTotalChange: number;
  oldTotalChange: number;
  newDenominations: { denomination: number; count: number; imageVariant?: string }[];
  oldDenominations: { denomination: number; count: number; imageVariant?: string }[];
  description: string;
}

export function calculateChange(priceInNew: number, paidInOld: number): CurrencyChange | null {
  const priceInOld = convertNewToOld(priceInNew);

  if (paidInOld < priceInOld) {
    return null;
  }

  const changeInOld = paidInOld - priceInOld;
  const changeInNew = convertOldToNew(changeInOld);

  if (changeInOld === 0) {
    return {
      newCurrency: 0,
      oldCurrency: 0,
      suggestions: [],
      smartSuggestions: [],
    };
  }

  const suggestions = generateSuggestions(changeInNew, changeInOld);
  const smartSuggestions = generateSmartSuggestions(changeInNew, changeInOld);

  return {
    newCurrency: changeInNew,
    oldCurrency: changeInOld,
    suggestions,
    smartSuggestions,
  };
}

function generateSuggestions(changeInNew: number, changeInOld: number): ChangeSuggestion[] {
  const suggestions: ChangeSuggestion[] = [];

  // الاقتراح الأول: باستخدام العملة الجديدة فقط
  const newDenoms1 = getOptimalDenominations(changeInNew, NEW_CURRENCY_DENOMINATIONS);
  if (newDenoms1.length > 0 && sumDenominations(newDenoms1) === changeInNew) {
    suggestions.push({
      id: "suggestion_1",
      newDenominations: newDenoms1.map((d) => ({
        denomination: d.denomination,
        count: d.count,
      })),
      oldDenominations: [],
      description: "باستخدام العملة الجديدة",
    });
  }

  // الاقتراح الثاني: باستخدام العملة القديمة فقط
  const oldDenoms1 = getOptimalDenominations(changeInOld, OLD_CURRENCY_DENOMINATIONS);
  if (oldDenoms1.length > 0 && sumDenominations(oldDenoms1) === changeInOld) {
    const oldDenominationsWithVariants = oldDenoms1.map((d) => {
      if (d.denomination === 500 && suggestions.length === 1) {
        return {
          denomination: d.denomination,
          count: d.count,
          imageVariant: "variant2",
        };
      }
      return {
        denomination: d.denomination,
        count: d.count,
      };
    });

    suggestions.push({
      id: "suggestion_2",
      newDenominations: [],
      oldDenominations: oldDenominationsWithVariants,
      description: "باستخدام العملة القديمة",
    });
  }

  // الاقتراح الثالث: توليفة بديلة من العملة القديمة فقط
  if (changeInOld > 0 && oldDenoms1.length > 0) {
    const alternativeOldDenoms = findAlternativeOldCombination(changeInOld, oldDenoms1);
    
    if (alternativeOldDenoms.length > 0 && 
        sumDenominations(alternativeOldDenoms) === changeInOld &&
        !areDenominationsCombinationsSame(oldDenoms1, alternativeOldDenoms)) {
      suggestions.push({
        id: "suggestion_3",
        newDenominations: [],
        oldDenominations: alternativeOldDenoms.map((d) => ({
          denomination: d.denomination,
          count: d.count,
        })),
        description: "توليفة بديلة من العملة القديمة",
      });
    }
  }

  return suggestions;
}

function sumDenominations(denoms: { denomination: number; count: number }[]): number {
  return denoms.reduce((sum, d) => sum + d.denomination * d.count, 0);
}

function generateSmartSuggestions(changeInNew: number, changeInOld: number): SmartSuggestion[] {
  const suggestions: SmartSuggestion[] = [];

  if (changeInNew === 5) {
    const addAmount1 = 20;
    const newTotal1 = changeInNew + addAmount1;
    const newDenoms1 = getOptimalDenominations(newTotal1, NEW_CURRENCY_DENOMINATIONS);
    if (sumDenominations(newDenoms1) === newTotal1) {
      suggestions.push({
        id: "smart_1",
        type: "add_to_new",
        additionalAmount: addAmount1,
        additionalAmountInOld: convertNewToOld(addAmount1),
        newTotalChange: newTotal1,
        oldTotalChange: convertNewToOld(newTotal1),
        newDenominations: newDenoms1.map((d) => ({
          denomination: d.denomination,
          count: d.count,
        })),
        oldDenominations: [],
        description: `أضف ${addAmount1} ليرة جديدة لتحصل على ${newTotal1} ليرة ترجيع`,
      });
    }

    const addAmount2 = 50;
    const newTotal2 = changeInNew + addAmount2;
    const newDenoms2 = getOptimalDenominations(newTotal2, NEW_CURRENCY_DENOMINATIONS);
    if (sumDenominations(newDenoms2) === newTotal2) {
      suggestions.push({
        id: "smart_2",
        type: "add_to_new",
        additionalAmount: addAmount2,
        additionalAmountInOld: convertNewToOld(addAmount2),
        newTotalChange: newTotal2,
        oldTotalChange: convertNewToOld(newTotal2),
        newDenominations: newDenoms2.map((d) => ({
          denomination: d.denomination,
          count: d.count,
        })),
        oldDenominations: [],
        description: `أضف ${addAmount2} ليرة جديدة لتحصل على ${newTotal2} ليرة ترجيع`,
      });
    }

    const addAmount3 = 100;
    const newTotal3 = changeInNew + addAmount3;
    const newDenoms3 = getOptimalDenominations(newTotal3, NEW_CURRENCY_DENOMINATIONS);
    if (sumDenominations(newDenoms3) === newTotal3) {
      suggestions.push({
        id: "smart_3",
        type: "add_to_new",
        additionalAmount: addAmount3,
        additionalAmountInOld: convertNewToOld(addAmount3),
        newTotalChange: newTotal3,
        oldTotalChange: convertNewToOld(newTotal3),
        newDenominations: newDenoms3.map((d) => ({
          denomination: d.denomination,
          count: d.count,
        })),
        oldDenominations: [],
        description: `أضف ${addAmount3} ليرة جديدة لتحصل على ${newTotal3} ليرة ترجيع`,
      });
    }
  }

  if (changeInOld === 50 && changeInNew < 1) {
    const addOldAmount = 450;
    const newTotalOld = changeInOld + addOldAmount;
    const oldDenoms = getOptimalDenominations(newTotalOld, OLD_CURRENCY_DENOMINATIONS);
    if (sumDenominations(oldDenoms) === newTotalOld) {
      suggestions.push({
        id: "smart_old_1",
        type: "add_to_old",
        additionalAmount: convertOldToNew(addOldAmount),
        additionalAmountInOld: addOldAmount,
        newTotalChange: convertOldToNew(newTotalOld),
        oldTotalChange: newTotalOld,
        newDenominations: [],
        oldDenominations: oldDenoms.map((d) => ({
          denomination: d.denomination,
          count: d.count,
        })),
        description: `أضف ${addOldAmount} ليرة قديمة لتحصل على ورقة 500 ليرة`,
      });
    }
  }

  return suggestions;
}

function findAlternativeOldCombination(
  amount: number,
  currentCombination: { denomination: number; count: number }[]
): { denomination: number; count: number }[] {
  const sorted = [...OLD_CURRENCY_DENOMINATIONS].sort((a, b) => b - a);
  
  for (let i = 0; i < sorted.length; i++) {
    for (let reduce = 1; reduce <= Math.floor(amount / sorted[i]); reduce++) {
      const remaining = amount - sorted[i] * reduce;
      const result: { denomination: number; count: number }[] = [];
      
      if (remaining === 0) {
        result.push({ denomination: sorted[i], count: reduce });
        if (!areDenominationsCombinationsSame(currentCombination, result)) {
          return result;
        }
        continue;
      }

      let temp = remaining;
      const tempResult: { denomination: number; count: number }[] = [
        { denomination: sorted[i], count: reduce },
      ];

      for (let j = i + 1; j < sorted.length; j++) {
        if (temp >= sorted[j]) {
          const count = Math.floor(temp / sorted[j]);
          tempResult.push({ denomination: sorted[j], count });
          temp -= count * sorted[j];
        }
      }

      if (temp === 0 && !areDenominationsCombinationsSame(currentCombination, tempResult)) {
        return tempResult;
      }
    }
  }

  return [];
}

function areDenominationsCombinationsSame(
  combo1: { denomination: number; count: number }[],
  combo2: { denomination: number; count: number }[]
): boolean {
  if (combo1.length !== combo2.length) return false;
  
  const sorted1 = [...combo1].sort((a, b) => a.denomination - b.denomination);
  const sorted2 = [...combo2].sort((a, b) => a.denomination - b.denomination);
  
  return sorted1.every((d, i) => d.denomination === sorted2[i].denomination && d.count === sorted2[i].count);
}

function getOptimalDenominations(
  amount: number,
  denominations: number[]
): { denomination: number; count: number }[] {
  if (amount === 0) {
    return [];
  }

  const result: { denomination: number; count: number }[] = [];
  let remaining = amount;

  const sorted = [...denominations].sort((a, b) => b - a);

  for (const denom of sorted) {
    if (remaining >= denom) {
      const count = Math.floor(remaining / denom);
      result.push({ denomination: denom, count });
      remaining -= count * denom;
    }
  }

  if (remaining > 0) {
    return findAlternativeCombination(amount, denominations);
  }

  return result;
}

function findAlternativeCombination(
  amount: number,
  denominations: number[]
): { denomination: number; count: number }[] {
  const sorted = [...denominations].sort((a, b) => b - a);

  for (let i = 0; i < sorted.length; i++) {
    for (let reduce = 1; reduce <= Math.floor(amount / sorted[i]); reduce++) {
      const remaining = amount - sorted[i] * reduce;
      const result: { denomination: number; count: number }[] = [];
      
      if (remaining === 0) {
        result.push({ denomination: sorted[i], count: reduce });
        return result;
      }

      let temp = remaining;
      const tempResult: { denomination: number; count: number }[] = [
        { denomination: sorted[i], count: reduce },
      ];

      for (let j = i + 1; j < sorted.length; j++) {
        if (temp >= sorted[j]) {
          const count = Math.floor(temp / sorted[j]);
          tempResult.push({ denomination: sorted[j], count });
          temp -= count * sorted[j];
        }
      }

      if (temp === 0) {
        return tempResult;
      }
    }
  }

  return [];
}
