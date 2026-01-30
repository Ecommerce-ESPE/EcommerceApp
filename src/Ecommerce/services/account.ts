import { API_BASE } from "./api";

const getToken = (overrideToken?: string) =>
  overrideToken ||
  localStorage.getItem("token") ||
  sessionStorage.getItem("token") ||
  "";

const fetchJson = async (url: string, token?: string) => {
  const response = await fetch(url, {
    headers: token ? { "x-token": token } : undefined,
  });
  const data = await response.json();
  if (!response.ok) {
    const message = data?.msg || data?.message || "Error al cargar datos";
    throw new Error(message);
  }
  return data;
};

const extractWallet = (data: any) => {
  if (!data || typeof data !== "object") return null;
  const direct = data.wallet || data.billetera || data?.data?.wallet || data?.data?.billetera;
  if (direct) return direct;
  if (data.balance != null || data.amount != null || data.credits != null) return data;
  if (data.data && (data.data.balance != null || data.data.amount != null || data.data.credits != null)) {
    return data.data;
  }
  return null;
};

const toCurrency = (value: any) => Number(value || 0);

export const getProfile = async (overrideToken?: string) => {
  const token = getToken(overrideToken);
  const data = await fetchJson(`${API_BASE}/user/my-profile`, token);
  const user = data.usuario || data.user || data.data?.usuario || data.data;
  return {
    id: user?.uid || user?._id,
    name: user?.name || user?.nombre,
    email: user?.email,
    phone: user?.phone || user?.telefono || "",
    avatarUrl: user?.profileUrl || user?.perfil || "",
    role: user?.role || "Cliente",
    joinedAt: user?.createdAt || "",
    address: user?.address || [],
  };
};

export const getAddresses = async (overrideToken?: string) => {
  const profile = await getProfile(overrideToken);
  const addresses = Array.isArray(profile.address) ? profile.address : [];
  return addresses.map((addr: any, index: number) => ({
    id: addr.id || addr._id || `addr_${index + 1}`,
    label: addr.label || `Direccion ${index + 1}`,
    name: addr.name || profile.name || "",
    street: addr.directionPrincipal || addr.callePrincipal || "",
    city: addr.canton || "",
    state: addr.provincia || "",
    parish: addr.parroquia || "",
    postalCode: addr.codepostal || "",
    phone: addr.telefono || "",
    isDefault: Boolean(addr.isPrimary ?? addr.isDefault ?? index === 0),
  }));
};

export const setPrimaryAddress = async (index: number, overrideToken?: string) => {
  const token = getToken(overrideToken);
  const response = await fetch(`${API_BASE}/user/address/primary`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "x-token": token } : {}),
    },
    body: JSON.stringify({ index }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.message || data?.msg || "No se pudo actualizar la dirección principal";
    throw new Error(message);
  }
  return data;
};

export const getAddressSummary = async (overrideToken?: string) => {
  const token = getToken(overrideToken);
  const data = await fetchJson(`${API_BASE}/address/summary`, token);
  return data;
};

export const getShippingLocations = async () => {
  const data = await fetchJson(`${API_BASE}/config/shipping-addresses`);
  return data;
};

export const getWalletSummary = async (overrideToken?: string) => {
  const token = getToken(overrideToken);
  const data = await fetchJson(`${API_BASE}/wallet/summary`, token);
  const wallet = extractWallet(data) || data || {};
  return {
    balance: toCurrency(wallet.balance ?? wallet.amount ?? wallet.credits),
    creditedMonth: toCurrency(wallet.rechargedThisMonth ?? wallet.creditedThisMonth ?? 0),
    spentMonth: toCurrency(wallet.spentThisMonth ?? 0),
    netThisMonth: toCurrency(wallet.netThisMonth ?? 0),
    rechargedCountThisMonth: wallet.rechargedCountThisMonth ?? 0,
    spentCountThisMonth: wallet.spentCountThisMonth ?? 0,
    rechargedLastMonth: toCurrency(wallet.rechargedLastMonth ?? 0),
    spentLastMonth: toCurrency(wallet.spentLastMonth ?? 0),
    netLastMonth: toCurrency(wallet.netLastMonth ?? 0),
    rechargedChangePercent: wallet.rechargedChangePercent ?? 0,
    spentChangePercent: wallet.spentChangePercent ?? 0,
    netChangePercent: wallet.netChangePercent ?? 0,
    monthRange: wallet.monthRange ?? null,
    previousMonthRange: wallet.previousMonthRange ?? null,
  };
};

export const getDashboardActivity = async (
  overrideToken?: string,
  page = 1,
  limit = 6
) => {
  const token = getToken(overrideToken);
  const response = await fetch(
    `${API_BASE}/dashboard/activity?page=${page}&limit=${limit}`,
    {
      headers: token ? { "x-token": token } : undefined,
    }
  );
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.message || data?.msg || "No se pudo cargar la actividad reciente";
    throw new Error(message);
  }
  return data;
};

export const getWalletMovements = async (
  overrideToken?: string,
  limit = 20,
  skip = 0
) => {
  const token = getToken(overrideToken);
  const data = await fetchJson(
    `${API_BASE}/wallet/me/transactions?limit=${limit}&skip=${skip}`,
    token
  );
  const items = data.transactions || data.data?.transactions || data.items || [];
  return items.map((tx: any, index: number) => {
    const rawAmount = toCurrency(
      tx.amountCents != null ? Number(tx.amountCents) / 100 : tx.amount
    );
    const signedAmount = tx.type === "debit" ? -rawAmount : rawAmount;
    return {
    localKey: `${tx._id || tx.id || tx.createdAt || "tx"}_${index}`,
    date: tx.createdAt || tx.date,
    type:
      tx.type === "credit"
        ? "Recarga"
        : tx.type === "debit"
        ? "Compra"
        : tx.type || tx.kind || tx.action || "Movimiento",
    amount: signedAmount,
    status: tx.status || "Completado",
    balance: toCurrency(
      tx.balanceAfterCents != null ? Number(tx.balanceAfterCents) / 100 : tx.balanceAfter
    ),
    };
  });
};

export const redeemWalletCode = async (code: string, overrideToken?: string) => {
  const token = getToken(overrideToken);
  const response = await fetch(`${API_BASE}/wallet/redeem`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "x-token": token } : {}),
    },
    body: JSON.stringify({ code }),
  });
  let data: any = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }
  if (!response.ok) {
    const message = data?.message || data?.msg || "Error al canjear el codigo";
    const error: any = new Error(message);
    error.data = data;
    throw error;
  }
  return data;
};

export const getOrders = async (
  overrideToken?: string,
  page = 1,
  filter = "all"
) => {
  const token = getToken(overrideToken);
  const data = await fetchJson(
    `${API_BASE}/transaction?page=${page}&filter=${filter}`,
    token
  );
  const transactions = data.transactions || data.data?.transactions || [];
  return {
    items: transactions.map((order: any) => ({
      id: order._id,
      code: order.gatewayTransactionId || order._id?.substring(0, 8),
      date: order.createdAt,
      total: toCurrency(order.amount),
      status: order.status || "pending",
      items: order.items?.length || order.products?.length || 0,
    })),
    totalPages: data.totalPages || 1,
  };
};

export const getOrderById = async (overrideToken: string | undefined, id: string) => {
  const token = getToken(overrideToken);
  const data = await fetchJson(`${API_BASE}/transaction/order/${id}`, token);
  return data.order || data.data?.order || data;
};
