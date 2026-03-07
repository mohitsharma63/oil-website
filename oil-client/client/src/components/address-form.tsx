import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, MapPin, Truck, Clock } from "lucide-react";
import { pincodeValidator, PincodeValidationResult, AddressValidationResult } from "@/services/pincodeValidator";
import { INDIAN_STATES } from "@/data/indian-states-data";

interface AddressFormProps {
  onAddressChange?: (address: AddressData) => void;
  initialData?: Partial<AddressData>;
}

interface AddressData {
  email: string;
  phone: string;
  address: string;
  apartment: string;
  city: string;
  state: string;
  pincode: string;
}

const AddressForm = ({ onAddressChange, initialData }: AddressFormProps) => {
  const [address, setAddress] = useState<AddressData>({
    email: '',
    phone: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    pincode: '',
    ...initialData
  });

  const [validation, setValidation] = useState<AddressValidationResult>({
    isValid: false,
    errors: {},
    suggestions: {}
  });

  const [pincodeValidation, setPincodeValidation] = useState<PincodeValidationResult | null>(null);
  const [isPincodeValidating, setIsPincodeValidating] = useState(false);
  const [showPincodeSuggestions, setShowPincodeSuggestions] = useState(false);
  const [deliveryEstimate, setDeliveryEstimate] = useState<{ minDays: number; maxDays: number } | null>(null);

  useEffect(() => {
    if (onAddressChange) {
      onAddressChange(address);
    }
  }, [address, onAddressChange]);

  useEffect(() => {
    if (address.pincode.length === 6) {
      validatePincode();
    } else {
      setPincodeValidation(null);
      setDeliveryEstimate(null);
    }
  }, [address.pincode, address.state]);

  const validatePincode = async () => {
    setIsPincodeValidating(true);
    
    setTimeout(() => {
      const result = pincodeValidator.validatePincodeForState(address.pincode, address.state);
      setPincodeValidation(result);
      
      if (result.isValid) {
        const estimate = pincodeValidator.getDeliveryEstimate(address.pincode);
        setDeliveryEstimate(estimate);
        
        // Auto-fill city if detected
        const detectedCity = pincodeValidator.getCityFromPincode(address.pincode);
        if (detectedCity && !address.city) {
          setAddress(prev => ({ ...prev, city: detectedCity }));
        }
      }
      
      setIsPincodeValidating(false);
    }, 500);
  };

  const handlePincodeChange = (value: string) => {
    const formattedPincode = pincodeValidator.formatPincode(value);
    setAddress(prev => ({ ...prev, pincode: formattedPincode }));
  };

  const handleStateChange = (value: string) => {
    setAddress(prev => ({ ...prev, state: value }));
    if (address.pincode.length === 6) {
      validatePincode();
    }
  };

  const handlePincodeSuggestionClick = (suggestedPincode: string) => {
    setAddress(prev => ({ ...prev, pincode: suggestedPincode }));
    setShowPincodeSuggestions(false);
  };

  const handleStateSuggestionClick = (suggestedState: string) => {
    setAddress(prev => ({ ...prev, state: suggestedState }));
  };

  const isFormValid = () => {
    const requiredFields = ['email', 'phone', 'address', 'city', 'state', 'pincode'];
    return requiredFields.every(field => address[field as keyof AddressData].trim() !== '') &&
           pincodeValidation?.isValid === true;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Delivery Address
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Contact Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={address.email}
                onChange={(e) => setAddress(prev => ({ ...prev, email: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+91 98765 43210"
                value={address.phone}
                onChange={(e) => setAddress(prev => ({ ...prev, phone: e.target.value }))}
                className="mt-1"
              />
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Address Details</h3>
          <div>
            <Label htmlFor="address">Street Address</Label>
            <Input
              id="address"
              placeholder="123 Main Street, Building Name"
              value={address.address}
              onChange={(e) => setAddress(prev => ({ ...prev, address: e.target.value }))}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="apartment">Apartment, Suite, etc. (Optional)</Label>
            <Input
              id="apartment"
              placeholder="Flat 4A, Floor 2"
              value={address.apartment}
              onChange={(e) => setAddress(prev => ({ ...prev, apartment: e.target.value }))}
              className="mt-1"
            />
          </div>
        </div>

        {/* Location Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Location</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="pincode">Pincode</Label>
              <div className="relative">
                <Input
                  id="pincode"
                  type="text"
                  placeholder="110001"
                  value={address.pincode}
                  onChange={(e) => handlePincodeChange(e.target.value)}
                  className={`mt-1 ${pincodeValidation ? (pincodeValidation.isValid ? 'border-green-500' : 'border-red-500') : ''}`}
                  maxLength={6}
                />
                {isPincodeValidating && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  </div>
                )}
                {pincodeValidation && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    {pincodeValidation.isValid ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                )}
              </div>
              
              {/* Pincode Validation Message */}
              {pincodeValidation && (
                <Alert className={`mt-2 ${pincodeValidation.isValid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                  <AlertDescription className={pincodeValidation.isValid ? 'text-green-800' : 'text-red-800'}>
                    {pincodeValidation.message}
                  </AlertDescription>
                </Alert>
              )}

              {/* Pincode Suggestions */}
              {pincodeValidation?.suggestions && pincodeValidation.suggestions.length > 0 && (
                <div className="mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPincodeSuggestions(!showPincodeSuggestions)}
                    className="text-xs"
                  >
                    Show valid pincodes for {address.state}
                  </Button>
                  {showPincodeSuggestions && (
                    <div className="mt-2 p-2 border rounded-lg bg-gray-50">
                      <p className="text-sm font-medium mb-2">Valid pincodes:</p>
                      <div className="flex flex-wrap gap-2">
                        {pincodeValidation.suggestions.map((pincode, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="cursor-pointer hover:bg-blue-100"
                            onClick={() => handlePincodeSuggestionClick(pincode)}
                          >
                            {pincode}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                type="text"
                placeholder="New Delhi"
                value={address.city}
                onChange={(e) => setAddress(prev => ({ ...prev, city: e.target.value }))}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="state">State</Label>
              <Select value={address.state} onValueChange={handleStateChange}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent className="max-h-96">
                  {INDIAN_STATES.map((state) => (
                    <SelectItem key={state.code} value={state.name}>
                      {state.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Delivery Information */}
        {deliveryEstimate && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Delivery Information
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="text-sm">
                  Estimated delivery: <strong>{deliveryEstimate.minDays}-{deliveryEstimate.maxDays} days</strong>
                </span>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Serviceable
              </Badge>
            </div>
          </div>
        )}

        {/* Form Validation Summary */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isFormValid() ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-green-700 font-medium">Address is valid</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-600">Please fill all required fields</span>
                </>
              )}
            </div>
            <Button
              type="button"
              disabled={!isFormValid()}
              className="bg-green-600 hover:bg-green-700"
            >
              Continue to Payment
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AddressForm;
