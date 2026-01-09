import { ScrollView, Text, View, TextInput, Pressable, Image, FlatList } from "react-native";
import { useState, useRef, useEffect } from "react";
import Animated, { FadeIn, SlideInUp, FadeOut } from "react-native-reanimated";
import { ScreenContainer } from "@/components/screen-container";
import { CurrencyImageGroup } from "@/components/currency-image";
import { cn } from "@/lib/utils";
import { useCalculationHistory, type CalculationRecord } from "@/hooks/use-calculation-history";
import {
  calculateChange,
  convertNewToOld,
  formatNumber,
  validateInput,
  type CurrencyChange,
} from "@/lib/currency-calculator";

type PaymentCurrency = "new" | "old";
type TabType = "calculator" | "history";

export default function HomeScreen() {
  const [priceInNew, setPriceInNew] = useState<string>("");
  const [paidAmount, setPaidAmount] = useState<string>("");
  const [paymentCurrency, setPaymentCurrency] = useState<PaymentCurrency>("old");
  const [result, setResult] = useState<CurrencyChange | null>(null);
  const [error, setError] = useState<string>("");
  const [activeTab, setActiveTab] = useState<TabType>("calculator");
  const { history, addRecord, clearHistory, deleteRecord } = useCalculationHistory();
  const scrollViewRef = useRef<ScrollView>(null);

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

    // حفظ في السجل
    addRecord({
      priceInNew: priceNum,
      paidAmount: paidNum,
      paymentCurrency,
      changeInNew: changeResult.newCurrency,
      changeInOld: changeResult.oldCurrency,
    });

    // التمرير إلى نهاية الشاشة
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const priceInOld = priceInNew ? convertNewToOld(parseInt(priceInNew, 10)) : 0;
  const paidInOldDisplay =
    paymentCurrency === "new" && paidAmount ? convertNewToOld(parseInt(paidAmount, 10)) : paidAmount ? parseInt(paidAmount, 10) : 0;

  return (
    <ScreenContainer className="p-0">
      {/* Tab Navigation */}
      <View className="flex-row border-b border-border bg-surface">
        <Pressable
          onPress={() => setActiveTab("calculator")}
          className={cn(
            "flex-1 py-3 items-center border-b-2",
            activeTab === "calculator" ? "border-primary bg-primary/5" : "border-transparent"
          )}
        >
          <Text className={cn("font-semibold", activeTab === "calculator" ? "text-primary" : "text-muted")}>
            الحاسبة
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab("history")}
          className={cn(
            "flex-1 py-3 items-center border-b-2",
            activeTab === "history" ? "border-primary bg-primary/5" : "border-transparent"
          )}
        >
          <Text className={cn("font-semibold", activeTab === "history" ? "text-primary" : "text-muted")}>
            السجل ({history.length})
          </Text>
        </Pressable>
      </View>

      {/* Content */}
      {activeTab === "calculator" ? (
        <ScrollView ref={scrollViewRef} contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}>
          <View className="gap-6 p-4">
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
                  <Animated.View entering={FadeIn} className="bg-primary/10 rounded-lg p-3 border border-primary/20">
                    <View>
                      <Text className="text-xs text-muted mb-1">المعادل بالعملة القديمة:</Text>
                    </View>
                    <Text className="text-lg font-bold text-primary">{formatNumber(priceInOld)} ليرة قديمة</Text>
                  </Animated.View>
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
                      paymentCurrency === "new" ? "bg-primary border-primary" : "bg-background border-border"
                    )}
                  >
                    <Text
                      className={cn(
                        "text-center font-semibold text-sm",
                        paymentCurrency === "new" ? "text-white" : "text-foreground"
                      )}
                    >
                      جديدة
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setPaymentCurrency("old")}
                    className={cn(
                      "flex-1 rounded-lg py-2 px-3 border-2",
                      paymentCurrency === "old" ? "bg-primary border-primary" : "bg-background border-border"
                    )}
                  >
                    <Text
                      className={cn(
                        "text-center font-semibold text-sm",
                        paymentCurrency === "old" ? "text-white" : "text-foreground"
                      )}
                    >
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
                  <Animated.View entering={FadeIn} className="bg-primary/10 rounded-lg p-3 border border-primary/20">
                    <View>
                      <Text className="text-xs text-muted mb-1">المعادل بالعملة القديمة:</Text>
                    </View>
                    <Text className="text-lg font-bold text-primary">{formatNumber(paidInOldDisplay)} ليرة قديمة</Text>
                  </Animated.View>
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
              <Animated.View entering={SlideInUp} exiting={FadeOut} className="bg-error/10 border border-error rounded-lg p-3">
                <Text className="text-error text-sm">{error}</Text>
              </Animated.View>
            )}

            {/* Results Section */}
            {result && (
              <Animated.View entering={SlideInUp.springify()}>
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
                        <Animated.View key={suggestion.id} entering={SlideInUp.delay(index * 100)}>
                          <ChangeSuggestionCard suggestion={suggestion} index={index} />
                        </Animated.View>
                      ))}
                    </View>
                  )}

                  {/* Smart Suggestions */}
                  {result.smartSuggestions && result.smartSuggestions.length > 0 && (
                    <View className="gap-3 mt-4 pt-4 border-t border-border">
                      <View>
                        <Text className="text-sm font-semibold text-primary">اقتراحات ذكية</Text>
                        <Text className="text-xs text-muted mt-1">يمكنك إضافة مبلغ إضافي للحصول على فئات أفضل</Text>
                      </View>
                      {result.smartSuggestions.map((suggestion, index) => (
                        <Animated.View key={suggestion.id} entering={SlideInUp.delay((result.suggestions.length + index) * 100)}>
                          <SmartSuggestionCard suggestion={suggestion} />
                        </Animated.View>
                      ))}
                    </View>
                  )}

                  {/* No Change */}
                  {result.suggestions.length === 0 && (!result.smartSuggestions || result.smartSuggestions.length === 0) && (
                    <View className="bg-surface rounded-lg p-4 border border-border">
                      <Text className="text-center text-muted">لا يوجد ترجيع</Text>
                    </View>
                  )}
                </View>
              </Animated.View>
            )}
          </View>
        </ScrollView>
      ) : (
        /* History Tab */
        <View className="flex-1">
          {history.length === 0 ? (
            <View className="flex-1 items-center justify-center p-4">
              <Text className="text-muted text-center">لا توجد عمليات محفوظة بعد</Text>
            </View>
          ) : (
            <View className="flex-1">
              <FlatList
                data={history}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <HistoryItem item={item} onDelete={() => deleteRecord(item.id)} />}
                contentContainerStyle={{ padding: 16, gap: 12 }}
              />
              <Pressable
                onPress={clearHistory}
                className="bg-error/10 border border-error rounded-lg m-4 py-2 px-4 items-center"
              >
                <Text className="text-error font-semibold">حذف السجل كاملاً</Text>
              </Pressable>
            </View>
          )}
        </View>
      )}
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
          <View className="bg-background rounded-lg p-3 items-center border border-border dark:border-border/50">
            <CurrencyImageGroup denominations={suggestion.newDenominations} type="new" />
          </View>
        </View>
      )}

      {suggestion.oldDenominations.length > 0 && (
        <View className="gap-3">
          <View>
            <Text className="text-xs font-semibold text-primary">عملة قديمة:</Text>
          </View>
          <View className="bg-background rounded-lg p-3 items-center border border-border dark:border-border/50">
            <CurrencyImageGroup denominations={suggestion.oldDenominations} type="old" />
          </View>
        </View>
      )}
    </View>
  );
}

