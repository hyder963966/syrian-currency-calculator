import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface CalculationRecord {
  id: string;
  priceInNew: number;
  paidAmount: number;
  paymentCurrency: "new" | "old";
  changeInNew: number;
  changeInOld: number;
  timestamp: number;
}

const STORAGE_KEY = "calculation_history";
const MAX_RECORDS = 50;

/**
 * Hook لإدارة سجل العمليات الحسابية
 */
export function useCalculationHistory() {
  const [history, setHistory] = useState<CalculationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // تحميل السجل من التخزين المحلي
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const records = JSON.parse(stored) as CalculationRecord[];
        setHistory(records);
      }
    } catch (error) {
      console.error("خطأ في تحميل السجل:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addRecord = async (record: Omit<CalculationRecord, "id" | "timestamp">) => {
    try {
      const newRecord: CalculationRecord = {
        ...record,
        id: Date.now().toString(),
        timestamp: Date.now(),
      };

      const updated = [newRecord, ...history].slice(0, MAX_RECORDS);
      setHistory(updated);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return newRecord;
    } catch (error) {
      console.error("خطأ في حفظ السجل:", error);
    }
  };

  const clearHistory = async () => {
    try {
      setHistory([]);
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("خطأ في حذف السجل:", error);
    }
  };

  const deleteRecord = async (id: string) => {
    try {
      const updated = history.filter((r) => r.id !== id);
      setHistory(updated);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error("خطأ في حذف السجل:", error);
    }
  };

  return {
    history,
    isLoading,
    addRecord,
    clearHistory,
    deleteRecord,
    loadHistory,
  };
}
