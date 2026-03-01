import { API_BASE } from "./api";

const getStoredToken = () =>
  localStorage.getItem("token") || sessionStorage.getItem("token") || "";

const createCreditsError = async (response) => {
  const data = await response.json().catch(() => ({}));

  if (response.status === 401) {
    const error = new Error("Usuario no autenticado o token invalido/expirado.");
    error.status = 401;
    throw error;
  }

  if (response.status === 403) {
    const error = new Error("No puedes usar creditos para una orden que no te pertenece.");
    error.status = 403;
    throw error;
  }

  if (response.status === 404) {
    const error = new Error("Orden no encontrada");
    error.status = 404;
    throw error;
  }

  if (response.status === 400) {
    const error = new Error(
      data?.message || data?.error || "Payload invalido o idempotencyKey faltante"
    );
    error.status = 400;
    throw error;
  }

  const error = new Error(data?.message || data?.error || "Error al procesar creditos");
  error.status = response.status;
  throw error;
};

const postCreditsRequest = async (path, payload) => {
  const token = getStoredToken();
  if (!token) {
    const error = new Error("Usuario no autenticado o token invalido/expirado.");
    error.status = 401;
    throw error;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-token": token,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    await createCreditsError(response);
  }

  return response.json();
};

export const chargeCredits = async ({
  orderId,
  amountCents,
  idempotencyKey,
  metadata,
}) =>
  postCreditsRequest("/payments/credits/charge", {
    orderId,
    amountCents,
    idempotencyKey,
    ...(metadata ? { metadata } : {}),
  });

export const refundCredits = async ({
  orderId,
  amountCents,
  idempotencyKey,
  metadata,
  reason,
}) =>
  postCreditsRequest("/payments/credits/refund", {
    orderId,
    amountCents,
    idempotencyKey,
    ...(metadata ? { metadata } : {}),
    ...(reason ? { reason } : {}),
  });