function SmartSuggestionCard({ suggestion }: { suggestion: any }) {
  return (
    <View className="bg-primary/5 rounded-lg p-4 border border-primary/30 gap-4">
      <View className="gap-1">
        <Text className="text-sm font-semibold text-primary">{suggestion.description}</Text>
        <Text className="text-xs text-muted">
          إجمالي الترجيع: {formatNumber(suggestion.newTotalChange)} ليرة جديدة ({formatNumber(suggestion.oldTotalChange)} قديمة)
        </Text>
      </View>

      {suggestion.newDenominations.length > 0 && (
        <View className="gap-2">
          <Text className="text-xs font-semibold text-primary">ستحصل على:</Text>
          <View className="bg-background rounded-lg p-3 items-center border border-border/50">
            <CurrencyImageGroup denominations={suggestion.newDenominations} type="new" />
          </View>
        </View>
      )}

      {suggestion.oldDenominations.length > 0 && (
        <View className="gap-2">
          <Text className="text-xs font-semibold text-primary">ستحصل على:</Text>
          <View className="bg-background rounded-lg p-3 items-center border border-border/50">
            <CurrencyImageGroup denominations={suggestion.oldDenominations} type="old" />
          </View>
        </View>
      )}
    </View>
  );
}

function HistoryItem({ item, onDelete }: { item: CalculationRecord; onDelete: () => void }) {
  const date = new Date(item.timestamp);
  const timeStr = date.toLocaleTimeString("ar-SY", { hour: "2-digit", minute: "2-digit" });
  const dateStr = date.toLocaleDateString("ar-SY");

  return (
    <Animated.View entering={FadeIn}>
      <View className="bg-surface rounded-lg p-4 border border-border gap-3">
        <View className="flex-row justify-between items-start">
          <View className="flex-1 gap-2">
            <Text className="text-xs text-muted">
              {dateStr} - {timeStr}
            </Text>
            <View className="gap-1">
              <Text className="text-sm text-foreground">
                السعر: <Text className="font-semibold">{formatNumber(item.priceInNew)}</Text> ليرة جديدة
              </Text>
              <Text className="text-sm text-foreground">
                المدفوع: <Text className="font-semibold">{formatNumber(item.paidAmount)}</Text> ليرة{" "}
                {item.paymentCurrency === "new" ? "جديدة" : "قديمة"}
              </Text>
              <Text className="text-sm text-primary font-semibold">
                الفرق: {formatNumber(item.changeInNew)} ليرة جديدة
              </Text>
            </View>
          </View>
          <Pressable onPress={onDelete} className="p-2">
            <Text className="text-error text-lg">✕</Text>
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}
