// Allows themed coloring for IconSymbol

import { useThemeColor } from "@/src/hooks/useThemeColor";
import type { ColorName } from "@/src/hooks/useThemeColor";
import React, { ReactNode } from 'react';

type ThemeWrapperProps = {
  lightColor: string;
  darkColor: string;
  colorName: ColorName
  children: (color: string) => ReactNode;
};

export const ThemeWrapper: React.FC<ThemeWrapperProps> = ({
  lightColor,
  darkColor,
  colorName,
  children,
}) => {
  const realColor = useThemeColor({ light: lightColor, dark: darkColor }, colorName);
  return children(realColor)
};
