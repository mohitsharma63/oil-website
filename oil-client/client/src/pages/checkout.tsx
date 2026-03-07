import { useState, useEffect } from "react";
import { Link } from "wouter";
import {
  ArrowLeft,
  CreditCard,
  Truck,
  Shield,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCart } from "@/hooks/use-cart";
import { useOrders } from "@/hooks/use-orders";
import { usePincodeValidation } from "@/hooks/use-pincode-validation";

import { oliAssetUrl } from "@/lib/oliApi";

function toNumber(v: string | number | undefined): number {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  if (typeof v === "string") {
    const n = parseFloat(v.replace(/[^0-9.]/g, ""));
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

export default function Checkout() {
  const { items, subtotal, clear } = useCart();
  const { add: addOrder } = useOrders();
  const {
    validatePincode,
    isValidating,
    validationResult,
    error: pincodeError,
    cartWeight,
    cartMrp,
  } = usePincodeValidation();
  const [step, setStep] = useState(1); // 1: Details, 2: Payment, 3: Confirmation
  const [formData, setFormData] = useState({
    // Shipping Info
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    apartment: "",
    city: "",
    state: "",
    pincode: "",
    // Payment
    paymentMethod: "card", // Default to online payment
    // Card Details
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",
    // UPI
    upiId: "",
    // Billing
    sameAsShipping: true,
  });

  const [formErrors, setFormErrors] = useState<string[]>([]);

  const [shippingInfo, setShippingInfo] = useState({
    charge: 0,
    message: "",
    isServiceable: false,
  });

  const total = subtotal + shippingInfo.charge;

  // Handle payment success callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('status');
    const orderId = urlParams.get('order_id');
    
    if (paymentStatus === 'success' && orderId) {
      // Payment successful - add order and show confirmation
      addOrder({
        id: orderId,
        createdAt: new Date().toISOString(),
        items,
        subtotal,
        shipping: shippingInfo.charge,
        total,
        userEmail: formData.email,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        status: "confirmed",
        paymentMethod: "CASHFREE",
      });
      
      clear();
      setStep(3);
      
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (paymentStatus === 'failed') {
      alert('Payment failed. Please try again.');
      setStep(2);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear errors when user starts typing in a field
    if (value && value.trim()) {
      setFormErrors((prev) =>
        prev.filter(
          (error) => !error.toLowerCase().includes(name.toLowerCase()),
        ),
      );
    }

    // Trigger pincode validation when pincode changes
    if (name === "pincode" && value.length === 6) {
      handlePincodeValidation(value);
    }
  };

  const validateForm = () => {
    const errors: string[] = [];

    // Required field validations
    if (!formData.firstName.trim()) errors.push("First name is required");
    if (!formData.lastName.trim()) errors.push("Last name is required");
    if (!formData.email.trim()) errors.push("Email is required");
    if (!formData.phone.trim()) errors.push("Phone is required");
    if (!formData.address.trim()) errors.push("Address is required");
    if (!formData.city.trim()) errors.push("City is required");
    if (!formData.state.trim()) errors.push("State is required");
    if (!formData.pincode.trim()) errors.push("Pincode is required");

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      errors.push("Please enter a valid email address");
    }

    // Phone validation (basic)
    const phoneRegex = /^\d{10}$/;
    if (formData.phone && !phoneRegex.test(formData.phone.replace(/\D/g, ""))) {
      errors.push("Please enter a valid 10-digit phone number");
    }

    // Pincode validation
    const pincodeRegex = /^\d{6}$/;
    if (formData.pincode && !pincodeRegex.test(formData.pincode)) {
      errors.push("Please enter a valid 6-digit pincode");
    }

    setFormErrors(errors);
    return errors;
  };

  const handlePincodeValidation = async (pincode: string) => {
    const isCod = formData.paymentMethod === "cod";
    const result = await validatePincode(
      pincode,
      formData.city,
      formData.state,
      isCod,
    );
    if (result) {
      setShippingInfo({
        charge: result.shippingCharge,
        message: result.message,
        isServiceable: result.serviceable,
      });
    }
  };

  const handleStateChange = (value: string) => {
    setFormData((prev) => ({ ...prev, state: value }));
    // Revalidate pincode if already entered
    if (formData.pincode && formData.pincode.length === 6) {
      handlePincodeValidation(formData.pincode);
    }
  };

  const handlePaymentMethodChange = (value: string) => {
    setFormData((prev) => ({ ...prev, paymentMethod: value }));
    // Revalidate pincode if already entered to update COD charges
    if (formData.pincode && formData.pincode.length === 6) {
      handlePincodeValidation(formData.pincode);
    }
  };

  const handleNext = () => {
    // Validate all required fields
    const errors = validateForm();
    if (errors.length > 0) {
      // Errors are already set in formErrors state and displayed below input boxes
      return;
    }

    // Validate pincode before proceeding
    if (!shippingInfo.isServiceable && shippingInfo.charge === 99) {
      alert("Manual delivery charges will apply. Continue to payment?");
      return;
    }

    setStep(step + 1);
  };

  const handlePlaceOrder = async () => {
    try {
      // Create order data
      const orderData = {
        customerInfo: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
        },
        shippingAddress: {
          address: formData.address,
          apartment: formData.apartment,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
        },
        items: items.map(item => ({
          productId: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          selectedVariant: item.selectedVariant,
        })),
        subtotal,
        shipping: shippingInfo.charge,
        total,
        paymentMethod: formData.paymentMethod,
        orderDate: new Date().toISOString(),
      };

      if (formData.paymentMethod === 'cod') {
        // Handle COD order directly
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(orderData),
        });

        if (response.ok) {
          const result = await response.json();
          
          // Add to local orders for display
          addOrder({
            id: result.id.toString(),
            createdAt: new Date().toISOString(),
            items,
            subtotal,
            shipping: shippingInfo.charge,
            total,
            userEmail: formData.email,
            name: `${formData.firstName} ${formData.lastName}`.trim(),
            status: "confirmed",
            paymentMethod: "COD",
          });
          
          clear();
          setStep(3);
        } else {
          alert('Failed to place order. Please try again.');
        }
      } else {
        // Handle Cashfree online payment
        const paymentResponse = await fetch('/api/orders/payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...orderData,
            amount: total,
            paymentType: 'CASHFREE',
            customerName: `${formData.firstName} ${formData.lastName}`.trim(),
            customerEmail: formData.email,
            customerPhone: formData.phone,
            shippingAddress: `${formData.address}, ${formData.apartment || ''}, ${formData.city}, ${formData.state} - ${formData.pincode}`,
          }),
        });

        if (paymentResponse.ok) {
          const paymentResult = await paymentResponse.json();
          
          if (paymentResult.status === 'INITIATED') {
            // Redirect to Cashfree payment page
            window.location.href = paymentResult.redirectUrl;
          } else {
            alert('Payment initiation failed. Please try again.');
          }
        } else {
          alert('Payment processing failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Order placement error:', error);
      alert('An error occurred while placing your order. Please try again.');
    }
  };

  if (items.length === 0 && step !== 3) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <Truck className="mx-auto h-24 w-24 text-gray-300 mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Your cart is empty
            </h2>
            <p className="text-gray-600 mb-8">
              Add items to your cart before checkout.
            </p>
            <Link href="/">
              <Button className="btn-primary">Continue Shopping</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center shadow-lg">
          <CardContent className="pt-6 space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Order Confirmed!
            </h2>
            <p className="text-gray-600">
              Thank you for your purchase. Your order #DP2024001 has been
              confirmed.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Estimated delivery</p>
              <p className="font-semibold">3-5 business days</p>
            </div>
            <div className="space-y-3 pt-4">
              <Link href="/account/orders">
                <Button className="w-full btn-primary">Track Your Order</Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="w-full">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/cart"
            className="inline-flex items-center text-red-600 hover:text-red-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cart
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>

          {/* Progress Steps */}
          <div className="flex items-center mt-6 space-x-4">
            <div
              className={`flex items-center ${step >= 1 ? "text-red-600" : "text-gray-400"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= 1 ? "bg-red-600 text-white" : "bg-gray-200"}`}
              >
                1
              </div>
              <span className="ml-2 font-medium">Shipping</span>
            </div>
            <div
              className={`w-16 h-0.5 ${step >= 2 ? "bg-red-600" : "bg-gray-200"}`}
            ></div>
            <div
              className={`flex items-center ${step >= 2 ? "text-red-600" : "text-gray-400"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= 2 ? "bg-red-600 text-white" : "bg-gray-200"}`}
              >
                2
              </div>
              <span className="ml-2 font-medium">Payment</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Truck className="h-5 w-5 mr-2" />
                    Shipping Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Form Errors Display */}
                  {formErrors.length > 0 && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <h4 className="text-red-800 font-medium mb-2">
                        Please fix the following errors:
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                        {formErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className={
                          !formData.firstName.trim() ? "border-red-500" : ""
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        className={
                          !formData.lastName.trim() ? "border-red-500" : ""
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className={
                          !formData.email.trim() ? "border-red-500" : ""
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className={
                          !formData.phone.trim() ? "border-red-500" : ""
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      className={
                        !formData.address.trim() ? "border-red-500" : ""
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="apartment">
                      Apartment, suite, etc. (optional)
                    </Label>
                    <Input
                      id="apartment"
                      name="apartment"
                      value={formData.apartment}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        className={
                          !formData.city.trim() ? "border-red-500" : ""
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Select
                        value={formData.state}
                        onValueChange={handleStateChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="andhra-pradesh">
                            Andhra Pradesh
                          </SelectItem>
                          <SelectItem value="arunachal-pradesh">
                            Arunachal Pradesh
                          </SelectItem>
                          <SelectItem value="assam">Assam</SelectItem>
                          <SelectItem value="bihar">Bihar</SelectItem>
                          <SelectItem value="chhattisgarh">
                            Chhattisgarh
                          </SelectItem>
                          <SelectItem value="goa">Goa</SelectItem>
                          <SelectItem value="gujarat">Gujarat</SelectItem>
                          <SelectItem value="haryana">Haryana</SelectItem>
                          <SelectItem value="himachal-pradesh">
                            Himachal Pradesh
                          </SelectItem>
                          <SelectItem value="jharkhand">Jharkhand</SelectItem>
                          <SelectItem value="karnataka">Karnataka</SelectItem>
                          <SelectItem value="kerala">Kerala</SelectItem>
                          <SelectItem value="madhya-pradesh">
                            Madhya Pradesh
                          </SelectItem>
                          <SelectItem value="maharashtra">
                            Maharashtra
                          </SelectItem>
                          <SelectItem value="manipur">Manipur</SelectItem>
                          <SelectItem value="meghalaya">Meghalaya</SelectItem>
                          <SelectItem value="mizoram">Mizoram</SelectItem>
                          <SelectItem value="nagaland">Nagaland</SelectItem>
                          <SelectItem value="odisha">Odisha</SelectItem>
                          <SelectItem value="punjab">Punjab</SelectItem>
                          <SelectItem value="rajasthan">Rajasthan</SelectItem>
                          <SelectItem value="sikkim">Sikkim</SelectItem>
                          <SelectItem value="tamil-nadu">Tamil Nadu</SelectItem>
                          <SelectItem value="telangana">Telangana</SelectItem>
                          <SelectItem value="tripura">Tripura</SelectItem>
                          <SelectItem value="uttar-pradesh">
                            Uttar Pradesh
                          </SelectItem>
                          <SelectItem value="uttarakhand">
                            Uttarakhand
                          </SelectItem>
                          <SelectItem value="west-bengal">
                            West Bengal
                          </SelectItem>
                          <SelectItem value="andaman-nicobar">
                            Andaman & Nicobar Islands
                          </SelectItem>
                          <SelectItem value="chandigarh">Chandigarh</SelectItem>
                          <SelectItem value="dadra-nagar-haveli-daman-diu">
                            Dadra & Nagar Haveli & Daman & Diu
                          </SelectItem>
                          <SelectItem value="delhi">Delhi</SelectItem>
                          <SelectItem value="jammu-kashmir">
                            Jammu & Kashmir
                          </SelectItem>
                          <SelectItem value="ladakh">Ladakh</SelectItem>
                          <SelectItem value="lakshadweep">
                            Lakshadweep
                          </SelectItem>
                          <SelectItem value="puducherry">Puducherry</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pincode">Pincode</Label>
                      <Input
                        id="pincode"
                        name="pincode"
                        placeholder="Enter 6-digit pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        maxLength={6}
                        required
                        className={
                          !formData.pincode.trim() ? "border-red-500" : ""
                        }
                      />
                      {isValidating && (
                        <p className="text-sm text-blue-600">
                          Validating pincode...
                        </p>
                      )}
                      {pincodeError && (
                        <p className="text-sm text-red-600">{pincodeError}</p>
                      )}
                      {validationResult && (
                        <div className="text-sm">
                          <p
                            className={`font-medium ${validationResult.serviceable ? "text-green-600" : "text-orange-600"}`}
                          >
                            {validationResult.message}
                          </p>
                          <p className="text-gray-600">
                            Estimated delivery:{" "}
                            {validationResult.estimatedDelivery}
                          </p>
                          <p className="text-gray-600">
                            Shipping:{" "}
                            {validationResult.shippingCharge === 0
                              ? "FREE"
                              : `₹${validationResult.shippingCharge}`}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button onClick={handleNext} className="w-full btn-primary">
                    Continue to Payment
                  </Button>
                </CardContent>
              </Card>
            )}

            {step === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Payment Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <RadioGroup
                    value={formData.paymentMethod}
                    onValueChange={handlePaymentMethodChange}
                    className="grid grid-cols-1 gap-4"
                  >
                    {/* Credit/Debit Card Option */}
                    <div className="relative">
                      <RadioGroupItem
                        value="card"
                        id="card"
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor="card"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-red-600 [&:has([data-state=checked])]:border-red-600"
                      >
                        <div className="flex items-center w-full">
                          <CreditCard className="h-5 w-5 mr-3 text-gray-600" />
                          <span className="text-sm font-medium">
                            Online Payment
                            <p>Pay with UPI, Cards, Net Banking & Wallets</p>
                          </span>
                        </div>
                      </Label>
                    </div>

                    {/* Cash on Delivery Option */}
                    <div className="relative">
                      <RadioGroupItem
                        value="cod"
                        id="cod"
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor="cod"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-red-600 [&:has([data-state=checked])]:border-red-600"
                      >
                        <div className="flex items-center w-full">
                          <img
                            src="/cod.png"
                            alt="COD"
                            className="h-5 w-5 mr-3"
                          />
                          <span className="text-sm font-medium">
                            Cash on Delivery
                          </span>
                          {shippingInfo.charge > 99 && ( // Display COD extra charge only if applicable
                            <span className="text-orange-600 ml-2">+₹50</span>
                          )}
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>

                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Shield className="h-4 w-4" />
                    <span>
                      Your payment information is encrypted and secure
                    </span>
                  </div>

                  <Button
                    onClick={handlePlaceOrder}
                    className="w-full btn-primary"
                  >
                    Place Order - ₹{total.toLocaleString()}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Order Items */}
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={`${item.product.id}:${item.selectedVariant ?? ""}`}
                      className="flex items-center space-x-3"
                    >
                      <img
                        src={
                          oliAssetUrl(item.product.imageUrl) ??
                          item.product.imageUrl
                        }
                        alt={item.product.name}
                        className="h-12 w-12 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.product.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <span className="text-sm font-medium">
                        ₹
                        {(
                          toNumber(item.product.price) * (item.quantity ?? 0)
                        ).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Price Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span
                      className={
                        shippingInfo.charge === 0 ? "text-green-600" : undefined
                      }
                    >
                      {shippingInfo.charge === 0
                        ? "FREE"
                        : `₹${shippingInfo.charge.toLocaleString()}`}
                    </span>
                  </div>

                  {formData.paymentMethod === "cod" &&
                    shippingInfo.charge > 99 && (
                      <div className="flex justify-between text-sm text-orange-600">
                        <span>COD Surcharge</span>
                        <span>+₹50</span>
                      </div>
                    )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span>Included</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>

                {/* Delivery Info */}
                <div
                  className={`p-3 rounded-lg ${shippingInfo.isServiceable ? "bg-green-50" : "bg-orange-50"}`}
                >
                  <div
                    className={`flex items-center text-sm ${shippingInfo.isServiceable ? "text-green-700" : "text-orange-700"}`}
                  >
                    <Truck className="h-4 w-4 mr-2" />
                    <span>
                      {shippingInfo.isServiceable
                        ? `Free delivery in ${validationResult?.estimatedDelivery || "3-5 business days"}`
                        : `Manual delivery in ${validationResult?.estimatedDelivery || "5-7 business days"} (₹${shippingInfo.charge})`}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
