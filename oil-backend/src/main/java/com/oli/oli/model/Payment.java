//package com.oli.oli.model;
//
//import jakarta.persistence.*;
//import lombok.Data;
//import lombok.NoArgsConstructor;
//import lombok.AllArgsConstructor;
//import org.hibernate.annotations.CreationTimestamp;
//import org.hibernate.annotations.UpdateTimestamp;
//
//import java.math.BigDecimal;
//import java.time.LocalDateTime;
//
//@Entity
//@Table(name = "payments")
//@Data
//@NoArgsConstructor
//@AllArgsConstructor
//public class Payment {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "order_id", nullable = false)
//    private Order order;
//
//    @Column(nullable = false, unique = true, length = 100)
//    private String transactionId;
//
//    @Column(length = 100)
//    private String gatewayTransactionId;
//
//    @Enumerated(EnumType.STRING)
//    @Column(name = "gateway", nullable = false, length = 50)
//    private PaymentGateway gateway;
//
//    @Enumerated(EnumType.STRING)
//    @Column(name = "status", nullable = false, length = 20)
//    private PaymentStatus status;
//
//    @Enumerated(EnumType.STRING)
//    @Column(name = "type", nullable = false, length = 20)
//    private PaymentType type;
//
//    @Column(nullable = false, precision = 10, scale = 2)
//    private BigDecimal amount;
//
//    @Column(name = "gateway_response", columnDefinition = "TEXT")
//    private String gatewayResponse;
//
//    @Column(length = 500)
//    private String failureReason;
//
//    @CreationTimestamp
//    @Column(name = "created_at", nullable = false, updatable = false)
//    private LocalDateTime createdAt;
//
//    @UpdateTimestamp
//    @Column(name = "updated_at")
//    private LocalDateTime updatedAt;
//
//    public enum PaymentGateway {
//        CASHFREE,
//        COD,
//        RAZORPAY,
//        PAYTM
//    }
//
//    public enum PaymentStatus {
//        PENDING,
//        PROCESSING,
//        SUCCESS,
//        FAILED,
//        REFUNDED,
//        PARTIALLY_REFUNDED
//    }
//
//    public enum PaymentType {
//        FULL_PAYMENT,
//        PARTIAL_PAYMENT,
//        REFUND
//    }
//}
