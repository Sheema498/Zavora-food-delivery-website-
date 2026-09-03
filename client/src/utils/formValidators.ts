/**
 * Zavora Client Form Validation Suite
 * Strictly validates emails, Indian mobile numbers (+91), 6-digit postal PIN codes,
 * UPI payment handles, and dish dietary constraints.
 */

export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

export class FormValidators {
  /**
   * Validate Indian 10-digit mobile number (with optional +91 or 0 prefix)
   */
  public static validateIndianPhone(phone: string): ValidationResult {
    if (!phone || !phone.trim()) {
      return { isValid: false, errorMessage: 'Phone number is required' };
    }
    const clean = phone.replace(/[\s\-()]/g, '');
    const regex = /^(?:\+91|0)?[6-9]\d{9}$/;
    if (!regex.test(clean)) {
      return {
        isValid: false,
        errorMessage: 'Enter a valid 10-digit mobile number starting with 6, 7, 8, or 9',
      };
    }
    return { isValid: true };
  }

  /**
   * Validate Indian 6-digit PIN code
   */
  public static validatePinCode(pin: string): ValidationResult {
    if (!pin || !pin.trim()) {
      return { isValid: false, errorMessage: 'PIN Code is required' };
    }
    const clean = pin.trim();
    const regex = /^[1-9][0-9]{5}$/;
    if (!regex.test(clean)) {
      return { isValid: false, errorMessage: 'Enter a valid 6-digit postal PIN code' };
    }
    return { isValid: true };
  }

  /**
   * Validate standard email address
   */
  public static validateEmail(email: string): ValidationResult {
    if (!email || !email.trim()) {
      return { isValid: false, errorMessage: 'Email address is required' };
    }
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email.trim())) {
      return { isValid: false, errorMessage: 'Enter a valid email address' };
    }
    return { isValid: true };
  }

  /**
   * Validate UPI Virtual Payment Address (e.g. user@okaxis, shop@icici)
   */
  public static validateUpiId(upi: string): ValidationResult {
    if (!upi || !upi.trim()) {
      return { isValid: false, errorMessage: 'UPI ID is required' };
    }
    const regex = /^[\w.\-_]{2,256}@[a-zA-Z]{2,64}$/;
    if (!regex.test(upi.trim())) {
      return { isValid: false, errorMessage: 'Enter a valid UPI ID (e.g. name@okhdfcbank)' };
    }
    return { isValid: true };
  }
}
