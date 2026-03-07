//package com.oli.oli.dto;
//
//import lombok.Data;
//import lombok.NoArgsConstructor;
//import lombok.AllArgsConstructor;
//
//import jakarta.validation.constraints.*;
//import java.math.BigDecimal;
//
//@Data
//@NoArgsConstructor
//@AllArgsConstructor
//public class OrderItemDto {
//    
//    private Long id;
//    
//    @NotBlank(message = "Product name is required")
//    @Size(max = 200, message = "Product name must not exceed 200 characters")
//    private String productName;
//    
//    @Size(max = 100, message = "SKU must not exceed 100 characters")
//    private String sku;
//    
//    @NotNull(message = "Unit price is required")
//    @DecimalMin(value = "0.01", message = "Unit price must be greater than 0")
//    private BigDecimal unitPrice;
//    
//    @NotNull(message = "Quantity is required")
//    @Min(value = 1, message = "Quantity must be at least 1")
//    private Integer quantity;
//    
//    private BigDecimal totalPrice;
//    
//    @Size(max = 1000, message = "Description must not exceed 1000 characters")
//    private String description;
//    
//    @Size(max = 500, message = "Image URL must not exceed 500 characters")
//    private String imageUrl;
//    
//    private Boolean active = true;
//}
