import { INDIAN_STATES, STATE_PINCODE_RANGES, MAJOR_CITIES_PINCODES } from '@/data/indian-states-data';

export interface PincodeValidationResult {
  isValid: boolean;
  state?: string;
  city?: string;
  message?: string;
  suggestions?: string[];
  shippingCost?: number;
  deliveryDays?: { minDays: number; maxDays: number };
}

export interface AddressValidationResult {
  isValid: boolean;
  errors: {
    pincode?: string;
    state?: string;
    city?: string;
  };
  suggestions?: {
    pincode?: string[];
    state?: string[];
    city?: string[];
  };
}

class PincodeValidator {
  // Validate pincode format (5 or 6 digits)
  validatePincodeFormat(pincode: string): boolean {
    const pincodeRegex = /^[1-9][0-9]{4,5}$/;
    return pincodeRegex.test(pincode);
  }

  // Get state from pincode
  getStateFromPincode(pincode: string): string | null {
    if (!this.validatePincodeFormat(pincode)) {
      return null;
    }

    // Get first 2-3 digits to match with state prefixes
    const prefix = pincode.substring(0, 2);
    const prefix3 = pincode.substring(0, 3);

    for (const [stateCode, range] of Object.entries(STATE_PINCODE_RANGES) as [string, typeof STATE_PINCODE_RANGES[keyof typeof STATE_PINCODE_RANGES]][]) {
      if (range.prefixes.includes(prefix) || range.prefixes.includes(prefix3)) {
        const state = INDIAN_STATES.find(s => s.code === stateCode);
        return state?.name || null;
      }
    }

    return null;
  }

  // Validate pincode for a specific state
  validatePincodeForState(pincode: string, stateName: string): PincodeValidationResult {
    if (!this.validatePincodeFormat(pincode)) {
      return {
        isValid: false,
        message: "Invalid pincode format. Pincode must be 5 or 6 digits.",
        suggestions: this.getValidPincodesForState(stateName)
      };
    }

    const detectedState = this.getStateFromPincode(pincode);
    
    if (!detectedState) {
      return {
        isValid: false,
        message: "Invalid pincode. This pincode is not recognized.",
        suggestions: this.getValidPincodesForState(stateName)
      };
    }

    if (detectedState.toLowerCase() !== stateName.toLowerCase()) {
      return {
        isValid: false,
        message: `Pincode belongs to ${detectedState}, not ${stateName}.`,
        state: detectedState,
        suggestions: this.getValidPincodesForState(stateName)
      };
    }

    // Calculate shipping cost and delivery days
    const shippingCost = this.calculateShippingCost(pincode, detectedState);
    const deliveryDays = this.getDeliveryEstimate(pincode);

    return {
      isValid: true,
      state: detectedState,
      message: "Pincode is valid for the selected state.",
      shippingCost,
      deliveryDays
    };
  }

  // Get valid pincodes for a state
  getValidPincodesForState(stateName: string): string[] {
    const state = INDIAN_STATES.find(s => s.name.toLowerCase() === stateName.toLowerCase());
    if (!state) return [];

    const range = STATE_PINCODE_RANGES[state.code as keyof typeof STATE_PINCODE_RANGES];
    if (!range) return [];

    // Generate sample valid pincodes for the state
    const suggestions: string[] = [];
    
    // Add some common pincodes for the state
    range.prefixes.forEach((prefix: string) => {
      suggestions.push(`${prefix}001`);
      suggestions.push(`${prefix}002`);
      suggestions.push(`${prefix}003`);
    });

    // Remove duplicates and limit to 10 suggestions
    return Array.from(new Set(suggestions)).slice(0, 10);
  }

  // Get city from pincode (simplified version)
  getCityFromPincode(pincode: string): string | null {
    // This is a simplified version. In production, you'd use a pincode database API
    const cityMap: { [key: string]: string } = {
      '110001': 'New Delhi',
      '110002': 'New Delhi',
      '110003': 'New Delhi',
      '110004': 'New Delhi',
      '110005': 'New Delhi',
      '110006': 'New Delhi',
      '110007': 'New Delhi',
      '110008': 'New Delhi',
      '110009': 'New Delhi',
      '400001': 'Mumbai',
      '400002': 'Mumbai',
      '400003': 'Mumbai',
      '400004': 'Mumbai',
      '400005': 'Mumbai',
      '400006': 'Mumbai',
      '400007': 'Mumbai',
      '400008': 'Mumbai',
      '400009': 'Mumbai',
      '560001': 'Bangalore',
      '560002': 'Bangalore',
      '560003': 'Bangalore',
      '560004': 'Bangalore',
      '560005': 'Bangalore',
      '560006': 'Bangalore',
      '560007': 'Bangalore',
      '560008': 'Bangalore',
      '560009': 'Bangalore',
      '600001': 'Chennai',
      '600002': 'Chennai',
      '600003': 'Chennai',
      '600004': 'Chennai',
      '600005': 'Chennai',
      '600006': 'Chennai',
      '600007': 'Chennai',
      '600008': 'Chennai',
      '600009': 'Chennai'
    };

    return cityMap[pincode] || null;
  }

