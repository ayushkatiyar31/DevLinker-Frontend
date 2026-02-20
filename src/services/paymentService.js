import { apiRequest } from "@/lib/apiClient";

export async function createPaymentOrder(membershipType) {
  return apiRequest("/payment/create", {
    method: "POST",
    body: JSON.stringify({ membershipType }),
  });
}

export async function verifyPayment(payload) {
  return apiRequest("/payment/verify", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function verifyPremium() {
  return apiRequest("/payment/premium/verify", {
    method: "GET",
  });
}
