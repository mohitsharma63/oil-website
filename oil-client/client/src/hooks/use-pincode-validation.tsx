import { useState, useCallback } from 'react';
import { useCart } from './use-cart';

interface ValidationResult {
  serviceable: boolean;
  shippingCharge: number;
  message: string;
  estimatedDelivery: string;
  cityStateValid?: boolean;
}

export function usePincodeValidation() {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { items } = useCart();

  // Calculate total weight of cart items
  const calculateCartWeight = useCallback(() => {
    // Default weight per item if not specified (in kg)
    const defaultWeightPerItem = 0.5;
    
    const totalWeight = items.reduce((sum, item) => {
      const itemWeight = (item.product as any)?.weight || defaultWeightPerItem;
      return sum + (itemWeight * (item.quantity || 1));
    }, 0);
    
    return Math.max(totalWeight, 0.1); // Minimum 0.1kg
  }, [items]);

  // Calculate total MRP of cart items
  const calculateCartMrp = useCallback(() => {
    const totalMrp = items.reduce((sum, item) => {
      const itemPrice = toNumber(item.product.price);
      return sum + (itemPrice * (item.quantity || 1));
    }, 0);
    
    return totalMrp;
  }, [items]);

  const validatePincode = useCallback(async (
    pincode: string, 
    city?: string, 
    state?: string,
    isCod: boolean = false
  ) => {
    if (!pincode || pincode.length !== 6) {
      setError('Please enter a valid 6-digit pincode');
      return null;
    }

    setIsValidating(true);
    setError(null);

    try {
      const weight = calculateCartWeight();
      const productMrp = calculateCartMrp();
      
      // Call the backend API with dynamic parameters
      const response = await fetch(
        `/api/shipping/ithink/serviceability?deliveryPincode=${pincode}&weight=${weight}&cod=${isCod}&productMrp=${productMrp}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Handle the response format from the backend
      const result: ValidationResult = {
        serviceable: data.status || false,
        shippingCharge: data.shippingCharge || (data.status ? 0 : 99),
        message: data.message || 'Serviceability check completed',
        estimatedDelivery: data.estimated_delivery || '3-5 business days',
        cityStateValid: true
      };

      setValidationResult(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to validate pincode';
      setError(errorMessage);
      
      // Return fallback result for manual delivery
      const fallbackResult: ValidationResult = {
        serviceable: false,
        shippingCharge: 99,
        message: 'Manual delivery applicable (API unavailable)',
        estimatedDelivery: '5-7 business days',
        cityStateValid: true
      };
      
      setValidationResult(fallbackResult);
      return fallbackResult;
    } finally {
      setIsValidating(false);
    }
  }, [calculateCartWeight, calculateCartMrp]);

  const clearValidation = useCallback(() => {
    setValidationResult(null);
    setError(null);
    setIsValidating(false);
  }, []);

  return {
    validatePincode,
    isValidating,
    validationResult,
    error,
    clearValidation,
    cartWeight: calculateCartWeight(),
    cartMrp: calculateCartMrp()
  };
}

// Helper function to convert string/number to number
function toNumber(v: string | number | undefined): number {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  if (typeof v === "string") {
    const n = parseFloat(v.replace(/[^0-9.]/g, ""));
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}
