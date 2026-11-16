// app/(auth)/login.tsx
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import AppButton from "@/components/app-button";
import AuthBackground from "@/components/auth-background";
import FormField from "@/components/form-field";
import { Palette } from "@/constants/palette";
import { useAuth } from "@/context/auth-context";
import { getErrorMessage, getStatus } from "@/utils/errors";
import { LoginData, LoginErrors, validateLogin } from "@/utils/validation";

export default function LoginScreen() {
  const { login } = useAuth();

  // Combined state for the field values (Week 4)
  const [formData, setFormData] = useState<LoginData>({ email: "", password: "" });
  // Separate state for everything that is not a field value
  const [errors, setErrors] = useState<LoginErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const updateField = (field: keyof LoginData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setServerError(null); // the user is typing again: hide the old server message
  };

  const markTouched = (field: keyof LoginData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Live validation: runs again every time formData changes
  useEffect(() => {
    setErrors(validateLogin(formData));
  }, [formData]);

  // Show an error only after the field was touched OR Submit was pressed
  const getFieldError = (field: keyof LoginErrors) =>
    touched[field] || submitAttempted ? errors[field] : undefined;

  const isFormValid = Object.keys(errors).length === 0;

  const handleSubmit = async () => {
    setSubmitAttempted(true);
    if (!isFormValid) return;

    setIsSubmitting(true);
    setServerError(null);
    try {
      await login(formData.email.trim().toLowerCase(), formData.password);
      // Success: the route guard in app/_layout.tsx now moves us to the tabs.
      // This screen disappears, so we do NOT call setIsSubmitting(false) here.
    } catch (error) {
      setServerError(
        getStatus(error) === 401 ? "Wrong email or password." : getErrorMessage(error)
      );
      setIsSubmitting(false);
    }
  };

  return (
    <AuthBackground>
      <Text style={styles.title}>Log In</Text>
      <View style={styles.titleLine} />

      <FormField
        variant="auth"
        label="Email"
        value={formData.email}
        onChangeText={(text) => updateField("email", text)}
        onBlur={() => markTouched("email")}
        error={getFieldError("email")}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <FormField
        variant="auth"
        label="Password"
        value={formData.password}
        onChangeText={(text) => updateField("password", text)}
        onBlur={() => markTouched("password")}
        error={getFieldError("password")}
        secureTextEntry
        autoCapitalize="none"
      />

      {serverError ? <Text style={styles.serverError}>{serverError}</Text> : null}

      <View style={styles.submit}>
        <AppButton title="LOG IN" variant="dark" onPress={handleSubmit} loading={isSubmitting} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Don&apos;t have an account?</Text>
        <Pressable style={styles.linkButton} onPress={() => router.replace("/register")}>
          <Text style={styles.linkText}>Sign Up</Text>
        </Pressable>
      </View>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 34, fontWeight: "900", color: Palette.secondary, textAlign: "center" },
  titleLine: {
    height: 4,
    backgroundColor: Palette.secondary,
    borderRadius: 2,
    marginTop: 6,
    marginBottom: 24,
  },
  serverError: {
    color: "#7F1D1D",
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
  },
  submit: { marginTop: 6 },
  footer: { alignItems: "center", marginTop: 18 },
  footerText: { color: Palette.secondary, fontWeight: "700", fontSize: 13 },
  linkButton: {
    marginTop: 8,
    backgroundColor: Palette.accent,
    borderColor: Palette.secondary,
    borderWidth: 2,
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  linkText: { color: Palette.primary, fontWeight: "900", fontSize: 16 },
});
