export const buildOrdersQuery = ({
  page,
  limit,
  status,
  paymentStatus,
  from,
  to,
  q,
  paymentMethod,
}) => {
  const params = new URLSearchParams();
  if (page) params.set("page", String(page));
  if (limit) params.set("limit", String(limit));
  if (status) params.set("status", status);
  if (paymentStatus) params.set("paymentStatus", paymentStatus);
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  if (q) params.set("q", q);
  if (paymentMethod) params.set("paymentMethod", paymentMethod);
  const query = params.toString();
  return query ? `?${query}` : "";
};

export const normalizeOrdersResponse = (response) => {
  const directData = response?.data ?? response?.items ?? null;
  const okData = response?.ok ? response?.data : null;
  const rows = Array.isArray(directData)
    ? directData
    : Array.isArray(okData)
    ? okData
    : Array.isArray(response?.items)
    ? response.items
    : [];
  const page =
    response?.page ?? response?.pagination?.page ?? response?.meta?.page ?? 1;
  const limit =
    response?.limit ??
    response?.pagination?.limit ??
    response?.meta?.limit ??
    (rows.length || 10);
  const total =
    response?.total ?? response?.pagination?.total ?? response?.meta?.total ?? null;
  let totalPages =
    response?.totalPages ??
    response?.pagination?.totalPages ??
    response?.meta?.totalPages ??
    null;

  if (!totalPages && total != null && limit) {
    totalPages = Math.ceil(total / limit);
  }

  if (!totalPages) {
    totalPages = page || 1;
  }

  return {
    rows,
    page: Number(page) || 1,
    limit: Number(limit) || 10,
    total: total != null ? Number(total) : null,
    totalPages: Number(totalPages) || 1,
  };
};

export const formatDate = (value, includeTime = false) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("es-EC", {
    dateStyle: "medium",
    ...(includeTime ? { timeStyle: "short" } : {}),
  }).format(date);
};

export const formatMoney = (value) =>
  new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
  }).format(Number(value || 0));

export const getOrderNumber = (order) => {
  if (!order) return "-";
  const number = order.orderNumber || order.number || order.code;
  if (number) return String(number);
  const rawId = order._id || order.id || "";
  if (!rawId) return "-";
  return rawId.slice(-6);
};

export const getOrderId = (order) => order?._id || order?.id || "";

export const getOrderStatus = (order) =>
  order?.orderStatus || order?.status || order?.shippingStatus || "";

export const getPaymentStatus = (order) =>
  order?.paymentStatus || order?.transaction?.status || order?.payment?.status || "";

export const getPaymentMethod = (order) =>
  order?.paymentMethod || order?.payment?.method || order?.transaction?.method || "";
