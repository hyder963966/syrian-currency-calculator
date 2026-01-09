import { ScrollView, Text, View, TextInput, Pressable, Image, Alert } from "react-native";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { cn } from "@/lib/utils";
import {
  calculateChange,
  convertNewToOld,
  formatNumber,
  getCurrencyImagePath,
  validateInput,
  type CurrencyChange,
} from "@/lib/currency-calculator";

export default function HomeScreen() {
  const [priceInNew, setPriceInNew] = useState<string>("");
  const [paidInOld, setPaidInOld] = useState<string>("");
  const [result, setResult] = useState<CurrencyChange | null>(null);
  const [error, setError] = useState<string>("");

  const handleCalculate = () => {
    setError("");
    setResult(null);

    const priceNum = parseInt(priceInNew, 10);
    const paidNum = parseInt(paidInOld, 10);

    const validationError = validateInput(priceNum, paidNum);
    if (validationError) {
      setError(validationError);
      return;
    }

    const changeResult = calculateChange(priceNum, paidNum);
    if (changeResult === null) {
      setError("المبلغ المدفوع أقل من المطلوب!");
      return;
    }

    setResult(changeResult);
  };

  const priceInOld = priceInNew ? convertNewToOld(parseInt(priceInNew, 10)) : 0;

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
                <Text className="text-xs text-muted">
                  = {formatNumber(priceInOld)} ليرة قديمة
                </Text>
              )}
            </View>

            {/* Price in Old Currency Display */}
            {priceInNew && (
              <View className="bg-primary/10 rounded-lg p-3 border border-primary/20">
                <Text className="text-xs text-muted mb-1">المعادل بالعملة القديمة:</Text>
                <Text className="text-lg font-bold text-primary">{formatNumber(priceInOld)} ليرة قديمة</Text>
              </View>
            )}

            {/* Paid Amount */}
            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">المبلغ المدفوع</Text>
              <Text className="text-xs text-muted">(ليرة قديمة)</Text>
              <TextInput
                className="bg-background border border-border rounded-lg px-4 py-3 text-foreground text-lg"
                placeholder="أدخل المبلغ المدفوع"
                placeholderTextColor="#9BA1A6"
                keyboardType="number-pad"
                value={paidInOld}
                onChangeText={setPaidInOld}
              />
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
              <View className="bg-success/10 border border-success rounded-2xl p-4">
                <Text className="text-xs text-muted mb-2">الفرق المستحق للترجيع</Text>
                <View className="gap-2">
                  <Text className="text-2xl font-bold text-success">
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

              {/* Payment Suggestions */}
              {result.paymentSuggestions.length > 0 && (
                <View className="gap-3">
                  <View>
                    <Text className="text-sm font-semibold text-foreground">طرق دفع إضافية مقترحة</Text>
                  </View>
                  {result.paymentSuggestions.map((suggestion, index) => (
                    <PaymentSuggestionCard key={suggestion.id} suggestion={suggestion} index={index} />
                  ))}
                </View>
              )}

              {/* No Change */}
              {result.suggestions.length === 0 && result.paymentSuggestions.length === 0 && (
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
    <View className="bg-surface rounded-lg p-3 border border-border gap-2">
      <View>
        <Text className="text-xs text-muted font-semibold">{optionLabel}</Text>
      </View>

      {suggestion.newDenominations.length > 0 && (
        <View className="gap-2">
          <View>
            <Text className="text-xs text-muted">عملة جديدة:</Text>
          </View>
          <View className="flex-row flex-wrap gap-2">
            {suggestion.newDenominations.map((denom: any) => (
              <CurrencyBadge
                key={`new-${denom.denomination}`}
                denomination={denom.denomination}
                count={denom.count}
                type="new"
              />
            ))}
          </View>
        </View>
      )}

      {suggestion.oldDenominations.length > 0 && (
        <View className="gap-2">
          <View>
            <Text className="text-xs text-muted">عملة قديمة:</Text>
          </View>
          <View className="flex-row flex-wrap gap-2">
            {suggestion.oldDenominations.map((denom: any) => (
              <CurrencyBadge
                key={`old-${denom.denomination}-${denom.imageVariant || 'default'}`}
                denomination={denom.denomination}
                count={denom.count}
                type="old"
                variant={denom.imageVariant}
              />
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

function PaymentSuggestionCard({ suggestion, index }: { suggestion: any; index: number }) {
  const optionLabel = index === 0 ? "الخيار الأول" : "الخيار الثاني";
  return (
    <View className="bg-surface rounded-lg p-3 border border-border gap-2">
      <View>
        <Text className="text-xs text-muted font-semibold">{optionLabel}</Text>
      </View>

      {suggestion.newDenominations.length > 0 && (
        <View className="gap-2">
          <View>
            <Text className="text-xs text-muted">ادفع بعملة جديدة:</Text>
          </View>
          <View className="flex-row flex-wrap gap-2">
            {suggestion.newDenominations.map((denom: any) => (
              <CurrencyBadge
                key={`payment-new-${denom.denomination}`}
                denomination={denom.denomination}
                count={denom.count}
                type="new"
              />
            ))}
          </View>
        </View>
      )}

      {suggestion.oldDenominations.length > 0 && (
        <View className="gap-2">
          <View>
            <Text className="text-xs text-muted">ادفع بعملة قديمة:</Text>
          </View>
          <View className="flex-row flex-wrap gap-2">
            {suggestion.oldDenominations.map((denom: any) => (
              <CurrencyBadge
                key={`payment-old-${denom.denomination}-${denom.imageVariant || 'default'}`}
                denomination={denom.denomination}
                count={denom.count}
                type="old"
                variant={denom.imageVariant}
              />
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

function CurrencyBadge({
  denomination,
  count,
  type,
  variant,
}: {
  denomination: number;
  count: number;
  type: "new" | "old";
  variant?: string;
}) {
  const currencyLabel = type === "new" ? "جديدة" : "قديمة";
  return (
    <View className="bg-primary/10 rounded-lg px-3 py-2 border border-primary/20 gap-1">
      <View>
        <Text className="text-xs font-semibold text-primary">
          {count}x {denomination} {currencyLabel}
        </Text>
      </View>
      <View>
        <Text className="text-xs text-muted">
          {count * denomination} ل.س
        </Text>
      </View>
    </View>
  );
}
