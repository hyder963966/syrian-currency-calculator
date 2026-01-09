import { Image, View, Text } from "react-native";
import { cn } from "@/lib/utils";

export interface CurrencyImageProps {
  denomination: number;
  type: "new" | "old";
  variant?: string;
  size?: "small" | "medium" | "large";
  count?: number;
}

const SIZE_MAP = {
  small: { width: 60, height: 40 },
  medium: { width: 80, height: 50 },
  large: { width: 120, height: 75 },
};

// خريطة الصور للعملات الجديدة
const NEW_CURRENCY_IMAGES: Record<number, any> = {
  10: require("../assets/currency/عملة جديدة/10.jpg"),
  25: require("../assets/currency/عملة جديدة/25.jpg"),
  50: require("../assets/currency/عملة جديدة/50.jpg"),
  100: require("../assets/currency/عملة جديدة/100.jpg"),
  200: require("../assets/currency/عملة جديدة/200.jpg"),
  500: require("../assets/currency/عملة جديدة/500.jpg"),
};

// خريطة الصور للعملات القديمة
const OLD_CURRENCY_IMAGES: Record<number, Record<string, any>> = {
  500: {
    default: require("../assets/currency/عملة قديمة/500.jpg"),
    variant2: require("../assets/currency/عملة قديمة/500(2).jpg"),
  },
  1000: {
    default: require("../assets/currency/عملة قديمة/1000.jpg"),
  },
  2000: {
    default: require("../assets/currency/عملة قديمة/2000.jpg"),
  },
  5000: {
    default: require("../assets/currency/عملة قديمة/5000.jpg"),
  },
};

/**
 * الحصول على صورة العملة
 */
function getCurrencyImageSource(
  denomination: number,
  type: "new" | "old",
  variant?: string
): any {
  if (type === "new") {
    return NEW_CURRENCY_IMAGES[denomination];
  } else {
    const variants = OLD_CURRENCY_IMAGES[denomination];
    if (!variants) return null;
    return variants[variant || "default"];
  }
}

/**
 * مكون لعرض صورة العملة
 */
export function CurrencyImage({
  denomination,
  type,
  variant,
  size = "medium",
  count = 1,
}: CurrencyImageProps) {
  const imageSource = getCurrencyImageSource(denomination, type, variant);
  
  if (!imageSource) {
    return null;
  }

  const dimensions = SIZE_MAP[size];

  return (
    <View className="items-center gap-1">
      <Image
        source={imageSource}
        style={{
          width: dimensions.width,
          height: dimensions.height,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: "#d4d8d7",
        }}
        resizeMode="cover"
      />
      {count > 1 && (
        <View className="bg-primary rounded-full px-2 py-1">
          <Text className="text-white text-xs font-bold text-center">
            {count}x
          </Text>
        </View>
      )}
    </View>
  );
}

/**
 * مكون لعرض مجموعة من صور العملات
 */
export function CurrencyImageGroup({
  denominations,
  type,
}: {
  denominations: { denomination: number; count: number; imageVariant?: string }[];
  type: "new" | "old";
}) {
  return (
    <View className="flex-row flex-wrap gap-3 items-center justify-center">
      {denominations.map((denom, index) => (
        <View key={`${denom.denomination}-${denom.imageVariant || 'default'}-${index}`} className="items-center gap-2">
          <CurrencyImage
            denomination={denom.denomination}
            type={type}
            variant={denom.imageVariant}
            size="medium"
            count={denom.count}
          />
          <View className="bg-primary/20 rounded px-2 py-1">
            <Text className="text-xs font-semibold text-primary text-center">
              {denom.count}x {denom.denomination}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}
