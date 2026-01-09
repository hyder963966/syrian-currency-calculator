import { View } from "react-native";

/**
 * مكون الفسيفساء الذهبية الدمشقية
 * نمط ناعم وجميل متدرج الشفافية بشكل قطري
 */
export function DamascusPattern() {
  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.12,
        pointerEvents: "none",
        backgroundColor: "transparent",
        overflow: "hidden",
      }}
    >
      {/* النمط الأساسي - خطوط قطرية ذهبية */}
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
            transparent 15px,
            rgba(212, 175, 55, 0.25) 15px,
            rgba(212, 175, 55, 0.25) 18px,
            transparent 18px,
            transparent 30px
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
            transparent 0px,
            transparent 25px,
            rgba(212, 175, 55, 0.15) 25px,
            rgba(212, 175, 55, 0.15) 27px,
            transparent 27px,
            transparent 50px
          )`,
        }}
      />

      {/* الطبقة الثالثة - نقاط ذهبية صغيرة */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `radial-gradient(
            circle,
            rgba(212, 175, 55, 0.2) 1.5px,
            transparent 1.5px
          )`,
          backgroundSize: "40px 40px",
          backgroundPosition: "0 0, 20px 20px",
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
