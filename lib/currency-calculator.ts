/**
 * منطق حساب العملة السورية الجديدة والقديمة
 * العملة الجديدة = العملة القديمة / 100
 */

// فئات العملات
export const NEW_CURRENCY_DENOMINATIONS = [10, 25, 50, 100, 200, 500];
export const OLD_CURRENCY_DENOMINATIONS = [500, 1000, 2000, 5000];

// تحويل بين العملتين
export const CONVERSION_RATE = 100; // 1 جديدة = 100 قديمة

export interface CurrencyChange {
  newCurrency: number; // بالعملة الجديدة
  oldCurrency: number; // بالعملة القديمة
  suggestions: ChangeSuggestion[];
  paymentSuggestions: PaymentSuggestion[];
}

export interface ChangeSuggestion {
  id: string;
  newDenominations: { denomination: number; count: number }[];
  oldDenominations: { denomination: number; count: number; imageVariant?: string }[];
  totalNew: number;
  totalOld: number;
}

export interface PaymentSuggestion {
  id: string;
  newDenominations: { denomination: number; count: number }[];
  oldDenominations: { denomination: number; count: number; imageVariant?: string }[];
  totalNew: number;
  totalOld: number;
}

/**
 * تحويل من العملة الجديدة إلى القديمة
 */
export function convertNewToOld(newAmount: number): number {
  return Math.round(newAmount * CONVERSION_RATE);
}

/**
 * تحويل من العملة القديمة إلى الجديدة
 */
export function convertOldToNew(oldAmount: number): number {
  return Math.round(oldAmount / CONVERSION_RATE);
}

/**
 * حساب الفرق والترجيع
 */
export function calculateChange(
  priceInNew: number,
  paidInOld: number
): CurrencyChange | null {
  const priceInOld = convertNewToOld(priceInNew);
  const changeInOld = paidInOld - priceInOld;
  const changeInNew = convertOldToNew(changeInOld);

  if (changeInOld < 0) {
    // المبلغ المدفوع أقل من المطلوب
    return null;
  }

  if (changeInOld === 0) {
    // لا يوجد ترجيع
    return {
      newCurrency: 0,
      oldCurrency: 0,
      suggestions: [],
      paymentSuggestions: [],
    };
  }

  const suggestions = generateChangeSuggestions(changeInNew, changeInOld);
  const paymentSuggestions = generatePaymentSuggestions(priceInOld, paidInOld);

  return {
    newCurrency: changeInNew,
    oldCurrency: changeInOld,
    suggestions,
    paymentSuggestions,
  };
}

/**
 * توليد اقتراحات الترجيع
 */
function generateChangeSuggestions(changeInNew: number, changeInOld: number): ChangeSuggestion[] {
  const suggestions: ChangeSuggestion[] = [];

  // اقتراح 1: استخدام العملة الجديدة بشكل أساسي
  const newDenominations = getOptimalDenominations(changeInNew, NEW_CURRENCY_DENOMINATIONS);
  if (newDenominations.length > 0) {
    suggestions.push({
      id: 'new-primary',
      newDenominations,
      oldDenominations: [],
      totalNew: changeInNew,
      totalOld: changeInOld,
    });
  }

  // اقتراح 2: استخدام العملة القديمة
  const oldDenominations = getOptimalDenominations(changeInOld, OLD_CURRENCY_DENOMINATIONS);
  if (oldDenominations.length > 0) {
    suggestions.push({
      id: 'old-primary',
      newDenominations: [],
      oldDenominations,
      totalNew: changeInNew,
      totalOld: changeInOld,
    });
  }

  // اقتراح 3: مزيج من العملتين
  if (changeInNew > 500 && changeInOld > 5000) {
    const mixedNew = getOptimalDenominations(changeInNew, NEW_CURRENCY_DENOMINATIONS);
    const remainingOld = changeInOld - convertNewToOld(changeInNew);
    const mixedOld = remainingOld > 0 ? getOptimalDenominations(remainingOld, OLD_CURRENCY_DENOMINATIONS) : [];
    
    if (mixedNew.length > 0 || mixedOld.length > 0) {
      suggestions.push({
        id: 'mixed',
        newDenominations: mixedNew,
        oldDenominations: mixedOld,
        totalNew: changeInNew,
        totalOld: changeInOld,
      });
    }
  }

  // إذا كانت الـ 500 القديمة مستخدمة، أضف الشكل البديل
  suggestions.forEach(suggestion => {
    if (suggestion.oldDenominations.some(d => d.denomination === 500)) {
      // نسخ الاقتراح مع تغيير variant للـ 500
      const alternativeSuggestion = {
        ...suggestion,
        id: suggestion.id + '-alt',
        oldDenominations: suggestion.oldDenominations.map(d => ({
          ...d,
          imageVariant: d.denomination === 500 ? 'variant2' : undefined,
        })),
      };
      suggestions.push(alternativeSuggestion);
    }
  });

  return suggestions;
}

