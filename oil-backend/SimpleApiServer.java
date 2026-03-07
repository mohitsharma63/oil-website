import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;
import java.io.IOException;
import java.io.OutputStream;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.InetSocketAddress;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.ArrayList;
import java.util.concurrent.atomic.AtomicLong;

public class SimpleApiServer {

    // In-memory storage for orders (for demo purposes)
    private static List<Map<String, Object>> orders = new ArrayList<>();
    private static AtomicLong orderIdCounter = new AtomicLong(1);

    public static void main(String[] args) throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress(8080), 0);

        // Serviceability endpoint
        server.createContext("/api/shipping/ithink/serviceability", new ServiceabilityHandler());

        // Validate pincode endpoint
        server.createContext("/api/shipping/validate-pincode", new ValidatePincodeHandler());

        // Order endpoints
        server.createContext("/api/orders", new OrderHandler());
        server.createContext("/api/orders/payment", new PaymentHandler());

        server.setExecutor(null); // creates a default executor
        server.start();
        System.out.println("Server started on port 8080");
        System.out.println("Serviceability endpoint: http://localhost:8080/api/shipping/ithink/serviceability");
        System.out.println("Validate endpoint: http://localhost:8080/api/shipping/validate-pincode");
        System.out.println("Orders endpoint: http://localhost:8080/api/orders");
        System.out.println("Payment endpoint: http://localhost:8080/api/orders/payment");
    }

    static class ServiceabilityHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("GET".equals(exchange.getRequestMethod())) {
                String query = exchange.getRequestURI().getQuery();
                Map<String, String> params = parseQueryParams(query);

                String deliveryPincode = params.get("deliveryPincode");
                double weight = Double.parseDouble(params.getOrDefault("weight", "0.5"));
                boolean cod = Boolean.parseBoolean(params.getOrDefault("cod", "false"));
                double productMrp = Double.parseDouble(params.getOrDefault("productMrp", "325"));

                // Check if pincode is serviceable
                boolean isServiceable = false;
                String message = "Manual delivery applicable";

                // Serviceable pincodes (major cities)
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
                    if (deliveryPincode != null && deliveryPincode.startsWith(serviceablePincode.substring(0, 3))) {
                        isServiceable = true;
                        message = "Standard delivery available via Ithink Logistics";
                        break;
                    }
                }

                // Calculate shipping charges
                double shippingCharge = calculateShippingCharge(weight, cod, productMrp, isServiceable);

                // Create response
                String jsonResponse = String.format(
                        "{\"status\":%s,\"message\":\"%s\",\"estimated_delivery\":\"%s\",\"shippingCharge\":%.2f}",
                        isServiceable,
                        message,
                        isServiceable ? "3-5 business days" : "5-7 business days",
                        shippingCharge);

                sendResponse(exchange, 200, jsonResponse);
            } else {
                sendResponse(exchange, 405, "{\"error\":\"Method not allowed\"}");
            }
        }
    }

    static class ValidatePincodeHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("POST".equals(exchange.getRequestMethod())) {
                // Simple implementation for validation
                String jsonResponse = "{\"pincode\":\"302002\",\"serviceable\":true,\"shippingCharge\":0.0,\"message\":\"Standard delivery available\",\"cityStateValid\":true,\"estimatedDelivery\":\"3-5 business days\"}";
                sendResponse(exchange, 200, jsonResponse);
            } else {
                sendResponse(exchange, 405, "{\"error\":\"Method not allowed\"}");
            }
        }
    }

    static class OrderHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("POST".equals(exchange.getRequestMethod())) {
                // Read request body
                String requestBody = readRequestBody(exchange);

                // Parse order data (simplified for demo)
                Map<String, Object> order = new HashMap<>();
                order.put("id", orderIdCounter.getAndIncrement());
                order.put("status", "PENDING");
                order.put("paymentStatus", "PENDING");
                order.put("createdAt", System.currentTimeMillis());

                // Add parsed data (in real implementation, this would be proper JSON parsing)
                order.put("data", requestBody);

                // Save order
                orders.add(order);

                // Create response
                String jsonResponse = String.format(
                        "{\"id\":%d,\"status\":\"PENDING\",\"paymentStatus\":\"PENDING\",\"message\":\"Order created successfully\"}",
                        order.get("id"));

                sendResponse(exchange, 200, jsonResponse);
            } else if ("GET".equals(exchange.getRequestMethod())) {
                // Return all orders for admin
                StringBuilder jsonBuilder = new StringBuilder();
                jsonBuilder.append("[");

                for (int i = 0; i < orders.size(); i++) {
                    Map<String, Object> order = orders.get(i);
                    jsonBuilder.append(String.format(
                            "{\"id\":%d,\"status\":\"%s\",\"paymentStatus\":\"%s\",\"createdAt\":%d,\"data\":\"%s\"}",
                            order.get("id"),
                            order.get("status"),
                            order.get("paymentStatus"),
                            order.get("createdAt"),
                            order.get("data")));

                    if (i < orders.size() - 1) {
                        jsonBuilder.append(",");
                    }
                }

                jsonBuilder.append("]");
                sendResponse(exchange, 200, jsonBuilder.toString());
            } else {
                sendResponse(exchange, 405, "{\"error\":\"Method not allowed\"}");
            }
        }
    }

    static class PaymentHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("POST".equals(exchange.getRequestMethod())) {
                // Read request body
                String requestBody = readRequestBody(exchange);

                // Parse order data (simplified)
                Map<String, Object> orderData = parseOrderData(requestBody);
                double amount = Double.parseDouble(orderData.getOrDefault("amount", "0").toString());

                // Create Cashfree payment order
                Map<String, Object> cashfreeOrder = createCashfreeOrder(amount, orderData);

                // Update order status
                for (Map<String, Object> order : orders) {
                    if ("PENDING".equals(order.get("paymentStatus"))) {
                        order.put("paymentStatus", "PROCESSING");
                        order.put("status", "PROCESSING");
                        break;
                    }
                }

                String jsonResponse = String.format(
                        "{\"status\":\"INITIATED\",\"paymentId\":\"%s\",\"orderId\":\"%s\",\"paymentSessionId\":\"%s\",\"message\":\"Payment initiated\",\"redirectUrl\":\"%s\"}",
                        cashfreeOrder.get("cf_order_id"),
                        cashfreeOrder.get("order_id"),
                        cashfreeOrder.get("payment_session_id"),
                        cashfreeOrder.get("payment_link"));

                sendResponse(exchange, 200, jsonResponse);
            } else {
                sendResponse(exchange, 405, "{\"error\":\"Method not allowed\"}");
            }
        }
    }

    private static Map<String, Object> createCashfreeOrder(double amount, Map<String, Object> orderData) {
        Map<String, Object> cashfreeOrder = new HashMap<>();

        // Generate unique order ID
        String orderId = "ORD_" + System.currentTimeMillis();
        String cfOrderId = "CF_" + System.currentTimeMillis();

        // Cashfree order details
        cashfreeOrder.put("order_id", orderId);
        cashfreeOrder.put("cf_order_id", cfOrderId);
        cashfreeOrder.put("order_amount", amount);
        cashfreeOrder.put("order_currency", "INR");
        cashfreeOrder.put("customer_details", Map.of(
                "customer_id", "CUST_" + System.currentTimeMillis(),
                "customer_name", orderData.getOrDefault("customerName", "Customer"),
                "customer_email", orderData.getOrDefault("customerEmail", "customer@example.com"),
                "customer_phone", orderData.getOrDefault("customerPhone", "9999999999")));
        cashfreeOrder.put("order_meta", Map.of(
                "shipping_address", orderData.getOrDefault("shippingAddress", ""),
                "order_items", orderData.getOrDefault("items", "[]")));

        // Create payment session (simplified - in real implementation, this would call
        // Cashfree API)
        String paymentSessionId = "PS_" + System.currentTimeMillis();
        cashfreeOrder.put("payment_session_id", paymentSessionId);

        // Cashfree payment link (test environment)
        String paymentLink = String.format(
                "https://payments.cashfree.com/order/%s?session_id=%s",
                cfOrderId,
                paymentSessionId);
        cashfreeOrder.put("payment_link", paymentLink);

        return cashfreeOrder;
    }

    private static Map<String, Object> parseOrderData(String requestBody) {
        Map<String, Object> orderData = new HashMap<>();
        // Simplified parsing - in real implementation, use proper JSON parser
        if (requestBody.contains("amount")) {
            String[] parts = requestBody.split("\"amount\":");
            if (parts.length > 1) {
                String amountStr = parts[1].split(",")[0].replace("}", "").trim();
                orderData.put("amount", amountStr);
            }
        }
        if (requestBody.contains("customerName")) {
            String[] parts = requestBody.split("\"customerName\":");
            if (parts.length > 1) {
                String nameStr = parts[1].split(",")[0].replace("\"", "").trim();
                orderData.put("customerName", nameStr);
            }
        }
        if (requestBody.contains("customerEmail")) {
            String[] parts = requestBody.split("\"customerEmail\":");
            if (parts.length > 1) {
                String emailStr = parts[1].split(",")[0].replace("\"", "").trim();
                orderData.put("customerEmail", emailStr);
            }
        }
        if (requestBody.contains("customerPhone")) {
            String[] parts = requestBody.split("\"customerPhone\":");
            if (parts.length > 1) {
                String phoneStr = parts[1].split(",")[0].replace("\"", "").trim();
                orderData.put("customerPhone", phoneStr);
            }
        }
        return orderData;
    }

    private static String readRequestBody(HttpExchange exchange) throws IOException {
        BufferedReader reader = new BufferedReader(new InputStreamReader(exchange.getRequestBody()));
        StringBuilder body = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
            body.append(line);
        }
        reader.close();
        return body.toString();
    }

    private static double calculateShippingCharge(double weight, boolean cod, double productMrp,
            boolean isServiceable) {
        if (isServiceable) {
            // Free shipping for serviceable areas above certain amount
            if (productMrp >= 2000) {
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

    private static Map<String, String> parseQueryParams(String query) {
        Map<String, String> params = new HashMap<>();
        if (query != null) {
            String[] pairs = query.split("&");
            for (String pair : pairs) {
                int idx = pair.indexOf("=");
                if (idx > 0) {
                    String key = URLDecoder.decode(pair.substring(0, idx), StandardCharsets.UTF_8);
                    String value = URLDecoder.decode(pair.substring(idx + 1), StandardCharsets.UTF_8);
                    params.put(key, value);
                }
            }
        }
        return params;
    }

    private static void sendResponse(HttpExchange exchange, int statusCode, String response) throws IOException {
        exchange.getResponseHeaders().set("Content-Type", "application/json");
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type");
        exchange.sendResponseHeaders(statusCode, response.getBytes().length);
        OutputStream os = exchange.getResponseBody();
        os.write(response.getBytes());
        os.close();
    }
}
