export interface IThinkLogisticsConfig {
  accessToken: string;
  secretKey: string;
  isProduction?: boolean;
}

export interface PincodeCheckRequest {
  pincode: string;
}

export interface PincodeCheckResponse {
  status: string;
  status_code: number;
  data: {
    [pincode: string]: {
      [carrier: string]: {
        prepaid: string;
        cod: string;
        pickup: string;
        district: string;
        state_code: string;
        sort_code: string;
      };
    };
  };
}

export interface RateCheckRequest {
  fromPincode: string;
  toPincode: string;
  shippingLength: number;
  shippingWidth: number;
  shippingHeight: number;
  shippingWeight: number;
  orderType: 'forward' | 'reverse';
  paymentMethod: 'prepaid' | 'cod';
  productMrp: number;
}

export interface RateCheckResponse {
  status: string;
  status_code: number;
  data: Array<{
    logistic_name: string;
    logistic_service_type: string;
    prepaid: string;
    cod: string;
    pickup: string;
    rev_pickup: string;
    rate: number;
    logistics_zone: string;
    delivery_tat: string;
  }>;
  zone: string;
  expected_delivery_date: string;
}

export interface ShippingRate {
  carrier: string;
  rate: number;
  deliveryTat: string;
  zone: string;
  isCodAvailable: boolean;
  isPrepaidAvailable: boolean;
}

export interface IThinkLogisticsError {
  message: string;
  status_code?: number;
  status?: string;
}

class IThinkLogisticsService {
  private config: IThinkLogisticsConfig;
  private baseUrl: string;
  private useDirectApi: boolean = false; // Start with backend proxy

  constructor(config: IThinkLogisticsConfig) {
    this.config = config;
    
    // Try backend proxy first, fallback to direct API
    this.baseUrl = config.isProduction 
      ? '/api/shipping'
      : '/api/shipping';
  }

