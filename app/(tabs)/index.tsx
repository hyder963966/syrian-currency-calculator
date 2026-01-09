import { ScrollView, Text, View, TextInput, Pressable, Image } from "react-native";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { CurrencyImageGroup } from "@/components/currency-image";
import { cn } from "@/lib/utils";
import {
  calculateChange,
  convertNewToOld,
  formatNumber,
  validateInput,
  type CurrencyChange,
} from "@/lib/currency-calculator";

type PaymentCurrency = "new" | "old";

export default function HomeScreen() {
  const [priceInNew, setPriceInNew] = useState<string>("");
  const [paidAmount, setPaidAmount] = useState<string>("");
  const [paymentCurrency, setPaymentCurrency] = useState<PaymentCurrency>("old");
  const [result, setResult] = useState<CurrencyChange | null>(null);
  const [error, setError] = useState<string>("");

  const handleCalculate = () => {
    setError("");
    setResult(null);

    const priceNum = parseInt(priceInNew, 10);
    const paidNum = parseInt(paidAmount, 10);

    if (!priceNum || !paidNum) {
      setError("يرجى إدخال جميع المبالغ");
      return;
    }

    // تحويل المبلغ المدفوع إلى العملة القديمة إذا كان بالجديدة
    const paidInOld = paymentCurrency === "new" ? convertNewToOld(paidNum) : paidNum;

    const validationError = validateInput(priceNum, paidInOld);
    if (validationError) {
      setError(validationError);
      return;
    }

    const changeResult = calculateChange(priceNum, paidInOld);
    if (changeResult === null) {
      setError("المبلغ المدفوع أقل من المطلوب!");
      return;
    }

    setResult(changeResult);
  };

  const priceInOld = priceInNew ? convertNewToOld(parseInt(priceInNew, 10)) : 0;
  const paidInOldDisplay = paymentCurrency === "new" && paidAmount 
    ? convertNewToOld(parseInt(paidAmount, 10))
    : (paidAmount ? parseInt(paidAmount, 10) : 0);

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}>
        <View className="gap-6">
          {/* Header */}
          <View className="items-center gap-2 mb-4">
            <Text className="text-3xl font-bold text-foreground">حاسبة العملة السورية</Text>
            <Text className="text-sm text-muted">احسب الفرق والترجيع بسهولة</Text>
          </View>

          {/* Input Section */}
          <View className="gap-4 bg-surface rounded-2xl p-4 border border-border">
            {/* Price in New Currency */}
            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">المبلغ المراد دفعه</Text>
              <Text className="text-xs text-muted">(ليرة جديدة)</Text>
              <TextInput
                className="bg-background border border-border rounded-lg px-4 py-3 text-foreground text-lg"
                placeholder="أدخل المبلغ"
                placeholderTextColor="#9BA1A6"
                keyboardType="number-pad"
                value={priceInNew}
                onChangeText={setPriceInNew}
              />
              {priceInNew && (
                <View className="bg-primary/10 rounded-lg p-3 border border-primary/20">
                  <View>
                    <Text className="text-xs text-muted mb-1">المعادل بالعملة القديمة:</Text>
                  </View>
                  <Text className="text-lg font-bold text-primary">{formatNumber(priceInOld)} ليرة قديمة</Text>
                </View>
              )}
            </View>

            {/* Currency Selection */}
            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">اختر العملة المدفوعة</Text>
              <View className="flex-row gap-3">
                <Pressable
                  onPress={() => setPaymentCurrency("new")}
                  className={cn(
                    "flex-1 rounded-lg py-2 px-3 border-2",
                    paymentCurrency === "new"
                      ? "bg-primary border-primary"
                      : "bg-background border-border"
                  )}
                >
                  <Text className={cn(
                    "text-center font-semibold text-sm",
                    paymentCurrency === "new" ? "text-white" : "text-foreground"
                  )}>
                    جديدة
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setPaymentCurrency("old")}
                  className={cn(
                    "flex-1 rounded-lg py-2 px-3 border-2",
                    paymentCurrency === "old"
                      ? "bg-primary border-primary"
                      : "bg-background border-border"
                  )}
                >
                  <Text className={cn(
                    "text-center font-semibold text-sm",
                    paymentCurrency === "old" ? "text-white" : "text-foreground"
                  )}>
                    قديمة
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Paid Amount */}
            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">المبلغ المدفوع</Text>
              <Text className="text-xs text-muted">
                (ليرة {paymentCurrency === "new" ? "جديدة" : "قديمة"})
              </Text>
              <TextInput
                className="bg-background border border-border rounded-lg px-4 py-3 text-foreground text-lg"
                placeholder="أدخل المبلغ المدفوع"
                placeholderTextColor="#9BA1A6"
                keyboardType="number-pad"
                value={paidAmount}
                onChangeText={setPaidAmount}
              />
              {paidAmount && (
                <View className="bg-primary/10 rounded-lg p-3 border border-primary/20">
                  <View>
                    <Text className="text-xs text-muted mb-1">المعادل بالعملة القديمة:</Text>
                  </View>
                  <Text className="text-lg font-bold text-primary">{formatNumber(paidInOldDisplay)} ليرة قديمة</Text>
                </View>
              )}
            </View>

            {/* Calculate Button */}
            <Pressable
              onPress={handleCalculate}
              className="bg-primary rounded-lg py-3 items-center active:opacity-80"
            >
              <Text className="text-white font-semibold text-base">احسب الفرق</Text>
            </Pressable>
          </View>

          {/* Error Message */}
          {error && (
            <View className="bg-error/10 border border-error rounded-lg p-3">
              <Text className="text-error text-sm">{error}</Text>
            </View>
          )}

          {/* Results Section */}
          {result && (
            <View className="gap-4">
              {/* Change Amount */}
              <View className="bg-primary/10 border border-primary rounded-2xl p-4">
                <View>
                  <Text className="text-xs text-muted mb-2">الفرق المستحق للترجيع</Text>
                </View>
                <View className="gap-2">
                  <Text className="text-2xl font-bold text-primary">
                    {formatNumber(result.newCurrency)} ليرة جديدة
                  </Text>
                  <Text className="text-sm text-muted">
                    أو {formatNumber(result.oldCurrency)} ليرة قديمة
                  </Text>
                </View>
              </View>

              {/* Change Suggestions */}
              {result.suggestions.length > 0 && (
                <View className="gap-3">
                  <View>
                    <Text className="text-sm font-semibold text-foreground">طرق الترجيع المقترحة</Text>
                  </View>
                  {result.suggestions.map((suggestion, index) => (
                    <ChangeSuggestionCard key={suggestion.id} suggestion={suggestion} index={index} />
                  ))}
                </View>
              )}

              {/* No Change */}
              {result.suggestions.length === 0 && (
                <View className="bg-surface rounded-lg p-4 border border-border">
                  <Text className="text-center text-muted">لا يوجد ترجيع</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function ChangeSuggestionCard({ suggestion, index }: { suggestion: any; index: number }) {
  const optionLabel = index === 0 ? "الخيار الأول" : index === 1 ? "الخيار الثاني" : "الخيار الثالث";
  return (
    <View className="bg-surface rounded-lg p-4 border border-border gap-4">
      <View>
        <Text className="text-xs text-muted font-semibold">{optionLabel}</Text>
      </View>

      {suggestion.newDenominations.length > 0 && (
        <View className="gap-3">
          <View>
            <Text className="text-xs font-semibold text-primary">عملة جديدة:</Text>
          </View>
          <View className="bg-background rounded-lg p-3 items-center">
            <CurrencyImageGroup
              denominations={suggestion.newDenominations}
              type="new"
            />
          </View>
        </View>
      )}

      {suggestion.oldDenominations.length > 0 && (
        <View className="gap-3">
          <View>
            <Text className="text-xs font-semibold text-primary">عملة قديمة:</Text>
          </View>
          <View className="bg-background rounded-lg p-3 items-center">
            <CurrencyImageGroup
              denominations={suggestion.oldDenominations}
              type="old"
            />
          </View>
        </View>
      )}
    </View>
  );
}
