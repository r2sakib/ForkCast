// utils/errors.ts
import axios from "axios";

// Turns any error into one readable sentence for the screen.
export function getErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again."
): string {
  if (axios.isAxiosError(error)) {
    // No response at all = the phone could not reach the API
    if (!error.response) {
      return "Cannot reach the server. Check your Wi-Fi and the API address.";
    }
    // NestJS sends { statusCode, message, error }; message can be a string or a list
    const message = (error.response.data as { message?: string | string[] } | undefined)?.message;
    if (Array.isArray(message)) return message.join("\n");
    if (typeof message === "string") return message;
  }
  return fallback;
}

// HTTP status of a failed request (400, 401, 409 ...) or undefined
export function getStatus(error: unknown): number | undefined {
  return axios.isAxiosError(error) ? error.response?.status : undefined;
}
