import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_OLI_API_BASE_URL;
const CASHFREE_APP_ID = import.meta.env.VITE_CASHFREE_APP_ID;
const CASHFREE_API_URL = import.meta.env.VITE_CASHFREE_API_URL;

export interface PaymentRequest {
  orderId: string;
  orderAmount: number;
  customerEmail: string;
  customerPhone: string;
  customerName: string;
  returnUrl?: string;
  notifyUrl?: string;
}

export interface PaymentResponse {
  paymentLink: string;
  orderId: string;
  cfOrderId: string;
  status: string;
}

export interface PaymentVerification {
  orderId: string;
  transactionId: string;
  status: string;
  amount: number;
}

class PaymentService {
  private getAuthHeaders() {
    // In production, this should be handled by backend
    // For demo purposes, we're using frontend implementation
    return {
      'Content-Type': 'application/json',
      'X-Client-Id': CASHFREE_APP_ID,
    };
  }

  async createPaymentLink(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    try {
      // Call backend to create payment link
      const response = await axios.post(
        `${API_BASE_URL}/api/orders/${paymentRequest.orderId}/payment-link`,
        paymentRequest,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating payment link:', error);
      throw new Error('Failed to create payment link');
    }
  }

  async verifyPayment(paymentData: PaymentVerification): Promise<boolean> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/payments/verify`,
        paymentData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data.success;
    } catch (error) {
      console.error('Error verifying payment:', error);
      return false;
    }
  }

  async getPaymentStatus(orderId: string): Promise<any> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/orders/${orderId}/payment-status`
      );
      return response.data;
    } catch (error) {
      console.error('Error getting payment status:', error);
      throw new Error('Failed to get payment status');
    }
  }

  generateOrderId(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `ORD${timestamp}${random}`;
  }

  // Initialize Cashfree SDK (for web integration)
  async initializeCashfree(): Promise<void> {
    try {
      // Load Cashfree SDK
      const script = document.createElement('script');
      script.src = 'https://sdk.cashfree.com/js/ui/2.0.0/cashfree.sandbox.js';
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        console.log('Cashfree SDK loaded successfully');
      };

      script.onerror = () => {
        console.error('Failed to load Cashfree SDK');
      };
    } catch (error) {
      console.error('Error initializing Cashfree:', error);
    }
  }

  // Process payment using Cashfree SDK
  async processPaymentWithSDK(paymentData: PaymentRequest): Promise<any> {
    try {
      // This would use the Cashfree SDK for web integration
      // For now, we'll redirect to payment link
      const paymentLink = await this.createPaymentLink(paymentData);
      window.location.href = paymentLink.paymentLink;
    } catch (error) {
      console.error('Error processing payment with SDK:', error);
      throw error;
    }
  }

  // Handle payment callback
  handlePaymentCallback(callbackData: any): PaymentVerification | null {
    try {
      // Process callback data from Cashfree
      const paymentData: PaymentVerification = {
        orderId: callbackData.orderId,
        transactionId: callbackData.transactionId,
        status: callbackData.status,
        amount: callbackData.amount,
      };

      return paymentData;
    } catch (error) {
      console.error('Error handling payment callback:', error);
      return null;
    }
  }

  // Refund payment
  async refundPayment(transactionId: string, amount: number, reason: string): Promise<any> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/payments/refund`,
        {
          transactionId,
          amount,
          reason,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error refunding payment:', error);
      throw new Error('Failed to refund payment');
    }
  }

  // Get payment methods
  async getPaymentMethods(): Promise<any[]> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/payments/methods`
      );
      return response.data;
    } catch (error) {
      console.error('Error getting payment methods:', error);
      return [];
    }
  }
}

export const paymentService = new PaymentService();
