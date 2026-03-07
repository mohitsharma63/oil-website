//package com.oli.oli.model;
//
//import jakarta.persistence.*;
//import lombok.Data;
//import lombok.NoArgsConstructor;
//import lombok.AllArgsConstructor;
//import org.hibernate.annotations.CreationTimestamp;
//import org.hibernate.annotations.UpdateTimestamp;
//
//import java.time.LocalDateTime;
//import java.util.List;
//
//@Entity
//@Table(name = "customers")
//@Data
//@NoArgsConstructor
//@AllArgsConstructor
//public class Customer {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    @Column(nullable = false, unique = true, length = 100)
//    private String email;
//
//    @Column(nullable = false, length = 100)
//    private String firstName;
//
//    @Column(nullable = false, length = 100)
//    private String lastName;
//
//    @Column(length = 20)
//    private String phone;
//
//    @Column(length = 500)
//    private String address;
//
//    @Column(length = 100)
//    private String city;
//
//    @Column(length = 100)
//    private String state;
//
//    @Column(length = 10)
//    private String pincode;
//
//    @Column(length = 100)
//    private String company;
//
//    @Enumerated(EnumType.STRING)
//    @Column(name = "customer_type", nullable = false, length = 20)
//    private CustomerType customerType = CustomerType.RETAIL;
//
//    @Column(nullable = false)
//    private Boolean active = true;
//
//    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
//    private List<Order> orders;
//
//    @CreationTimestamp
//    @Column(name = "created_at", nullable = false, updatable = false)
//    private LocalDateTime createdAt;
//
//    @UpdateTimestamp
//    @Column(name = "updated_at")
//    private LocalDateTime updatedAt;
//
//    public enum CustomerType {
//        RETAIL,
//        WHOLESALE,
//        CORPORATE
//    }
//}
