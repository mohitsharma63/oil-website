# iThink Logistics Integration Guide

## Overview
This integration provides real-time shipping rate calculations and pincode serviceability checks using the iThink Logistics API.

## Setup Instructions

### 1. Get API Credentials
1. Sign up for an iThink Logistics account at https://www.ithinklogistics.com/
2. Navigate to your account settings to find your API credentials
3. You will need:
   - Access Token
   - Secret Key

### 2. Configure Environment Variables
Add the following to your `.env` file:

```bash
# iThink Logistics API Configuration
VITE_ITHINK_ACCESS_TOKEN=your_actual_access_token_here
VITE_ITHINK_SECRET_KEY=your_actual_secret_key_here
VITE_ITHINK_PRODUCTION=false  # Set to true for production
```

### 3. Test the Integration

#### Testing Pincode Serviceability
```javascript
import { enhancedPincodeValidator } from '@/services/enhanced-pincode-validator';

// Test if a pincode is serviceable
const result = await enhancedPincodeValidator.validatePincodeForState(
  '400067', // Mumbai pincode
  'Maharashtra',
  {
    length: 20,
    width: 15,
    height: 10,
    weight: 0.5,
    value: 1000
  },
  'prepaid'
);

console.log(result);
```

#### Sample Test Pincodes
- **400067** - Mumbai (Metro, should have fast delivery)
- **110001** - Delhi (Metro, should have fast delivery)
- **560001** - Bangalore (Metro, should have fast delivery)
- **600001** - Chennai (Metro, should have fast delivery)
- **380001** - Ahmedabad (Tier 2 city)
- **500001** - Hyderabad (Metro)

## Features

### 1. Real-time Shipping Rates
- Calculates exact shipping costs based on package dimensions, weight, and value
- Supports both prepaid and COD payment methods
- Returns multiple carrier options with best rate selection

### 2. Pincode Serviceability
- Checks if delivery is available to specific pincodes
- Returns available carriers for each pincode
- Provides delivery time estimates

### 3. Enhanced Validation
- Combines iThink Logistics API with existing pincode validation
- Graceful fallback to basic validation if API is unavailable
- Auto-fills city information based on pincode

## API Endpoints Used

### Pincode Check
- **URL**: `https://pre-alpha.ithinklogistics.com/api_v3/pincode/check.json`
- **Method**: POST
- **Purpose**: Check if pincode is serviceable and get available carriers

### Rate Check
- **URL**: `https://pre-alpha.ithinklogistics.com/api_v3/rate/check.json`
- **Method**: POST
- **Purpose**: Get shipping rates for specific route and package details

## Integration Architecture

```
Checkout Page
    ↓
Enhanced Pincode Validator
    ↓
iThink Logistics Service ←→ iThink Logistics API
    ↓
Original Pincode Validator (fallback)
```

## Error Handling

The integration includes comprehensive error handling:
- Network failures fall back to basic validation
- Invalid API credentials show warnings but don't break functionality
- Rate limiting is handled gracefully
- All errors are logged for debugging

## Production Considerations

1. **API Rate Limits**: Monitor your API usage to avoid rate limits
2. **Caching**: Consider caching pincode results to reduce API calls
3. **Error Monitoring**: Set up alerts for API failures
4. **Fallback**: Always have the basic validation as backup

## Testing Checklist

- [ ] Test with valid serviceable pincodes
- [ ] Test with invalid/non-serviceable pincodes
- [ ] Test both prepaid and COD payment methods
- [ ] Test with different package sizes and weights
- [ ] Test network failure scenarios
- [ ] Verify shipping cost calculations
- [ ] Verify delivery time estimates
- [ ] Test carrier selection logic

## Support

For iThink Logistics API issues:
- Documentation: https://docs.ithinklogistics.com/
- Support: https://www.ithinklogistics.com/contact

For integration issues, check the browser console for error messages and ensure all environment variables are properly configured.
