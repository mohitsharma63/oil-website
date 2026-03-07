package com.oli.api.controller;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api/shipping")
@CrossOrigin(origins = {
        "http://localhost:5000",
        "http://rajyadu.in",
        "https://rajyadu.in",
        "http://api.rajyadu.in",
        "https://api.rajyadu.in"
}, allowedHeaders = "*", methods = { RequestMethod.GET, RequestMethod.POST, RequestMethod.OPTIONS })
public class IThinkLogisticsController {

    private final RestTemplate restTemplate = new RestTemplate();

    @PostMapping("/check-pincode")
    public ResponseEntity<?> checkPincode(@RequestBody PincodeRequest request) {
        try {
            String url = "https://pre-alpha.ithinklogistics.com/api_v3/pincode/check.json";

            // Build the request body
            String requestBody = String.format(
                    "{\"data\":{\"pincode\":\"%s\",\"access_token\":\"%s\",\"secret_key\":\"%s\"}}",
                    request.getPincode(),
                    request.getAccessToken(),
                    request.getSecretKey());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Cache-Control", "no-cache");

            HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"error\": \"Failed to check pincode: " + e.getMessage() + "\"}");
        }
    }

    // New endpoint for serviceability check with query parameters
    @GetMapping("/ithink/serviceability")
    public ResponseEntity<?> checkServiceability(
            @RequestParam String deliveryPincode,
            @RequestParam(defaultValue = "0.5") double weight,
            @RequestParam(defaultValue = "false") boolean cod,
            @RequestParam(defaultValue = "325") double productMrp) {

        try {
            // For now, simulate serviceability based on common pincodes
            // TODO: Replace with actual Ithink Logistics API credentials
            boolean isServiceable = false;
            String message = "Manual delivery applicable";
            double shippingCharge = calculateShippingCharge(weight, cod, productMrp, false);

            // Common serviceable pincodes (major cities)
            String[] serviceablePincodes = {
                    "110001", "110002", "110003", // Delhi
                    "400001", "400002", "400003", // Mumbai
                    "560001", "560002", "560003", // Bangalore
                    "600001", "600002", "600003", // Chennai
                    "500001", "500002", "500003", // Hyderabad
                    "380001", "380002", // Ahmedabad
                    "302002", "302020", // Jaipur
                    "208001", "208002" // Kanpur
            };

            // Check if pincode is serviceable
            for (String serviceablePincode : serviceablePincodes) {
                if (deliveryPincode.startsWith(serviceablePincode.substring(0, 3))) {
                    isServiceable = true;
                    message = "Standard delivery available via Ithink Logistics";
                    shippingCharge = calculateShippingCharge(weight, cod, productMrp, true);
                    break;
                }
            }

            // Create standardized response
            ServiceabilityResponse serviceabilityResponse = new ServiceabilityResponse();
            serviceabilityResponse.setStatus(isServiceable);
            serviceabilityResponse.setMessage(message);
            serviceabilityResponse.setEstimated_delivery(isServiceable ? "3-5 business days" : "5-7 business days");
            serviceabilityResponse.setShippingCharge(shippingCharge);

            return ResponseEntity.ok(serviceabilityResponse);

            /*
             * // ACTUAL API CALL (commented until valid credentials are available)
             * String url =
             * "https://pre-alpha.ithinklogistics.com/api_v3/pincode/check.json";
             * String accessToken = "YOUR_VALID_ACCESS_TOKEN";
             * String secretKey = "YOUR_VALID_SECRET_KEY";
             * 
             * String requestBody = String.format(
             * "{\"data\":{\"pincode\":\"%s\",\"access_token\":\"%s\",\"secret_key\":\"%s\"}}",
             * deliveryPincode,
             * accessToken,
             * secretKey);
             * 
             * HttpHeaders headers = new HttpHeaders();
             * headers.setContentType(MediaType.APPLICATION_JSON);
             * headers.set("Cache-Control", "no-cache");
             * 
             * HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);
             * ResponseEntity<String> response = restTemplate.postForEntity(url, entity,
             * String.class);
             * 
             * // Parse the Ithink Logistics response and return a standardized format
             * String responseBody = response.getBody();
             * boolean isServiceable = false;
             * String message = "Manual delivery applicable";
             * 
             * try {
             * if (responseBody != null) {
             * // Parse the actual Ithink Logistics API response format
             * // Expected format:
             * {"status":"success","status_code":200,"data":{"400067":{"xpressbees":{
             * "prepaid":"Y","cod":"Y"...}}}}
             * 
             * // Check if the response indicates success and contains courier data
             * if (responseBody.contains("\"status\":\"success\"") &&
             * responseBody.contains("\"status_code\":200")) {
             * // Look for the pincode data in the response
             * if (responseBody.contains("\"" + deliveryPincode + "\"")) {
             * // Check if any courier service is available for this pincode
             * // Look for "prepaid":"Y" or "cod":"Y" in any courier section
             * if ((responseBody.contains("\"prepaid\":\"Y\"") ||
             * responseBody.contains("\"cod\":\"Y\""))
             * && responseBody.contains(deliveryPincode)) {
             * isServiceable = true;
             * message = "Standard delivery available via Ithink Logistics";
             * } else {
             * isServiceable = false;
             * message = "Service not available - Manual delivery applicable";
             * }
             * } else {
             * isServiceable = false;
             * message = "Pincode not serviceable - Manual delivery applicable";
             * }
             * } else if (responseBody.contains("\"status\":\"error\"") ||
             * responseBody.contains("\"status_code\":404")) {
             * isServiceable = false;
             * message = "Service not available - Manual delivery applicable";
             * }
             * }
             * } catch (Exception e) {
             * // If parsing fails, assume non-serviceable
             * isServiceable = false;
             * message = "Manual delivery applicable (API response unclear)";
             * }
             * 
             * // Create standardized response
             * ServiceabilityResponse serviceabilityResponse = new ServiceabilityResponse();
             * serviceabilityResponse.setStatus(isServiceable);
             * serviceabilityResponse.setMessage(message);
             * serviceabilityResponse.setEstimated_delivery(isServiceable ?
             * "3-5 business days" : "5-7 business days");
             * 
             * return ResponseEntity.ok(serviceabilityResponse);
             */
        } catch (Exception e) {
            // Return fallback response for manual delivery
            ServiceabilityResponse fallbackResponse = new ServiceabilityResponse();
            fallbackResponse.setStatus(false);
            fallbackResponse.setMessage("Manual delivery applicable (API unavailable)");
            fallbackResponse.setEstimated_delivery("5-7 business days");
            fallbackResponse.setShippingCharge(calculateShippingCharge(weight, cod, productMrp, false));

            return ResponseEntity.ok(fallbackResponse);
        }
    }

    @PostMapping("/get-rate")
    public ResponseEntity<?> getRate(@RequestBody RateRequest request) {
        try {
            String url = "https://pre-alpha.ithinklogistics.com/api_v3/rate/check.json";

            // Build the request body
            String requestBody = String.format(
                    "{\"data\":{\"from_pincode\":\"%s\",\"to_pincode\":\"%s\",\"shipping_length_cms\":\"%s\",\"shipping_width_cms\":\"%s\",\"shipping_height_cms\":\"%s\",\"shipping_weight_kg\":\"%s\",\"order_type\":\"%s\",\"payment_method\":\"%s\",\"product_mrp\":\"%s\",\"access_token\":\"%s\",\"secret_key\":\"%s\"}}",
                    request.getFromPincode(),
                    request.getToPincode(),
                    request.getShippingLength(),
                    request.getShippingWidth(),
                    request.getShippingHeight(),
                    request.getShippingWeight(),
                    request.getOrderType(),
                    request.getPaymentMethod(),
                    request.getProductMrp(),
                    request.getAccessToken(),
                    request.getSecretKey());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Cache-Control", "no-cache");

            HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"error\": \"Failed to get rate: " + e.getMessage() + "\"}");
        }
    }

    // New endpoint for comprehensive pincode validation with shipping charges
    @PostMapping("/validate-pincode")
    public ResponseEntity<?> validatePincode(@RequestBody PincodeValidationRequest request) {
        try {
            String url = "https://pre-alpha.ithinklogistics.com/api_v3/pincode/check.json";

            // Build the request body
            String requestBody = String.format(
                    "{\"data\":{\"pincode\":\"%s\",\"access_token\":\"%s\",\"secret_key\":\"%s\"}}",
                    request.getPincode(),
                    "8ujik47cea32ed386b1f65c85fd9aaaf",
                    "65tghjmads9dbcd892ad4987jmn602a7");

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Cache-Control", "no-cache");

            HttpEntity<String> serviceabilityEntity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> serviceabilityResponse = restTemplate.postForEntity(url, serviceabilityEntity,
                    String.class);

            // Parse the serviceability response
            boolean isServiceable = false;
            double shippingCharge = 99.0; // Default manual delivery charge
            String message = "Manual delivery applicable";

            try {
                // Parse the actual Ithink Logistics API response format
                String responseBody = serviceabilityResponse.getBody();
                if (responseBody != null) {
                    // Expected format:
                    // {"status":"success","status_code":200,"data":{"302002":{"xpressbees":{"prepaid":"Y","cod":"Y"...}}}}

                    // Check if the response indicates success and contains courier data
                    if (responseBody.contains("\"status\":\"success\"")
                            && responseBody.contains("\"status_code\":200")) {
                        // Look for the pincode data in the response
                        if (responseBody.contains("\"" + request.getPincode() + "\"")) {
                            // Check if any courier service is available for this pincode
                            // Look for "prepaid":"Y" or "cod":"Y" in any courier section
                            if ((responseBody.contains("\"prepaid\":\"Y\"") || responseBody.contains("\"cod\":\"Y\""))
                                    && responseBody.contains(request.getPincode())) {
                                isServiceable = true;
                                shippingCharge = 0.0; // Free delivery for serviceable areas
                                message = "Standard delivery available";
                            } else {
                                isServiceable = false;
                                shippingCharge = 99.0;
                                message = "Service not available - Manual delivery applicable";
                            }
                        } else {
                            isServiceable = false;
                            shippingCharge = 99.0;
                            message = "Pincode not serviceable - Manual delivery applicable";
                        }
                    } else if (responseBody.contains("\"status\":\"error\"")
                            || responseBody.contains("\"status_code\":404")) {
                        isServiceable = false;
                        shippingCharge = 99.0;
                        message = "Service not available - Manual delivery applicable";
                    }
                }
            } catch (Exception e) {
                // If parsing fails, assume non-serviceable
                isServiceable = false;
                shippingCharge = 99.0;
                message = "Manual delivery applicable (API response unclear)";
            }

            // Validate city and state if provided
            boolean cityStateValid = true;
            String validationMessage = message;

            if (request.getCity() != null && request.getState() != null) {
                // Here you would typically validate against a database of pincodes
                // For now, we'll do basic validation
                cityStateValid = validateCityState(request.getPincode(), request.getCity(), request.getState());
                if (!cityStateValid) {
                    validationMessage = "City/State does not match pincode";
                }
            }

            // Build response
            PincodeValidationResponse response = new PincodeValidationResponse();
            response.setPincode(request.getPincode());
            response.setServiceable(isServiceable);
            response.setShippingCharge(shippingCharge);
            response.setMessage(validationMessage);
            response.setCityStateValid(cityStateValid);
            response.setEstimatedDelivery("3-5 business days");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            // Return manual delivery if API fails
            PincodeValidationResponse fallbackResponse = new PincodeValidationResponse();
            fallbackResponse.setPincode(request.getPincode());
            fallbackResponse.setServiceable(false);
            fallbackResponse.setShippingCharge(99.0);
            fallbackResponse.setMessage("Manual delivery applicable (API unavailable)");
            fallbackResponse.setCityStateValid(true);
            fallbackResponse.setEstimatedDelivery("5-7 business days");

            return ResponseEntity.ok(fallbackResponse);
        }
    }

    // Simple city/state validation method (you should enhance this with actual
    // data)
    private boolean validateCityState(String pincode, String city, String state) {
        // Basic validation - you should replace this with actual pincode database
        if (pincode == null || pincode.length() != 6)
            return false;
        if (city == null || city.trim().isEmpty())
            return false;
        if (state == null || state.trim().isEmpty())
            return false;

        // For now, just check if inputs are reasonable
        return pincode.matches("\\d{6}") && city.length() > 2 && state.length() > 2;
    }

    // Calculate shipping charges based on weight, COD, and serviceability
    private double calculateShippingCharge(double weight, boolean cod, double productMrp, boolean isServiceable) {
        if (isServiceable) {
            // Free shipping for serviceable areas above certain amount
            if (productMrp >= 500) {
                return 0.0;
            }
            // Base charge for serviceable areas
            double baseCharge = 40.0;

            // Add weight-based charges
            if (weight <= 0.5) {
                return baseCharge;
            } else if (weight <= 1.0) {
                return baseCharge + 20;
            } else if (weight <= 2.0) {
                return baseCharge + 40;
            } else {
                return baseCharge + 80;
            }
        } else {
            // Manual delivery charges
            double baseCharge = 99.0;

            // Add COD charges if applicable
            if (cod) {
                baseCharge += 50;
            }

            // Add weight-based charges for heavy items
            if (weight > 2.0) {
                baseCharge += (weight - 2.0) * 50;
            }

            return baseCharge;
        }
    }

    // Response DTO for serviceability
    public static class ServiceabilityResponse {
        private Boolean status;
        private String message;
        private String estimated_delivery;
        private Double shippingCharge;

        // Getters and Setters
        public Boolean getStatus() {
            return status;
        }

        public void setStatus(Boolean status) {
            this.status = status;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }

        public String getEstimated_delivery() {
            return estimated_delivery;
        }

        public void setEstimated_delivery(String estimated_delivery) {
            this.estimated_delivery = estimated_delivery;
        }

        public Double getShippingCharge() {
            return shippingCharge;
        }

        public void setShippingCharge(Double shippingCharge) {
            this.shippingCharge = shippingCharge;
        }
    }

    // Request DTOs
    public static class PincodeRequest {
        private String pincode;
        private String accessToken;
        private String secretKey;

        // Getters and Setters
        public String getPincode() {
            return pincode;
        }

        public void setPincode(String pincode) {
            this.pincode = pincode;
        }

        public String getAccessToken() {
            return accessToken;
        }

        public void setAccessToken(String accessToken) {
            this.accessToken = accessToken;
        }

        public String getSecretKey() {
            return secretKey;
        }

        public void setSecretKey(String secretKey) {
            this.secretKey = secretKey;
        }
    }

    // New DTOs for pincode validation
    public static class PincodeValidationRequest {
        private String pincode;
        private String city;
        private String state;

        // Getters and Setters
        public String getPincode() {
            return pincode;
        }

        public void setPincode(String pincode) {
            this.pincode = pincode;
        }

        public String getCity() {
            return city;
        }

        public void setCity(String city) {
            this.city = city;
        }

        public String getState() {
            return state;
        }

        public void setState(String state) {
            this.state = state;
        }
    }

    public static class PincodeValidationResponse {
        private String pincode;
        private boolean serviceable;
        private double shippingCharge;
        private String message;
        private boolean cityStateValid;
        private String estimatedDelivery;

        // Getters and Setters
        public String getPincode() {
            return pincode;
        }

        public void setPincode(String pincode) {
            this.pincode = pincode;
        }

        public boolean isServiceable() {
            return serviceable;
        }

        public void setServiceable(boolean serviceable) {
            this.serviceable = serviceable;
        }

        public double getShippingCharge() {
            return shippingCharge;
        }

        public void setShippingCharge(double shippingCharge) {
            this.shippingCharge = shippingCharge;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }

        public boolean isCityStateValid() {
            return cityStateValid;
        }

        public void setCityStateValid(boolean cityStateValid) {
            this.cityStateValid = cityStateValid;
        }

        public String getEstimatedDelivery() {
            return estimatedDelivery;
        }

        public void setEstimatedDelivery(String estimatedDelivery) {
            this.estimatedDelivery = estimatedDelivery;
        }
    }

    public static class RateRequest {
        private String fromPincode;
        private String toPincode;
        private String shippingLength;
        private String shippingWidth;
        private String shippingHeight;
        private String shippingWeight;
        private String orderType;
        private String paymentMethod;
        private String productMrp;
        private String accessToken;
        private String secretKey;

        // Getters and Setters
        public String getFromPincode() {
            return fromPincode;
        }

        public void setFromPincode(String fromPincode) {
            this.fromPincode = fromPincode;
        }

        public String getToPincode() {
            return toPincode;
        }

        public void setToPincode(String toPincode) {
            this.toPincode = toPincode;
        }

        public String getShippingLength() {
            return shippingLength;
        }

        public void setShippingLength(String shippingLength) {
            this.shippingLength = shippingLength;
        }

        public String getShippingWidth() {
            return shippingWidth;
        }

        public void setShippingWidth(String shippingWidth) {
            this.shippingWidth = shippingWidth;
        }

        public String getShippingHeight() {
            return shippingHeight;
        }

        public void setShippingHeight(String shippingHeight) {
            this.shippingHeight = shippingHeight;
        }

        public String getShippingWeight() {
            return shippingWeight;
        }

        public void setShippingWeight(String shippingWeight) {
            this.shippingWeight = shippingWeight;
        }

        public String getOrderType() {
            return orderType;
        }

        public void setOrderType(String orderType) {
            this.orderType = orderType;
        }

        public String getPaymentMethod() {
            return paymentMethod;
        }

        public void setPaymentMethod(String paymentMethod) {
            this.paymentMethod = paymentMethod;
        }

        public String getProductMrp() {
            return productMrp;
        }

        public void setProductMrp(String productMrp) {
            this.productMrp = productMrp;
        }

        public String getAccessToken() {
            return accessToken;
        }

        public void setAccessToken(String accessToken) {
            this.accessToken = accessToken;
        }

        public String getSecretKey() {
            return secretKey;
        }

        public void setSecretKey(String secretKey) {
            this.secretKey = secretKey;
        }
    }
}
