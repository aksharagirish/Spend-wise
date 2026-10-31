import React from 'react';
import {
  Briefcase,
  Laptop,
  TrendingUp,
  Gift,
  DollarSign,
  Home,
  ShoppingCart,
  Utensils,
  Car,
  Zap,
  ShoppingBag,
  Film,
  HeartPulse,
  Smartphone,
  Plane,
  GraduationCap,
  Coffee,
  Tag,
  CreditCard,
  Building,
  HelpCircle,
} from 'lucide-react';

export const ICON_MAP: Record<string, React.ElementType> = {
  Briefcase,
  Laptop,
  TrendingUp,
  Gift,
  DollarSign,
  Home,
  ShoppingCart,
  Utensils,
  Car,
  Zap,
  ShoppingBag,
  Film,
  HeartPulse,
  Smartphone,
  Plane,
  GraduationCap,
  Coffee,
  Tag,
  CreditCard,
  Building,
};

export const getCategoryIcon = (iconName: string, className = 'w-4 h-4'): React.ReactNode => {
  const IconComponent = ICON_MAP[iconName] || Tag || HelpCircle;
  return <IconComponent className={className} />;
};

export const AVAILABLE_ICONS = Object.keys(ICON_MAP);
