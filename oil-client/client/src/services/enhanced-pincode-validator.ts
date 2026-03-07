import { createIThinkLogisticsService, ShippingRate, IThinkLogisticsService } from './ithink-logistics';

export interface EnhancedPincodeValidationResult {
  isValid: boolean;
  state?: string;
  city?: string;
  message?: string;
  suggestions?: string[];
  shippingCost?: number;
  deliveryDays?: { minDays: number; maxDays: number };
  realShippingRates?: ShippingRate[];
  availableCarriers?: string[];
  isServiceable?: boolean;
}

class EnhancedPincodeValidator {
  private ithinkService: IThinkLogisticsService | null = null;
  private initialized = false;

  constructor() {
    this.initializeServiceSync();
  }

  private initializeServiceSync() {
    try {
      // Try to get credentials from environment variables
      const accessToken = import.meta.env.VITE_ITHINK_ACCESS_TOKEN;
      const secretKey = import.meta.env.VITE_ITHINK_SECRET_KEY;
      const isProduction = import.meta.env.VITE_ITHINK_PRODUCTION === 'true';

      if (accessToken && secretKey) {
        this.ithinkService = createIThinkLogisticsService({
          accessToken,
          secretKey,
          isProduction,
        });
        this.initialized = true;
        console.log('iThink Logistics service initialized successfully');
      } else {
        console.warn('iThink Logistics credentials not found in environment variables');
      }
    } catch (error) {
      console.error('Failed to initialize iThink Logistics service:', error);
    }
  }

  // Expose the service for direct access
  async getService(): Promise<IThinkLogisticsService | null> {
    if (!this.initialized) {
      this.initializeServiceSync();
    }
    return this.ithinkService;
  }

  async validatePincodeForState(
    pincode: string, 
    stateName: string,
    packageDetails?: {
      length: number;
      width: number;
      height: number;
      weight: number;
      value: number;
    },
    paymentMethod: 'prepaid' | 'cod' = 'prepaid'
  ): Promise<EnhancedPincodeValidationResult> {
    const service = await this.getService();
    
    if (!service) {
      // Fallback to basic validation if iThink service is not available
      const { pincodeValidator } = await import('./pincodeValidator');
      return pincodeValidator.validatePincodeForState(pincode, stateName);
    }

    try {
      // Check if pincode is serviceable
      console.log('Checking serviceability for pincode:', pincode);
      const isServiceable = await service.isPincodeServiceable(pincode);
      console.log('Pincode serviceability result:', isServiceable);
      
      if (!isServiceable) {
        return {
          isValid: false,
          message: "This pincode is not serviceable by our shipping partners.",
        };
      }

      // Get available carriers
      const availableCarriers = await service.getAvailableCarriers(pincode);
      console.log('Available carriers:', availableCarriers);

      // Get state from pincode using iThink API response
      let detectedState = stateName;
      try {
        const response = await service.checkPincode(pincode);
        if (response.status === 'success' && response.data[pincode]) {
          const carrierData = response.data[pincode];
          const firstCarrier = Object.keys(carrierData)[0];
          if (carrierData[firstCarrier]) {
            detectedState = carrierData[firstCarrier].state_code || stateName;
          }
        }
      } catch (error) {
        console.log('Could not detect state from iThink API, using provided state');
      }

      // Get real shipping rates if package details are provided
      let realShippingRates: ShippingRate[] | undefined;
      let bestRate: number | undefined;
      let deliveryDays: { minDays: number; maxDays: number } | undefined;

      if (packageDetails) {
        try {
          const bestShippingRate = await service.getBestShippingRate(
            pincode,
            packageDetails,
            paymentMethod
          );
          
          if (bestShippingRate) {
            realShippingRates = [bestShippingRate];
            bestRate = bestShippingRate.rate;
            
            // Parse delivery TAT to get min/max days
            deliveryDays = this.parseDeliveryTat(bestShippingRate.deliveryTat);
            
            return {
              isValid: true,
              state: detectedState,
              message: `Pincode is valid. Serviceable by ${bestShippingRate.carrier}.`,
              shippingCost: bestRate,
              deliveryDays,
              realShippingRates,
              availableCarriers,
              isServiceable: true,
            };
          }
        } catch (rateError) {
          console.error('Error getting shipping rates:', rateError);
          // Fall back to basic validation rates
        }
      }

      // If we couldn't get real rates but pincode is serviceable
      return {
        isValid: true,
        state: detectedState,
        message: `Pincode is valid and serviceable. Available carriers: ${availableCarriers.join(', ')}`,
        shippingCost: 50, // Default shipping cost
        deliveryDays: deliveryDays || { minDays: 3, maxDays: 7 },
        availableCarriers,
        isServiceable: true,
      };

    } catch (error) {
      console.error('Error in enhanced pincode validation:', error);
      // Fallback to basic validation
      const { pincodeValidator } = await import('./pincodeValidator');
      const basicValidation = pincodeValidator.validatePincodeForState(pincode, stateName);
      return {
        ...basicValidation,
        message: `${basicValidation.message}. Real-time rates unavailable.`,
      };
    }
  }

