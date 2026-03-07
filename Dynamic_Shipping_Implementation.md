# Dynamic Shipping Charges Implementation

## Overview
This implementation adds dynamic shipping charges based on pincode, weight, COD status, and product MRP using the IThink Logistics API integration.

## Features Implemented

### 1. Backend Changes (`oil-backend/src/main/java/com/oli/api/controller/IThinkLogisticsController.java`)

#### New API Endpoint: `/api/shipping/ithink/serviceability`
- **Method**: GET
- **Parameters**:
  - `deliveryPincode` (required): 6-digit pincode
  - `weight` (optional, default: 0.5): Cart weight in kg
  - `cod` (optional, default: false): Whether payment is COD
  - `productMrp` (optional, default: 325): Total cart value

#### Dynamic Shipping Charge Calculation
The `calculateShippingCharge()` method implements:

**For Serviceable Areas:**
- Free shipping for orders ≥ ₹500
- Base charge: ₹40 for weights ≤ 0.5kg
- Additional charges:
  - ≤ 1.0kg: +₹20
  - ≤ 2.0kg: +₹40
  - > 2.0kg: +₹80

**For Non-Serviceable Areas (Manual Delivery):**
- Base charge: ₹99
- COD surcharge: +₹50 (if COD)
- Heavy item surcharge: +₹50 per kg above 2kg

#### Serviceable Pincodes
Major cities are automatically serviceable:
- Delhi (110xxx)
- Mumbai (400xxx)
- Bangalore (560xxx)
- Chennai (600xxx)
- Hyderabad (500xxx)
- Ahmedabad (380xxx)
- Jaipur (302xxx)
- Kanpur (208xxx)

### 2. Frontend Changes (`oil-client/client/src/hooks/use-pincode-validation.tsx`)

#### New Hook: `usePincodeValidation`
Features:
- **Dynamic Weight Calculation**: Calculates total cart weight based on items
- **MRP Calculation**: Sums up total cart value
- **API Integration**: Calls backend with cart parameters
- **COD Support**: Revalidates when payment method changes
- **Error Handling**: Fallback to manual delivery if API fails

#### Hook Interface
```typescript
const {
  validatePincode,
  isValidating,
  validationResult,
  error,
  clearValidation,
  cartWeight,
  cartMrp
} = usePincodeValidation();
```

### 3. Checkout Page Updates (`oil-client/client/src/pages/checkout.tsx`)

#### Enhanced Features:
- **Real-time Validation**: Triggers on 6-digit pincode entry
- **Payment Method Integration**: Updates charges when COD is selected
- **Weight Display**: Shows cart weight in order summary
- **COD Surcharge**: Displays additional COD charges
- **Dynamic Updates**: Recalculates when cart items change

#### UI Enhancements:
- Cart weight display in order summary
- COD surcharge indicator
- Serviceability status with color coding
- Real-time shipping charge updates

## API Response Format

### Serviceability Response
```json
{
  "status": true,
  "message": "Standard delivery available via Ithink Logistics",
  "estimated_delivery": "3-5 business days",
  "shippingCharge": 40.0
}
```

### Validation Response
```json
{
  "pincode": "302021",
  "serviceable": true,
  "shippingCharge": 0.0,
  "message": "Standard delivery available",
  "cityStateValid": true,
  "estimatedDelivery": "3-5 business days"
}
```

## Testing

### Backend Testing
Use the test script: `test-shipping-api.js`
```bash
node test-shipping-api.js
```

### Frontend Testing
Open: `test-shipping-frontend.html` in browser

### Manual Testing
1. Add items to cart
2. Go to checkout
3. Enter different pincodes:
   - Serviceable: 110001, 302021, 560001
   - Non-serviceable: 999999
4. Change payment method to see COD charges
5. Verify weight-based pricing

## Configuration

### Environment Variables
Backend runs on: `http://localhost:8080`
Frontend should proxy API calls to backend

### CORS Configuration
Backend allows:
- http://localhost:5000
- http://rajyadu.in
- https://rajyadu.in
- http://api.rajyadu.in
- https://api.rajyadu.in

## Future Enhancements

1. **Real IThink API Integration**: Replace mock logic with actual API calls
2. **Database Integration**: Store pincode-serviceability mapping
3. **Advanced Weight Calculation**: Product-specific weights
4. **Multiple Couriers**: Rate comparison between couriers
5. **Delivery Date Selection**: Allow users to choose delivery dates
6. **International Shipping**: Support for international pincodes

## Troubleshooting

### Common Issues:
1. **Backend Not Running**: Start Spring Boot application
2. **CORS Errors**: Check allowed origins in backend
3. **Weight Calculation**: Ensure products have weight property
4. **API Timeouts**: Check network connectivity

### Debug Steps:
1. Check browser console for errors
2. Verify backend logs
3. Test API endpoints directly
4. Check cart weight calculation
5. Verify pincode format (6 digits)

## Files Modified

### Backend:
- `IThinkLogisticsController.java`: Enhanced serviceability endpoint

### Frontend:
- `use-pincode-validation.tsx`: New hook with dynamic pricing
- `checkout.tsx`: Enhanced checkout with real-time validation

### Test Files:
- `test-shipping-api.js`: Backend API testing
- `test-shipping-frontend.html`: Frontend testing interface
- `Dynamic_Shipping_Implementation.md`: This documentation