/**
 * توليد اقتراحات الدفع
 */
function generatePaymentSuggestions(priceInOld: number, paidInOld: number): PaymentSuggestion[] {
  const suggestions: PaymentSuggestion[] = [];

  if (paidInOld >= priceInOld) {
    return suggestions;
  }

  // الفرق المتبقي
  const remainingInOld = priceInOld - paidInOld;
  const remainingInNew = convertOldToNew(remainingInOld);

  // اقتراح 1: دفع الفرق بالعملة الجديدة
  const newDenominations = getOptimalDenominations(remainingInNew, NEW_CURRENCY_DENOMINATIONS);
  if (newDenominations.length > 0) {
    suggestions.push({
      id: 'payment-new',
      newDenominations,
      oldDenominations: [],
      totalNew: remainingInNew,
      totalOld: remainingInOld,
    });
  }

  // اقتراح 2: دفع الفرق بالعملة القديمة
  const oldDenominations = getOptimalDenominations(remainingInOld, OLD_CURRENCY_DENOMINATIONS);
  if (oldDenominations.length > 0) {
    suggestions.push({
      id: 'payment-old',
      newDenominations: [],
      oldDenominations,
      totalNew: remainingInNew,
      totalOld: remainingInOld,
    });
  }

  return suggestions;
}

/**
 * الحصول على أفضل توزيع للفئات
 * تحاول استخدام أكبر الفئات أولاً
 */
function getOptimalDenominations(
  amount: number,
  denominations: number[]
): { denomination: number; count: number }[] {
  const result: { denomination: number; count: number }[] = [];
  let remaining = amount;

  // ترتيب الفئات من الأكبر إلى الأصغر
  const sorted = [...denominations].sort((a, b) => b - a);

  for (const denom of sorted) {
    if (remaining >= denom) {
      const count = Math.floor(remaining / denom);
      result.push({ denomination: denom, count });
      remaining -= count * denom;
    }
  }

  // إذا بقي رصيد، حاول إيجاد توليفة أفضل
  if (remaining > 0) {
    // حاول تقليل أحد الفئات وإضافة فئات أصغر
    for (let i = 0; i < result.length; i++) {
      const reduced = result[i].count - 1;
      if (reduced > 0) {
        const freed = result[i].denomination;
        const newRemaining = remaining + freed;
        
        // جرب الفئات الأصغر
        const smallerDenoms = sorted.filter(d => d < result[i].denomination);
        const canMakeUp = smallerDenoms.some(d => newRemaining % d === 0 || newRemaining >= d);
        
        if (canMakeUp) {
          result[i].count = reduced;
          remaining = newRemaining;
          
          for (const denom of smallerDenoms) {
            if (remaining >= denom) {
              const count = Math.floor(remaining / denom);
              result.push({ denomination: denom, count });
              remaining -= count * denom;
            }
          }
          break;
        }
      }
    }
  }

  // إزالة الفئات بـ 0 عدد
  return result.filter(r => r.count > 0);
}

/**
 * تنسيق الرقم بفواصل آلاف
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('ar-SY');
}

/**
 * الحصول على مسار صورة العملة
 */
export function getCurrencyImagePath(
  denomination: number,
  isCurrency: 'new' | 'old',
  variant?: string
): string {
  const folder = isCurrency === 'new' ? 'عملة جديدة' : 'عملة قديمة';
  const fileName = variant ? `${denomination}(${variant}).jpg` : `${denomination}.jpg`;
  return `../assets/currency/${folder}/${fileName}`;
}

/**
 * التحقق من صحة المدخلات
 */
export function validateInput(priceInNew: number, paidInOld: number): string | null {
  if (priceInNew <= 0) {
    return 'المبلغ المراد دفعه يجب أن يكون أكبر من صفر';
  }

  if (paidInOld <= 0) {
    return 'المبلغ المدفوع يجب أن يكون أكبر من صفر';
  }

  if (!Number.isInteger(priceInNew) || !Number.isInteger(paidInOld)) {
    return 'يجب إدخال أرقام صحيحة';
  }

  return null;
}
