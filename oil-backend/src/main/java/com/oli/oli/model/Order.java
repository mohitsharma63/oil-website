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
//import java.util.List;
//
//@Entity
//@Table(name = "orders")
//@Data
//@NoArgsConstructor
//@AllArgsConstructor
//public class Order {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    @Column(nullable = false, unique = true, length = 100)
//    private String orderNumber;
//
//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "customer_id", nullable = false)
//    private Customer customer;
//
//    @Enumerated(EnumType.STRING)
//    @Column(name = "status", nullable = false, length = 50)
//    private OrderStatus status;
//
//    @Enumerated(EnumType.STRING)
//    @Column(name = "payment_type", nullable = false, length = 20)
//    private PaymentType paymentType;
//
//    @Enumerated(EnumType.STRING)
//    @Column(name = "payment_status", nullable = false, length = 20)
//    private PaymentStatus paymentStatus;
//
//    @Column(nullable = false, precision = 10, scale = 2)
//    private BigDecimal totalAmount;
//
//    @Column(precision = 10, scale = 2)
//    private BigDecimal paidAmount = BigDecimal.ZERO;
//
//    @Column(length = 500)
//    private String pickupAddress;
//
//    @Column(length = 500)
//    private String deliveryAddress;
//
//    @Column(length = 1000)
//    private String notes;
//
//    @Column(name = "logistics_tracking_number", length = 100)
//    private String logisticsTrackingNumber;
//
//    @Column(name = "risk_level", length = 50)
//    private String riskLevel;
//
//    @Column(name = "buyer_intent", length = 100)
//    private String buyerIntent;
//
//    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
//    private List<OrderItem> items;
//
//    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
//    private List<Payment> payments;
//
//    @CreationTimestamp
//    @Column(name = "created_at", nullable = false, updatable = false)
//    private LocalDateTime createdAt;
//
//    @UpdateTimestamp
//    @Column(name = "updated_at")
//    private LocalDateTime updatedAt;
//
//    @Column(name = "dispatched_at")
//    private LocalDateTime dispatchedAt;
//
//    @Column(name = "delivered_at")
//    private LocalDateTime deliveredAt;
//
//    public enum OrderStatus {
//        STORE_ORDER,
//        READY_TO_DISPATCH,
//        DISPATCH,
//        MANIFEST,
//        INTRANSIT,
//        DELIVERED,
//        RTO,
//        CANCELLED
//    }
//
//    public enum PaymentType {
//        COD,
//        CASHFREE,
//        OTHER
//    }
//
//    public enum PaymentStatus {
//        PENDING,
//        PARTIALLY_PAID,
//        PAID,
//        FAILED,
//        REFUNDED
//    }
//}