  // Complete address validation
  validateAddress(address: {
    pincode: string;
    state: string;
    city: string;
  }): AddressValidationResult {
    const errors: AddressValidationResult['errors'] = {};
    const suggestions: AddressValidationResult['suggestions'] = {};

    // Validate pincode
    const pincodeValidation = this.validatePincodeForState(address.pincode, address.state);
    if (!pincodeValidation.isValid) {
      errors.pincode = pincodeValidation.message;
      if (pincodeValidation.suggestions) {
        suggestions.pincode = pincodeValidation.suggestions;
      }
    }

    // Validate state
    const isValidState = INDIAN_STATES.some(s => 
      s.name.toLowerCase() === address.state.toLowerCase()
    );
    if (!isValidState) {
      errors.state = "Invalid state selected.";
      suggestions.state = INDIAN_STATES.map(s => s.name);
    }

    // Validate city (basic validation)
    if (!address.city || address.city.trim().length < 2) {
      errors.city = "City name must be at least 2 characters long.";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      suggestions
    };
  }

  // Get all Indian states
  getAllStates(): { code: string; name: string }[] {
    return INDIAN_STATES;
  }

  // Get states by pincode prefix
  getStatesByPincodePrefix(prefix: string): { code: string; name: string }[] {
    return INDIAN_STATES.filter(state => {
      const range = STATE_PINCODE_RANGES[state.code as keyof typeof STATE_PINCODE_RANGES];
      return range && range.prefixes.some((p: string) => p.startsWith(prefix));
    });
  }

  // Format pincode with proper formatting
  formatPincode(pincode: string): string {
    const cleaned = pincode.replace(/\D/g, '');
    return cleaned.length <= 6 ? cleaned : cleaned.substring(0, 6);
  }

  // Check if pincode is serviceable (for delivery)
  isPincodeServiceable(pincode: string): boolean {
    if (!this.validatePincodeFormat(pincode)) {
      return false;
    }

    // All valid Indian pincodes are considered serviceable
    // In production, you might have specific serviceability rules
    return this.getStateFromPincode(pincode) !== null;
  }

  // Calculate shipping cost based on pincode and state
  calculateShippingCost(pincode: string, state: string): number {
    // Base shipping cost logic
    const baseCost = 50;
    
    // Distance-based shipping (simplified logic based on state)
    const stateShippingCosts: { [key: string]: number } = {
      'Delhi': 40,
      'Mumbai': 40,
      'Bangalore': 60,
      'Chennai': 60,
      'Kolkata': 60,
      'Hyderabad': 50,
      'Pune': 45,
      'Ahmedabad': 55,
      'Jaipur': 55,
      'Lucknow': 50,
      'Chandigarh': 45,
      'Gurgaon': 40,
      'Noida': 40,
      'Thane': 45,
      'Navi Mumbai': 45,
      'Kochi': 70,
      'Coimbatore': 65,
      'Indore': 55,
      'Nagpur': 55,
      'Surat': 55,
      'Visakhapatnam': 65
    };
    
    // Get state-specific cost or use base cost
    const stateCost = stateShippingCosts[state] || baseCost;
    
    // Add additional cost based on pincode range (distance from major cities)
    const pincodeNum = parseInt(pincode);
    let additionalCost = 0;
    
    // Metro areas (lower pincodes) have lower additional cost
    if (pincodeNum < 200000) {
      additionalCost = 0;
    } else if (pincodeNum < 400000) {
      additionalCost = 10;
    } else if (pincodeNum < 600000) {
      additionalCost = 20;
    } else {
      additionalCost = 30;
    }
    
    return stateCost + additionalCost;
  }

  // Get delivery estimate based on pincode
  getDeliveryEstimate(pincode: string): { minDays: number; maxDays: number } {
    const state = this.getStateFromPincode(pincode);
    
    if (!state) {
      return { minDays: 0, maxDays: 0 };
    }

    // Simplified delivery estimates
    const deliveryEstimates: { [key: string]: { minDays: number; maxDays: number } } = {
      'Delhi': { minDays: 1, maxDays: 2 },
      'Mumbai': { minDays: 1, maxDays: 2 },
      'Bangalore': { minDays: 2, maxDays: 3 },
      'Chennai': { minDays: 2, maxDays: 3 },
      'Kolkata': { minDays: 2, maxDays: 3 },
      'Hyderabad': { minDays: 2, maxDays: 3 },
      'Pune': { minDays: 1, maxDays: 2 },
      'Ahmedabad': { minDays: 2, maxDays: 3 },
      'Jaipur': { minDays: 2, maxDays: 4 },
      'Lucknow': { minDays: 2, maxDays: 4 }
    };

    return deliveryEstimates[state] || { minDays: 3, maxDays: 7 };
  }
}

export const pincodeValidator = new PincodeValidator();
