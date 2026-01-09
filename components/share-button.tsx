import { Pressable, Text, Share, Alert, Platform } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { formatNumber } from "@/lib/currency-calculator";

interface ShareButtonProps {
  priceInNew: number;
  paidInOld: number;
  changeInNew: number;
  changeInOld: number;
}

export function ShareButton({ priceInNew, paidInOld, changeInNew, changeInOld }: ShareButtonProps) {
  const colors = useColors();

  const generateShareText = () => {
    const text = `حاسبة العملة السورية\n\nالسعر: ${formatNumber(priceInNew)} ليرة جديدة\nالمبلغ المدفوع: ${formatNumber(paidInOld)} ليرة قديمة\nالترجيع: ${formatNumber(changeInNew)} ليرة جديدة = ${formatNumber(changeInOld)} ليرة قديمة`;
    return text;
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: generateShareText(),
        title: "حاسبة العملة السورية",
        url: Platform.OS === "ios" ? undefined : generateShareText(),
      });
    } catch (error) {
      Alert.alert("خطأ", "فشل في مشاركة النتيجة");
    }
  };

  return (
    <Pressable
      onPress={handleShare}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 10,
        paddingHorizontal: 16,
        backgroundColor: colors.primary,
        borderRadius: 8,
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <Text style={{ color: "white", fontWeight: "600", fontSize: 14 }}>مشاركة</Text>
    </Pressable>
  );
}
