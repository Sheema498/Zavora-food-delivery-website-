import { describe, it, expect } from 'vitest';
import { generateToken, verifyToken } from '../utils/jwt.utils.js';
import { AuthUserPayload } from '../types/index.js';

describe('Auth & JWT Utilities', () => {
  it('should sign and accurately verify a valid JWT token payload', () => {
    const payload: AuthUserPayload = {
      userId: 'test-user-123',
      email: 'customer@test.com',
      role: 'CUSTOMER',
      name: 'Test Customer',
    };

    const token = generateToken(payload);
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(20);

    const verified = verifyToken(token);
    expect(verified.userId).toBe(payload.userId);
    expect(verified.email).toBe(payload.email);
    expect(verified.role).toBe(payload.role);
    expect(verified.name).toBe(payload.name);
  });

  it('should throw or reject invalid / tampered JWT token', () => {
    const invalidToken = 'ey12345.tamperedpayload.signature';
    expect(() => verifyToken(invalidToken)).toThrow();
  });
});
