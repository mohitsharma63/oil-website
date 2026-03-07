//package com.oli.oli.dto;
//
//import lombok.Data;
//import lombok.NoArgsConstructor;
//import lombok.AllArgsConstructor;
//
//import jakarta.validation.constraints.*;
//import java.math.BigDecimal;
//import java.time.LocalDateTime;
//import java.util.List;
//
//@Data
//@NoArgsConstructor
//@AllArgsConstructor
//public class OrderDto {
//    
//    private Long id;
//    
//    @NotBlank(message = "Order number is required")
//    private String orderNumber;
//    
//    @NotNull(message = "Customer ID is required")
//    private Long customerId;
//    
//    private String customerName;
//    private String customerEmail;
//    private String customerPhone;
//    
//    @NotNull(message = "Order status is required")
//    private String status;
//    
//    @NotNull(message = "Payment type is required")
//    private String paymentType;
//    
//    @NotNull(message = "Payment status is required")
//    private String paymentStatus;
//    
//    @NotNull(message = "Total amount is required")
//    @DecimalMin(value = "0.01", message = "Total amount must be greater than 0")
//    private BigDecimal totalAmount;
//    
//    private BigDecimal paidAmount;
//    
//    @Size(max = 500, message = "Pickup address must not exceed 500 characters")
//    private String pickupAddress;
//    
//    @Size(max = 500, message = "Delivery address must not exceed 500 characters")
//    private String deliveryAddress;
//    
//    @Size(max = 1000, message = "Notes must not exceed 1000 characters")
//    private String notes;
//    
//    private String logisticsTrackingNumber;
//    
//    @Size(max = 50, message = "Risk level must not exceed 50 characters")
//    private String riskLevel;
//    
//    @Size(max = 100, message = "Buyer intent must not exceed 100 characters")
//    private String buyerIntent;
//    
//    private List<OrderItemDto> items;
//    
//    private LocalDateTime createdAt;
//    private LocalDateTime updatedAt;
//    private LocalDateTime dispatchedAt;
//    private LocalDateTime deliveredAt;
//}
