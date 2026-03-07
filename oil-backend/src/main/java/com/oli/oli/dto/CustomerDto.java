//package com.oli.oli.dto;
//
//import lombok.Data;
//import lombok.NoArgsConstructor;
//import lombok.AllArgsConstructor;
//
//import jakarta.validation.constraints.*;
//import java.time.LocalDateTime;
//
//@Data
//@NoArgsConstructor
//@AllArgsConstructor
//public class CustomerDto {
//    
//    private Long id;
//    
//    @NotBlank(message = "First name is required")
//    @Size(max = 100, message = "First name must not exceed 100 characters")
//    private String firstName;
//    
//    @NotBlank(message = "Last name is required")
//    @Size(max = 100, message = "Last name must not exceed 100 characters")
//    private String lastName;
//    
//    @NotBlank(message = "Email is required")
//    @Email(message = "Invalid email format")
//    @Size(max = 100, message = "Email must not exceed 100 characters")
//    private String email;
//    
//    @Size(max = 20, message = "Phone number must not exceed 20 characters")
//    private String phone;
//    
//    @Size(max = 500, message = "Address must not exceed 500 characters")
//    private String address;
//    
//    @Size(max = 100, message = "City must not exceed 100 characters")
//    private String city;
//    
//    @Size(max = 100, message = "State must not exceed 100 characters")
//    private String state;
//    
//    @Size(max = 10, message = "Pincode must not exceed 10 characters")
//    private String pincode;
//    
//    @Size(max = 100, message = "Company name must not exceed 100 characters")
//    private String company;
//    
//    @NotNull(message = "Customer type is required")
//    private String customerType = "RETAIL";
//    
//    private Boolean active = true;
//    
//    private LocalDateTime createdAt;
//    private LocalDateTime updatedAt;
//}
