//package com.oli.oli.controller;
//
//import com.oli.oli.model.Payment;
//import com.oli.oli.service.PaymentService;
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//import jakarta.servlet.http.HttpServletRequest;
//import java.util.Map;
//
//@RestController
//@RequestMapping("/api/payments")
//@RequiredArgsConstructor
//@Slf4j
//@CrossOrigin(origins = "*")
//public class PaymentController {
//
//    private final PaymentService paymentService;
//
//    @PostMapping("/webhook")
//    public ResponseEntity<String> handleCashfreeWebhook(
//            @RequestBody Map<String, Object> webhookData,
//            @RequestHeader("X-Cashfree-Signature") String signature,
//            HttpServletRequest request) {
//
//        try {
//            log.info("Received Cashfree webhook: {}", webhookData);
//
//            // Verify webhook signature
//            String payload = request.getReader().lines().reduce("", String::concat);
//            boolean isValidSignature = paymentService.validateWebhookSignature(signature, payload);
//
//            if (!isValidSignature) {
//                log.warn("Invalid webhook signature received");
//                return ResponseEntity.badRequest().body("Invalid signature");
//            }
//
//            // Process webhook data
//            String eventType = (String) webhookData.get("type");
//            Map<String, Object> eventData = (Map<String, Object>) webhookData.get("data");
//
//            switch (eventType) {
//                case "PAYMENT_SUCCESS" -> {
//                    String orderId = (String) eventData.get("order_id");
//                    String transactionId = (String) eventData.get("transaction_id");
//                    Map<String, Object> paymentData = (Map<String, Object>) eventData.get("payment");
//
//                    paymentService.processPayment(transactionId, paymentData);
//                    log.info("Payment processed successfully: {}", transactionId);
//                }
//                case "PAYMENT_FAILED" -> {
//                    String orderId = (String) eventData.get("order_id");
//                    String transactionId = (String) eventData.get("transaction_id");
//                    Map<String, Object> paymentData = (Map<String, Object>) eventData.get("payment");
//
//                    paymentService.processPayment(transactionId, paymentData);
//                    log.warn("Payment failed: {}", transactionId);
//                }
//                default -> {
//                    log.info("Unhandled webhook event type: {}", eventType);
//                }
//            }
//
//            return ResponseEntity.ok("Webhook processed successfully");
//
//        } catch (Exception e) {
//            log.error("Error processing webhook: {}", e.getMessage(), e);
//            return ResponseEntity.internalServerError().body("Webhook processing failed");
//        }
//    }
//
//    @PostMapping("/verify")
//    public ResponseEntity<Map<String, Object>> verifyPayment(@RequestBody Map<String, Object> verificationData) {
//        try {
//            String transactionId = (String) verificationData.get("transactionId");
//            String orderId = (String) verificationData.get("orderId");
//            String status = (String) verificationData.get("status");
//            Double amount = (Double) verificationData.get("amount");
//
//            Map<String, Object> paymentResponse = Map.of(
//                    "transactionId", transactionId,
//                    "orderId", orderId,
//                    "status", status,
//                    "amount", amount);
//
//            Payment payment = paymentService.processPayment(transactionId, paymentResponse);
//
//            return ResponseEntity.ok(Map.of(
//                    "success", true,
//                    "paymentStatus", payment.getStatus(),
//                    "message", "Payment verified successfully"));
//
//        } catch (Exception e) {
//            log.error("Error verifying payment: {}", e.getMessage(), e);
//            return ResponseEntity.badRequest().body(Map.of(
//                    "success", false,
//                    "message", "Payment verification failed"));
//        }
//    }
//
//    @GetMapping("/status/{orderId}")
//    public ResponseEntity<Map<String, Object>> getPaymentStatus(@PathVariable String orderId) {
//        try {
//            // This would typically query the payment gateway for real-time status
//            // For now, we'll return the status from our database
//            Map<String, Object> paymentStatus = Map.of(
//                    "orderId", orderId,
//                    "status", "PENDING",
//                    "amount", 0.0,
//                    "paidAmount", 0.0,
//                    "paymentMethod", "CASHFREE");
//
//            return ResponseEntity.ok(paymentStatus);
//
//        } catch (Exception e) {
//            log.error("Error getting payment status: {}", e.getMessage(), e);
//            return ResponseEntity.internalServerError().body(Map.of(
//                    "error", "Failed to get payment status"));
//        }
//    }
//
//    @PostMapping("/refund")
//    public ResponseEntity<Map<String, Object>> refundPayment(@RequestBody Map<String, Object> refundData) {
//        try {
//            String transactionId = (String) refundData.get("transactionId");
//            Double amount = (Double) refundData.get("amount");
//            String reason = (String) refundData.get("reason");
//
//            // Process refund logic here
//            Map<String, Object> refundResponse = Map.of(
//                    "success", true,
//                    "refundId", "REF" + System.currentTimeMillis(),
//                    "amount", amount,
//                    "status", "PROCESSING",
//                    "message", "Refund initiated successfully");
//
//            return ResponseEntity.ok(refundResponse);
//
//        } catch (Exception e) {
//            log.error("Error processing refund: {}", e.getMessage(), e);
//            return ResponseEntity.badRequest().body(Map.of(
//                    "success", false,
//                    "message", "Refund processing failed"));
//        }
//    }
//
//    @GetMapping("/methods")
//    public ResponseEntity<Map<String, Object>> getPaymentMethods() {
//        try {
//            Map<String, Object> paymentMethods = Map.of(
//                    "methods", Map.of(
//                            "cashfree", Map.of(
//                                    "name", "Cashfree",
//                                    "enabled", true,
//                                    "supportedMethods", Map.of(
//                                            "upi", true,
//                                            "card", true,
//                                            "netbanking", true,
//                                            "wallet", true)),
//                            "cod", Map.of(
//                                    "name", "Cash on Delivery",
//                                    "enabled", true,
//                                    "description", "Pay when you receive")));
//
//            return ResponseEntity.ok(paymentMethods);
//
//        } catch (Exception e) {
//            log.error("Error getting payment methods: {}", e.getMessage(), e);
//            return ResponseEntity.internalServerError().body(Map.of(
//                    "error", "Failed to get payment methods"));
//        }
//    }
//
//    @GetMapping("/transaction/{transactionId}")
//    public ResponseEntity<Map<String, Object>> getTransactionDetails(@PathVariable String transactionId) {
//        try {
//            Payment payment = paymentService.getPaymentByTransactionId(transactionId);
//
//            Map<String, Object> transactionDetails = Map.of(
//                    "transactionId", payment.getTransactionId(),
//                    "orderId", payment.getOrder().getOrderNumber(),
//                    "amount", payment.getAmount(),
//                    "status", payment.getStatus(),
//                    "gateway", payment.getGateway(),
//                    "type", payment.getType(),
//                    "createdAt", payment.getCreatedAt(),
//                    "gatewayResponse", payment.getGatewayResponse());
//
//            return ResponseEntity.ok(transactionDetails);
//
//        } catch (Exception e) {
//            log.error("Error getting transaction details: {}", e.getMessage(), e);
//            return ResponseEntity.notFound().build();
//        }
//    }
//}