  private parseDeliveryTat(tat: string): { minDays: number; maxDays: number } {
    // Parse various TAT formats like "1", "1-2", "1 to 2 Days", etc.
    const cleanTat = tat.toLowerCase().replace(/[^\d-]/g, '');
    
    if (cleanTat.includes('-')) {
      const [min, max] = cleanTat.split('-').map(Number);
      return { minDays: min || 1, maxDays: max || min || 1 };
    } else {
      const days = parseInt(cleanTat) || 1;
      return { minDays: days, maxDays: days };
    }
  }

  async getShippingRates(
    pincode: string,
    packageDetails: {
      length: number;
      width: number;
      height: number;
      weight: number;
      value: number;
    },
    paymentMethod: 'prepaid' | 'cod' = 'prepaid'
  ): Promise<ShippingRate[]> {
    const service = await this.getService();
    
    if (!service) {
      throw new Error('iThink Logistics service not available');
    }

    try {
      const bestRate = await service.getBestShippingRate(pincode, packageDetails, paymentMethod);
      return bestRate ? [bestRate] : [];
    } catch (error) {
      console.error('Error getting shipping rates:', error);
      throw error;
    }
  }

  // Delegate other methods to the original validator
  async validatePincodeFormat(pincode: string): Promise<boolean> {
    const { pincodeValidator } = await import('./pincodeValidator');
    return pincodeValidator.validatePincodeFormat(pincode);
  }

  async getStateFromPincode(pincode: string): Promise<string | null> {
    const { pincodeValidator } = await import('./pincodeValidator');
    return pincodeValidator.getStateFromPincode(pincode);
  }

  async getCityFromPincode(pincode: string): Promise<string | null> {
    const { pincodeValidator } = await import('./pincodeValidator');
    return pincodeValidator.getCityFromPincode(pincode);
  }

  async getValidPincodesForState(stateName: string): Promise<string[]> {
    const { pincodeValidator } = await import('./pincodeValidator');
    return pincodeValidator.getValidPincodesForState(stateName);
  }

  async formatPincode(pincode: string): Promise<string> {
    const { pincodeValidator } = await import('./pincodeValidator');
    return pincodeValidator.formatPincode(pincode);
  }

  async getDeliveryEstimate(pincode: string): Promise<{ minDays: number; maxDays: number }> {
    const service = await this.getService();
    
    if (service) {
      try {
        // Use default package details for estimate
        const bestRate = await service.getBestShippingRate(
          pincode,
          { length: 20, width: 15, height: 10, weight: 0.5, value: 1000 },
          'prepaid'
        );
        
        if (bestRate) {
          return this.parseDeliveryTat(bestRate.deliveryTat);
        }
      } catch (error) {
        console.error('Error getting delivery estimate:', error);
      }
    }

    // Fallback to original validator
    const { pincodeValidator } = await import('./pincodeValidator');
    return pincodeValidator.getDeliveryEstimate(pincode);
  }
}

// Create and export a singleton instance
export const enhancedPincodeValidator = new EnhancedPincodeValidator();

// Also export the class for testing
export { EnhancedPincodeValidator };
export default enhancedPincodeValidator;
