/**
 * منطق حساب العملة السورية الجديدة والقديمة
 * العملة الجديدة = العملة القديمة / 100
 */

// فئات العملات
// ملاحظة: لا توجد فئة 5 ليرات في العملة الجديدة
export const NEW_CURRENCY_DENOMINATIONS = [10, 25, 50, 100, 200, 500];
export const OLD_CURRENCY_DENOMINATIONS = [500, 1000, 2000, 5000];

// تحويل بين العملتين
export const CONVERSION_RATE = 100; // 1 جديدة = 100 قديمة

// تحويل من جديدة إلى قديمة
export function convertNewToOld(newCurrency: number): number {
  return newCurrency * CONVERSION_RATE;
}

// تحويل من قديمة إلى جديدة
export function convertOldToNew(oldCurrency: number): number {
  return Math.round(oldCurrency / CONVERSION_RATE);
}

// تنسيق الرقم بفواصل آلاف وتحويله للأرقام العربية
export function formatNumber(num: number): string {
  const englishNum = Math.floor(num).toString();
  const formatted = englishNum.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  
  // تحويل الأرقام الإنجليزية إلى عربية
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

// التحقق من صحة الإدخال
export function validateInput(priceInNew: number, paidInOld: number): string | null {
  if (priceInNew <= 0) {
    return "المبلغ المراد دفعه يجب أن يكون أكبر من صفر";
  }
  if (paidInOld <= 0) {
    return "المبلغ المدفوع يجب أن يكون أكبر من صفر";
  }
  // التحقق من أن القيم رقام صحيحة
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

/**
 * حساب الفرق والاقتراحات
 */
export function calculateChange(priceInNew: number, paidInOld: number): CurrencyChange | null {
  const priceInOld = convertNewToOld(priceInNew);

  // التحقق من أن المبلغ المدفوع كافٍ
  if (paidInOld < priceInOld) {
    return null;
  }

  const changeInOld = paidInOld - priceInOld;
  const changeInNew = convertOldToNew(changeInOld);

  // إذا لم يكن هناك فرق
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

/**
 * توليد الاقتراحات العادية
 */
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
      // للـ 500 القديمة، استخدم الشكل الثاني في الاقتراح الثاني
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

  // الاقتراح الثالث: مزيج من الجديدة والقديمة
  if (changeInNew >= 10) {
    const newDenoms2 = getOptimalDenominations(changeInNew, NEW_CURRENCY_DENOMINATIONS);
    const remainingOld = changeInOld % 100;
    const oldDenoms2 = remainingOld > 0 ? getOptimalDenominations(remainingOld, OLD_CURRENCY_DENOMINATIONS) : [];

    const totalNew = sumDenominations(newDenoms2);
    const totalOld = sumDenominations(oldDenoms2);

    if ((totalNew + totalOld * 100 === changeInOld || (totalNew > 0 && totalOld === 0)) && (newDenoms2.length > 0 || oldDenoms2.length > 0)) {
      suggestions.push({
        id: "suggestion_3",
        newDenominations: newDenoms2.map((d) => ({
          denomination: d.denomination,
          count: d.count,
        })),
        oldDenominations: oldDenoms2.map((d) => ({
          denomination: d.denomination,
          count: d.count,
        })),
        description: "مزيج من العملة الجديدة والقديمة",
      });
    }
  }

  return suggestions;
}

/**
 * حساب مجموع الفئات
 */
function sumDenominations(denoms: { denomination: number; count: number }[]): number {
  return denoms.reduce((sum, d) => sum + d.denomination * d.count, 0);
}

/**
 * توليد الاقتراحات الذكية للفرق الصغير
 * عندما يكون الفرق 5 ليرات جديدة، يقترح إضافة مبالغ معينة للحصول على فئات متاحة
 */
function generateSmartSuggestions(changeInNew: number, changeInOld: number): SmartSuggestion[] {
  const suggestions: SmartSuggestion[] = [];

  // إذا كان الفرق 5 ليرات جديدة (500 قديمة)
  if (changeInNew === 5) {
    // الخيار 1: إضافة 20 ليرة جديدة للحصول على 25 ليرة ترجيع
    const addAmount1 = 20;
    const newTotal1 = changeInNew + addAmount1; // 25
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

    // الخيار 2: إضافة 50 ليرة جديدة للحصول على 55 ليرة ترجيع
    const addAmount2 = 50;
    const newTotal2 = changeInNew + addAmount2; // 55
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

    // الخيار 3: إضافة 100 ليرة جديدة للحصول على 105 ليرة ترجيع
    const addAmount3 = 100;
    const newTotal3 = changeInNew + addAmount3; // 105
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

  // إذا كان الفرق 50 ليرة قديمة (0.5 ليرة جديدة) - حالة نادرة
  if (changeInOld === 50 && changeInNew < 1) {
    // اقترح إضافة 450 ليرة قديمة للحصول على 500 ليرة ترجيع
    const addOldAmount = 450;
    const newTotalOld = changeInOld + addOldAmount; // 500
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

/**
 * الحصول على أفضل توزيع للفئات
 * تستخدم خوارزمية الجشع (Greedy Algorithm) لاختيار أفضل توليفة
 */
function getOptimalDenominations(
  amount: number,
  denominations: number[]
): { denomination: number; count: number }[] {
  // إذا كان المبلغ 0، أرجع مصفوفة فارغة
  if (amount === 0) {
    return [];
  }

  const result: { denomination: number; count: number }[] = [];
  let remaining = amount;

  // ترتيب الفئات من الأكبر إلى الأصغر
  const sorted = [...denominations].sort((a, b) => b - a);

  // استخدم الفئات الكبيرة أولاً
  for (const denom of sorted) {
    if (remaining >= denom) {
      const count = Math.floor(remaining / denom);
      result.push({ denomination: denom, count });
      remaining -= count * denom;
    }
  }

  // إذا بقي رصيد، فهذا يعني أن المبلغ لا يمكن تكوينه من الفئات المتاحة
  // في هذه الحالة، حاول إيجاد توليفة بديلة
  if (remaining > 0) {
    return findAlternativeCombination(amount, denominations);
  }

  return result;
}

/**
 * البحث عن توليفة بديلة عندما لا تنجح الخوارزمية الجشعة
 */
function findAlternativeCombination(
  amount: number,
  denominations: number[]
): { denomination: number; count: number }[] {
  const sorted = [...denominations].sort((a, b) => b - a);

  // جرب تقليل كل فئة والبحث عن توليفة
  for (let i = 0; i < sorted.length; i++) {
    for (let reduce = 1; reduce <= Math.floor(amount / sorted[i]); reduce++) {
      const remaining = amount - sorted[i] * reduce;
      const result: { denomination: number; count: number }[] = [];
      
      if (remaining === 0) {
        result.push({ denomination: sorted[i], count: reduce });
        return result;
      }

      // جرب الفئات المتبقية
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

  // إذا فشل كل شيء، أرجع مصفوفة فارغة
  return [];
}
