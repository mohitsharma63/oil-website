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
//@Table(name = "order_items")
//@Data
//@NoArgsConstructor
//@AllArgsConstructor
//public class OrderItem {
//    
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//    
//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "order_id", nullable = false)
//    private Order order;
//    
//    @Column(nullable = false, length = 200)
//    private String productName;
//    
//    @Column(length = 100)
//    private String sku;
//    
//    @Column(nullable = false, precision = 10, scale = 2)
//    private BigDecimal unitPrice;
//    
//    @Column(nullable = false)
//    private Integer quantity;
//    
//    @Column(nullable = false, precision = 10, scale = 2)
//    private BigDecimal totalPrice;
//    
//    @Column(length = 1000)
//    private String description;
//    
//    @Column(length = 500)
//    private String imageUrl;
//    
//    @Column(nullable = false)
//    private Boolean active = true;
//    
//    @CreationTimestamp
//    @Column(name = "created_at", nullable = false, updatable = false)
//    private LocalDateTime createdAt;
//    
//    @UpdateTimestamp
//    @Column(name = "updated_at")
//    private LocalDateTime updatedAt;
//    
//    @PrePersist
//    @PreUpdate
//    public void calculateTotalPrice() {
//        if (unitPrice != null && quantity != null) {
//            this.totalPrice = unitPrice.multiply(BigDecimal.valueOf(quantity));
//        }
//    }
//}
