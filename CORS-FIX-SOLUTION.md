# CORS Error Fix Solution

## Problem: "Failed to fetch" when validating pincode

The error occurs because the frontend (localhost:5000) cannot access the backend (localhost:8080) due to CORS (Cross-Origin Resource Sharing) restrictions.

## Solutions (try in order):

### 1. Start the Backend Server
```bash
cd e:\oil-website\oil-backend
.\run-app.bat
```

### 2. Verify Backend is Running
Open browser and test:
```
http://localhost:8080/api/ithink/serviceability?deliveryPincode=302021&weight=0.5&cod=false&productMrp=325
```

### 3. Check CORS Configuration
The backend already has CORS configured in:
- `WebConfig.java` - Global CORS settings
- `IThinkLogisticsController.java` - Controller-specific CORS

### 4. Alternative: Use Proxy in Frontend
If CORS persists, add proxy to frontend:
```json
// In package.json add:
"proxy": "http://localhost:8080"
```

### 5. Test with Different URLs
The frontend now tries multiple URLs:
- `http://localhost:8080/api/ithink/serviceability`
- `http://localhost:8080/api/shipping/ithink/serviceability`

## Quick Test Script
Run this to test connection:
```bash
node e:\oil-website\test-backend-connection.js
```

## Debug Steps:
1. Check if backend is running on port 8080
2. Verify CORS headers in browser network tab
3. Check browser console for specific error messages
4. Test backend endpoint directly in browser

## Expected Response:
```json
{
  "data": {
    "status": true/false,
    "message": "Serviceable/Manual delivery",
    "estimated_delivery": "3-5 business days"
  }
}
```

## Fallback Behavior:
If backend is unavailable, system automatically:
- Shows ₹99 manual delivery charge
- Displays "Backend unavailable" message
- Allows checkout to continue
