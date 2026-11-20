// constants/palette.ts
// Colours taken from the design file (Primary, Secondary, Buttons, Muted, BG 2).
// NOTE: the Expo template already has constants/theme.ts - do not overwrite it.

export const Palette = {
  primary: "#381A0B", // darkest brown
  secondary: "#613117", // text brown
  accent: "#FF7026", // buttons / highlights
  muted: "#C16A3C", // muted details
  footer: "#2A2D3F", // dark navy: footer, headers
  gold: "#D28428", // brand orange
  // The orange of the auth-pattern.png picture. It is a tiny bit different from
  // the design's D28428, so we use the picture's own colour to make the edges blend.
  authBackground: "#D78829",
};

export interface ThemeColors {
  background: string;
  surface: string;
  text: string;
  subtext: string;
  border: string;
  inputBackground: string;
  header: string;
  tint: string;
  danger: string;
}

export const LightColors: ThemeColors = {
  background: "#F7F4F0",
  surface: "#FFFFFF",
  text: Palette.primary,
  subtext: "#8A6A55",
  border: "#E8DDD3",
  inputBackground: "#F1EBE4",
  header: Palette.footer,
  tint: Palette.accent,
  danger: "#DC2626",
};

export const DarkColors: ThemeColors = {
  background: "#1B1D2B",
  surface: Palette.footer,
  text: "#F3E6D8",
  subtext: "#B9A593",
  border: "#3C4058",
  inputBackground: "#1F2132",
  header: Palette.footer,
  tint: Palette.accent,
  danger: "#F87171",
};
