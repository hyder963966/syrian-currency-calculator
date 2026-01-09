import { View } from "react-native";
import { useColors } from "@/hooks/use-colors";

/**
 * مكون الفسيفساء الذهبية الدمشقية
 * يعرض نمط متدرج الشفافية بشكل قطري
 */
export function DamascusPattern() {
  const colors = useColors();

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.08,
        pointerEvents: "none",
        backgroundColor: "transparent",
      }}
    >
      {/* النمط الأساسي - خطوط قطرية */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 35px,
            rgba(212, 175, 55, 0.15) 35px,
            rgba(212, 175, 55, 0.15) 70px
          )`,
        }}
      />

      {/* الطبقة الثانية - خطوط قطرية معاكسة */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 50px,
            rgba(212, 175, 55, 0.08) 50px,
            rgba(212, 175, 55, 0.08) 100px
          )`,
        }}
      />
    </View>
  );
}

/**
 * مكون خلفية مع الفسيفساء الذهبية
 */
export function DamascusPatternBackground({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <View className={className} style={{ position: "relative", overflow: "hidden" }}>
      <DamascusPattern />
      <View style={{ position: "relative", zIndex: 1 }}>{children}</View>
    </View>
  );
}
