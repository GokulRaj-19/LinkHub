// Mock API Client wrapper simulating network latency and REST semantics
import { initSeedData } from '../mock/seed';

// Ensure storage is initialized
initSeedData();

export const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

export const getCollection = (collectionName) => {
  const data = localStorage.getItem(`linkhub_${collectionName}`);
  return data ? JSON.parse(data) : [];
};

export const saveCollection = (collectionName, data) => {
  localStorage.setItem(`linkhub_${collectionName}`, JSON.stringify(data));
};

export const logAudit = (userId, action, targetType, targetId, details = {}) => {
  const logs = getCollection('audit_logs');
  const newLog = {
    id: Date.now(),
    user_id: userId,
    action,
    target_type: targetType,
    target_id: String(targetId),
    ip_address: '127.0.0.1',
    details,
    created_at: new Date().toISOString(),
  };
  logs.unshift(newLog);
  saveCollection('audit_logs', logs);
};

// Generic mock request helper
export async function mockRequest(fn) {
  await delay(120);
  try {
    return await fn();
  } catch (error) {
    throw new Error(error.message || 'API request failed');
  }
}
