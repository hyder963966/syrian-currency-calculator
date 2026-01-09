import { Modal, View, Pressable, ScrollView, Text, Share } from "react-native";
import { useState } from "react";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { Image } from "expo-image";
import { useColors } from "@/hooks/use-colors";

interface ImageModalProps {
  visible: boolean;
  onClose: () => void;
  imageUri: string;
  title: string;
}

export function ImageModal({ visible, onClose, imageUri, title }: ImageModalProps) {
  const colors = useColors();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Animated.View
        entering={FadeIn}
        exiting={FadeOut}
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.9)",
          justifyContent: "center",
          alignItems: "center",
          padding: 16,
        }}
      >
        <Pressable
          onPress={onClose}
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 10,
          }}
        >
          <Text style={{ color: "white", fontSize: 24, fontWeight: "bold" }}>✕</Text>
        </Pressable>

        <View
          style={{
            width: "100%",
            maxWidth: 400,
            backgroundColor: colors.surface,
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          {/* Title */}
          <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}>
            <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground, textAlign: "center" }}>
              {title}
            </Text>
          </View>

          {/* Image */}
          <View style={{ padding: 16, alignItems: "center", justifyContent: "center" }}>
            <Image
              source={{ uri: imageUri }}
              style={{
                width: "100%",
                height: 300,
                borderRadius: 8,
              }}
              contentFit="contain"
            />
          </View>

          {/* Close Button */}
          <Pressable
            onPress={onClose}
            style={{
              padding: 12,
              backgroundColor: colors.primary,
              alignItems: "center",
              borderRadius: 8,
              margin: 16,
            }}
          >
            <Text style={{ color: "white", fontWeight: "600" }}>إغلاق</Text>
          </Pressable>
        </View>
      </Animated.View>
    </Modal>
  );
}
