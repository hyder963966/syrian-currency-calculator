import { View } from "react-native";
import { useColors } from "@/hooks/use-colors";

/**
 * مكون الفسيفساء الذهبية الدمشقية
 * يعرض نمط ناعم وجميل متدرج الشفافية بشكل قطري
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
        opacity: 0.06,
        pointerEvents: "none",
        backgroundColor: "transparent",
        overflow: "hidden",
      }}
    >
      {/* النمط الأساسي - خطوط قطرية ناعمة */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent 0px,
            transparent 20px,
            rgba(212, 175, 55, 0.12) 20px,
            rgba(212, 175, 55, 0.12) 22px,
            transparent 22px,
            transparent 40px
          )`,
        }}
      />

      {/* الطبقة الثانية - خطوط قطرية معاكسة أرق */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `repeating-linear-gradient(
            -45deg,
            transparent 0px,
            transparent 30px,
            rgba(212, 175, 55, 0.08) 30px,
            rgba(212, 175, 55, 0.08) 31px,
            transparent 31px,
            transparent 60px
          )`,
        }}
      />

      {/* الطبقة الثالثة - نقاط صغيرة موزعة */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `radial-gradient(
            circle,
            rgba(212, 175, 55, 0.1) 1px,
            transparent 1px
          )`,
          backgroundSize: "50px 50px",
          backgroundPosition: "0 0, 25px 25px",
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
