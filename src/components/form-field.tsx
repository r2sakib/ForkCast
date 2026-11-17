// components/form-field.tsx
// Week 4 FormField + onBlur, secureTextEntry and an "auth" look from the design.
import { KeyboardTypeOptions, StyleSheet, Text, TextInput, View } from "react-native";
import { Palette } from "@/constants/palette";
import { useAppTheme } from "@/hooks/use-app-theme";

interface FormFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  error?: string;
  placeholder?: string;
  multiline?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  // "auth" = the brown-bordered field on the orange Login / Register screens
  variant?: "default" | "auth";
}

export default function FormField({
  label,
  value,
  onChangeText,
  onBlur,
  error,
  placeholder,
  multiline = false,
  secureTextEntry = false,
  keyboardType = "default",
  autoCapitalize = "sentences",
  variant = "default",
}: FormFieldProps) {
  const { colors } = useAppTheme();
  const isAuth = variant === "auth";

  return (
    <View style={styles.container}>
      {/* The auth design has no label above the field: the label is the placeholder */}
      {!isAuth && <Text style={[styles.label, { color: colors.text }]}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          isAuth
            ? styles.inputAuth
            : { backgroundColor: colors.inputBackground, color: colors.text },
          multiline && styles.multiline,
          !!error && styles.inputError,
        ]}
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        placeholder={placeholder ?? (isAuth ? label : undefined)}
        placeholderTextColor={isAuth ? Palette.secondary : colors.subtext}
        multiline={multiline}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
      />
      {/* Only render the error line when there is an error */}
      {error ? <Text style={[styles.errorText, isAuth && styles.errorAuth]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: "600", marginBottom: 6 },
  input: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    borderWidth: 1,
    borderColor: "transparent",
  },
  inputAuth: {
    backgroundColor: "rgba(97, 49, 23, 0.35)",
    borderColor: Palette.primary,
    borderWidth: 2,
    borderRadius: 8,
    color: Palette.primary,
    fontWeight: "700",
  },
  multiline: { minHeight: 80, textAlignVertical: "top" },
  inputError: { borderColor: "#DC2626", borderWidth: 2 },
  errorText: { fontSize: 12, color: "#DC2626", marginTop: 4 },
  errorAuth: { color: "#7F1D1D", fontWeight: "700" }, // darker red = readable on orange
});
