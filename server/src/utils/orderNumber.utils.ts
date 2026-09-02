/**
 * Generates an easily readable, sequential-style order number (e.g., QB-8942)
 */
export const generateOrderNumber = (): string => {
  const timestampPart = Date.now().toString().slice(-4);
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `QB-${timestampPart}${randomPart.toString().slice(-2)}`;
};

/**
 * Generates a unique transaction reference for demo payment auditing
 */
export const generateTransactionRef = (): string => {
  return `TXN-DEMO-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
};
