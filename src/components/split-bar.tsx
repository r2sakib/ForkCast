// components/split-bar.tsx
// A horizontal bar split into green (used) and red (wasted) by proportion.
import { StyleSheet, View } from "react-native";
import { EXPIRY_COLOURS } from "@/constants/food";
import { useAppTheme } from "@/hooks/use-app-theme";

interface SplitBarProps {
  used: number;
  wasted: number;
  height?: number;
}

export default function SplitBar({ used, wasted, height = 14 }: SplitBarProps) {
  const { colors } = useAppTheme();
  const total = used + wasted;

  return (
    <View
      style={[styles.track, { height, borderRadius: height / 2, backgroundColor: colors.border }]}
    >
      {/* flex = the share of the bar: used 3 and wasted 1 -> 75 % green, 25 % red */}
      {used > 0 ? <View style={{ flex: used, backgroundColor: EXPIRY_COLOURS.green.text }} /> : null}
      {wasted > 0 ? (
        <View style={{ flex: wasted, backgroundColor: EXPIRY_COLOURS.red.text }} />
      ) : null}
      {total === 0 ? <View style={{ flex: 1 }} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: "row", overflow: "hidden" },
});
