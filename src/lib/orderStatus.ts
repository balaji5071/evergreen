import type { OrderStatus } from "@/lib/models/Order";

const allowedStatuses = new Set<OrderStatus>([
  "Placed",
  "Accepted",
  "Preparing",
  "Ready",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
]);

const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  Placed: ["Accepted", "Cancelled"],
  Accepted: ["Preparing", "Cancelled"],
  Preparing: ["Ready", "Cancelled"],
  Ready: ["Out for Delivery", "Cancelled"],
  "Out for Delivery": ["Delivered", "Cancelled"],
  Delivered: [],
  Cancelled: [],
};

export function isValidOrderStatus(status: unknown): status is OrderStatus {
  return typeof status === "string" && allowedStatuses.has(status as OrderStatus);
}

export function canTransitionOrderStatus(current: OrderStatus, next: OrderStatus) {
  return allowedTransitions[current].includes(next);
}