  private async makeRequest<T>(endpoint: string, data: any): Promise<T> {
    let url: string;
    
    // Check if it's the new serviceability endpoint (GET request)
    if (endpoint.includes('/ithink/serviceability')) {
      // Build query parameters for GET request
      const params = new URLSearchParams({
        deliveryPincode: data.deliveryPincode,
        weight: data.weight.toString(),
        cod: data.cod.toString(),
        productMrp: data.productMrp.toString()
      });
      
      url = `${this.baseUrl}${endpoint}?${params.toString()}`;
      console.log('🌐 Making GET API call:', { url, method: 'GET' });
      
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        console.log('📡 GET API Response status:', response.status);
        
        if (response.ok) {
          const result = await response.json();
          console.log('📦 GET API Response data:', result);
          
          // Handle backend error responses
          if (result.error) {
            throw new Error(result.error);
          }
          
          return result;
        } else {
          throw new Error(`GET API error! status: ${response.status}`);
        }
      } catch (error) {
        console.error('💥 GET API failed, trying direct API:', error);
        
        // Fallback to direct API
        return this.makeDirectApiCall<T>(endpoint, data);
      }
    } else {
      // Original POST request logic
      url = `${this.baseUrl}${endpoint}`;
      const requestBody = {
        ...data,
        accessToken: this.config.accessToken,
        secretKey: this.config.secretKey,
      };
      
      console.log('🌐 Making POST API call:', { url, method: 'POST', body: requestBody });
      
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        console.log('📡 POST API Response status:', response.status);
        
        if (response.ok) {
          const result = await response.json();
          console.log('📦 POST API Response data:', result);
          
          // Handle backend error responses
          if (result.error) {
            throw new Error(result.error);
          }
          
          return result;
        } else {
          throw new Error(`POST API error! status: ${response.status}`);
        }
      } catch (error) {
        console.error('💥 POST API failed, trying direct API:', error);
        
        // Fallback to direct API
        return this.makeDirectApiCall<T>(endpoint, data);
      }
    }
  }

  private async makeDirectApiCall<T>(endpoint: string, data: any): Promise<T> {
    const directUrl = this.config.isProduction 
      ? `https://my.ithinklogistics.com/api_v3${endpoint}`
      : `https://pre-alpha.ithinklogistics.com/api_v3${endpoint}`;
    
    const directRequestBody = {
      data: {
        ...data,
        access_token: this.config.accessToken,
        secret_key: this.config.secretKey,
      }
    };
    
    console.log('🌐 Making direct API call:', { url: directUrl, method: 'POST', body: directRequestBody });
    
    try {
      const response = await fetch(directUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify(directRequestBody),
        mode: 'cors',
      });

      console.log('📡 Direct API Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Direct API error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('📦 Direct API Response data:', result);
      
      // Handle error responses
      if (result.status !== 'success') {
        throw new Error(result.message || 'API request failed');
      }

      return result;
    } catch (error) {
      console.error('💥 Direct API also failed:', error);
      
      // Last resort: Try CORS proxy
      console.log('🔄 Trying CORS proxy as last resort...');
      return this.makeCorsProxyCall<T>(endpoint, data);
    }
  }

  private async makeCorsProxyCall<T>(endpoint: string, data: any): Promise<T> {
    const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
    const directUrl = this.config.isProduction 
      ? `https://my.ithinklogistics.com/api_v3${endpoint}`
      : `https://pre-alpha.ithinklogistics.com/api_v3${endpoint}`;
    
    const directRequestBody = {
      data: {
        ...data,
        access_token: this.config.accessToken,
        secret_key: this.config.secretKey,
      }
    };
    
    console.log('🌐 Making CORS proxy call:', { url: proxyUrl + directUrl, method: 'POST', body: directRequestBody });
    
    try {
      const response = await fetch(proxyUrl + directUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify(directRequestBody),
      });

      console.log('📡 CORS Proxy Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`CORS proxy error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('📦 CORS Proxy Response data:', result);
      
      // Handle error responses
      if (result.status !== 'success') {
        throw new Error(result.message || 'API request failed');
      }

      return result;
    } catch (error) {
      console.error('💥 CORS proxy also failed:', error);
      throw new Error('All API methods failed. Please start the backend server or use a CORS browser extension.');
    }
  }

  async checkPincode(pincode: string, packageDetails?: { weight: number; value: number; cod?: boolean }): Promise<PincodeCheckResponse> {
    // Temporarily use the working endpoint until Java backend is fixed
    return this.makeRequest<PincodeCheckResponse>('/check-pincode', { pincode });
  }

  async getShippingRates(request: RateCheckRequest): Promise<RateCheckResponse> {
    return this.makeRequest<RateCheckResponse>('/get-rate', {
      fromPincode: request.fromPincode,
      toPincode: request.toPincode,
      shippingLength: request.shippingLength,
      shippingWidth: request.shippingWidth,
      shippingHeight: request.shippingHeight,
      shippingWeight: request.shippingWeight,
      orderType: request.orderType,
      paymentMethod: request.paymentMethod,
      productMrp: request.productMrp,
    });
  }

  async getBestShippingRate(
    toPincode: string,
    packageDetails: {
      length: number;
      width: number;
      height: number;
      weight: number;
      value: number;
    },
    paymentMethod: 'prepaid' | 'cod' = 'prepaid',
    fromPincode: string = '400067' // Default Mumbai pickup location
  ): Promise<ShippingRate | null> {
    try {
      const response = await this.getShippingRates({
        fromPincode,
        toPincode,
        shippingLength: packageDetails.length,
        shippingWidth: packageDetails.width,
        shippingHeight: packageDetails.height,
        shippingWeight: packageDetails.weight,
        orderType: 'forward',
        paymentMethod,
        productMrp: packageDetails.value,
      });

      if (response.data && response.data.length > 0) {
        // Find the best rate (lowest price with required payment method)
        const validRates = response.data.filter(rate => 
          paymentMethod === 'cod' ? rate.cod === 'Y' : rate.prepaid === 'Y'
        );

        if (validRates.length === 0) {
          throw new Error(`No ${paymentMethod} options available for this pincode`);
        }

        const bestRate = validRates.reduce((prev, current) => 
          prev.rate < current.rate ? prev : current
        );

        return {
          carrier: bestRate.logistic_name,
          rate: bestRate.rate,
          deliveryTat: bestRate.delivery_tat,
          zone: bestRate.logistics_zone,
          isCodAvailable: bestRate.cod === 'Y',
          isPrepaidAvailable: bestRate.prepaid === 'Y',
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting best shipping rate:', error);
      throw error;
    }
  }

  async isPincodeServiceable(pincode: string, packageDetails?: { weight: number; value: number; cod?: boolean }): Promise<boolean> {
    try {
      console.log('🔍 Checking pincode serviceability for:', pincode);
      const response = await this.checkPincode(pincode, packageDetails);
      console.log('📦 Full API response:', JSON.stringify(response, null, 2));
      
      // Check if response is successful and has data for the pincode
      if (response.status === 'success' && response.data && response.data[pincode]) {
        const pincodeData = response.data[pincode];
        console.log('📍 Pincode data:', JSON.stringify(pincodeData, null, 2));
        
        // Check if at least one carrier is available with "Y" for prepaid/cod/pickup
        const carriers = Object.keys(pincodeData);
        console.log('🚚 Available carriers:', carriers);
        
        let hasServiceableCarrier = false;
        for (const carrier of carriers) {
          const carrierData = pincodeData[carrier];
          console.log(`📋 ${carrier} data:`, JSON.stringify(carrierData, null, 2));
          
          // Check if carrier has at least one service available
          if (carrierData.prepaid === 'Y' || carrierData.cod === 'Y' || carrierData.pickup === 'Y') {
            hasServiceableCarrier = true;
            console.log(`✅ ${carrier} is serviceable`);
          } else {
            console.log(`❌ ${carrier} is NOT serviceable - prepaid: ${carrierData.prepaid}, cod: ${carrierData.cod}, pickup: ${carrierData.pickup}`);
          }
        }
        
        console.log('🎯 Final serviceability result:', hasServiceableCarrier);
        return hasServiceableCarrier;
      }
      
      console.log('❌ Pincode not serviceable - no data or failed status');
      return false;
    } catch (error) {
      console.error('💥 Error checking pincode serviceability:', error);
      return false;
    }
  }

  async getAvailableCarriers(pincode: string): Promise<string[]> {
    try {
      const response = await this.checkPincode(pincode);
      if (response.status === 'success' && response.data[pincode]) {
        return Object.keys(response.data[pincode]);
      }
      return [];
    } catch (error) {
      console.error('Error getting available carriers:', error);
      return [];
    }
  }
}

export const createIThinkLogisticsService = (config: IThinkLogisticsConfig) => {
  return new IThinkLogisticsService(config);
};

export default IThinkLogisticsService;
export { IThinkLogisticsService };
