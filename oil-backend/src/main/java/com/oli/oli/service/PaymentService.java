//package com.oli.oli.service;
//
//import com.oli.oli.model.Order;
//import com.oli.oli.model.Payment;
//import com.oli.oli.repository.PaymentRepository;
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.math.BigDecimal;
//import java.time.LocalDateTime;
//import java.util.HashMap;
//import java.util.Map;
//import java.util.UUID;
//
//@Service
//@RequiredArgsConstructor
//@Slf4j
//public class PaymentService {
//    
//    private final PaymentRepository paymentRepository;
//    
//    @Value("${cashfree.api.url:https://api.cashfree.com/pg/orders}")
//    private String cashfreeApiUrl;
//    
//    @Value("${cashfree.app.id}")
//    private String cashfreeAppId;
//    
//    @Value("${cashfree.secret.key}")
//    private String cashfreeSecretKey;
//    
//    @Value("${cashfree.webhook.url}")
//    private String cashfreeWebhookUrl;
//    
//    public Payment initializePayment(Order order) {
//        log.info("Initializing payment for order: {}", order.getOrderNumber());
//        
//        if (order.getPaymentType() == Order.PaymentType.COD) {
//            return createCODPayment(order);
//        } else if (order.getPaymentType() == Order.PaymentType.CASHFREE) {
//            return createCashfreePayment(order);
//        }
//        
//        throw new IllegalArgumentException("Unsupported payment type: " + order.getPaymentType());
//    }
//    
//    public Payment processPayment(String transactionId, Map<String, Object> paymentResponse) {
//        log.info("Processing payment for transaction: {}", transactionId);
//        
//        Payment payment = paymentRepository.findByTransactionId(transactionId)
//                .orElseThrow(() -> new RuntimeException("Payment not found: " + transactionId));
//        
//        try {
//            // Process based on gateway response
//            String status = (String) paymentResponse.get("status");
//            
//            if ("SUCCESS".equalsIgnoreCase(status)) {
//                payment.setStatus(Payment.PaymentStatus.SUCCESS);
//                payment.setGatewayResponse(paymentResponse.toString());
//                
//                // Update order payment status
//                Order order = payment.getOrder();
//                order.setPaymentStatus(Order.PaymentStatus.PAID);
//                order.setPaidAmount(payment.getAmount());
//                
//            } else if ("FAILED".equalsIgnoreCase(status)) {
//                payment.setStatus(Payment.PaymentStatus.FAILED);
//                payment.setFailureReason((String) paymentResponse.get("failure_reason"));
//                payment.setGatewayResponse(paymentResponse.toString());
//            } else {
//                payment.setStatus(Payment.PaymentStatus.PENDING);
//            }
//            
//            payment = paymentRepository.save(payment);
//            log.info("Payment processed successfully: {}", payment.getId());
//            
//            return payment;
//            
//        } catch (Exception e) {
//            log.error("Error processing payment: {}", e.getMessage(), e);
//            payment.setStatus(Payment.PaymentStatus.FAILED);
//            payment.setFailureReason("Processing error: " + e.getMessage());
//            return paymentRepository.save(payment);
//        }
//    }
//    
//    public Map<String, Object> createCashfreePaymentLink(Order order) {
//        try {
//            Map<String, Object> paymentRequest = new HashMap<>();
//            paymentRequest.put("order_id", order.getOrderNumber());
//            paymentRequest.put("order_amount", order.getTotalAmount());
//            paymentRequest.put("order_currency", "INR");
//            paymentRequest.put("customer_details", Map.of(
//                "customer_id", order.getCustomer().getId().toString(),
//                "customer_email", order.getCustomer().getEmail(),
//                "customer_phone", order.getCustomer().getPhone()
//            ));
//            paymentRequest.put("order_meta", Map.of(
//                "return_url", "https://your-domain.com/payment/success",
//                "notify_url", cashfreeWebhookUrl
//            ));
//            
//            // In a real implementation, you would make HTTP call to Cashfree API
//            // For now, returning a mock response
//            Map<String, Object> response = new HashMap<>();
//            response.put("payment_link", "https://payments.cashfree.com/order/" + order.getOrderNumber());
//            response.put("order_id", order.getOrderNumber());
//            response.put("cf_order_id", "CF" + System.currentTimeMillis());
//            
//            return response;
//            
//        } catch (Exception e) {
//            log.error("Error creating Cashfree payment link: {}", e.getMessage(), e);
//            throw new RuntimeException("Failed to create payment link", e);
//        }
//    }
//    
//    public boolean validateWebhookSignature(String signature, String payload) {
//        // Implement webhook signature validation for Cashfree
//        // This is a placeholder implementation
//        return true;
//    }
//    
//    private Payment createCODPayment(Order order) {
//        Payment payment = new Payment();
//        payment.setOrder(order);
//        payment.setTransactionId("COD_" + UUID.randomUUID().toString().substring(0, 8));
//        payment.setGateway(Payment.PaymentGateway.COD);
//        payment.setStatus(Payment.PaymentStatus.PENDING);
//        payment.setType(Payment.PaymentType.FULL_PAYMENT);
//        payment.setAmount(order.getTotalAmount());
//        payment.setGatewayResponse("COD payment initialized");
//        
//        return paymentRepository.save(payment);
//    }
//    
//    private Payment createCashfreePayment(Order order) {
//        Payment payment = new Payment();
//        payment.setOrder(order);
//        payment.setTransactionId("CF_" + UUID.randomUUID().toString().substring(0, 8));
//        payment.setGateway(Payment.PaymentGateway.CASHFREE);
//        payment.setStatus(Payment.PaymentStatus.PENDING);
//        payment.setType(Payment.PaymentType.FULL_PAYMENT);
//        payment.setAmount(order.getTotalAmount());
//        payment.setGatewayResponse("Cashfree payment initialized");
//        
//        return paymentRepository.save(payment);
//    }
//    
//    public Payment getPaymentByTransactionId(String transactionId) {
//        return paymentRepository.findByTransactionId(transactionId)
//                .orElseThrow(() -> new RuntimeException("Payment not found: " + transactionId));
//    }
//}
