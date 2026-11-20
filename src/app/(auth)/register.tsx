// app/(auth)/register.tsx
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import AppButton from "@/components/app-button";
import AuthBackground from "@/components/auth-background";
import FormField from "@/components/form-field";
import { Palette } from "@/constants/palette";
import { useAuth } from "@/context/auth-context";
import { getErrorMessage, getStatus } from "@/utils/errors";
import { RegisterData, RegisterErrors, validateRegister } from "@/utils/validation";

export default function RegisterScreen() {
  const { register } = useAuth();

  const [formData, setFormData] = useState<RegisterData>({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  // 409 = email already registered. We show it under the Email field.
  const [emailTaken, setEmailTaken] = useState(false);

  const updateField = (field: keyof RegisterData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setServerError(null);
    if (field === "email") setEmailTaken(false);
  };

  const markTouched = (field: keyof RegisterData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  useEffect(() => {
    setErrors(validateRegister(formData));
  }, [formData]);

  const getFieldError = (field: keyof RegisterErrors) => {
    if (field === "email" && emailTaken) return "This email is already registered.";
    return touched[field] || submitAttempted ? errors[field] : undefined;
  };

  const isFormValid = Object.keys(errors).length === 0;

  const handleSubmit = async () => {
    setSubmitAttempted(true);
    if (!isFormValid) return;

    setIsSubmitting(true);
    setServerError(null);
    try {
      await register(formData.name.trim(), formData.email.trim().toLowerCase(), formData.password);
      // Success: the route guard moves us to the tabs automatically.
    } catch (error) {
      if (getStatus(error) === 409) {
        setEmailTaken(true);
      } else {
        setServerError(getErrorMessage(error));
      }
      setIsSubmitting(false);
    }
  };

  return (
    <AuthBackground>
      <Text style={styles.title}>Sign Up</Text>
      <View style={styles.titleLine} />

      <FormField
        variant="auth"
        label="Full Name"
        value={formData.name}
        onChangeText={(text) => updateField("name", text)}
        onBlur={() => markTouched("name")}
        error={getFieldError("name")}
        autoCapitalize="words"
      />
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
        <AppButton title="CREATE ACCOUNT" variant="dark" onPress={handleSubmit} loading={isSubmitting} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account?</Text>
        <Pressable style={styles.linkButton} onPress={() => router.replace("/login")}>
          <Text style={styles.linkText}>Log In</Text>
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
