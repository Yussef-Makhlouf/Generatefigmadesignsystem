// Mock data utilities for La3efo platform

export const formatArabicNumber = (num: number): string => {
  return num.toLocaleString('ar-SA');
};

export const formatTimestamp = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'الآن';
  if (diffInSeconds < 3600) return `منذ ${Math.floor(diffInSeconds / 60)} دقيقة`;
  if (diffInSeconds < 86400) return `منذ ${Math.floor(diffInSeconds / 3600)} ساعة`;
  if (diffInSeconds < 604800) return `منذ ${Math.floor(diffInSeconds / 86400)} يوم`;
  if (diffInSeconds < 2592000) return `منذ ${Math.floor(diffInSeconds / 604800)} أسبوع`;
  return `منذ ${Math.floor(diffInSeconds / 2592000)} شهر`;
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export { getCategoryDotClass as getCategoryColor } from "../../lib/categories";

// Reputation tier calculator
export const getReputationTier = (points: number) => {
  if (points < 100) return { name: 'مبتدئ', color: 'gray' };
  if (points < 500) return { name: 'نشط', color: 'blue' };
  if (points < 1000) return { name: 'متميز', color: 'purple' };
  if (points < 5000) return { name: 'خبير', color: 'teal' };
  return { name: 'أسطورة', color: 'amber' };
};
