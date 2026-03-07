//package com.oli.oli.repository;
//
//import com.oli.oli.model.Order;
//import org.springframework.data.domain.Page;
//import org.springframework.data.domain.Pageable;
//import org.springframework.data.jpa.repository.JpaRepository;
//import org.springframework.data.jpa.repository.Query;
//import org.springframework.data.repository.query.Param;
//import org.springframework.stereotype.Repository;
//
//import java.time.LocalDateTime;
//import java.util.List;
//import java.util.Optional;
//
//@Repository
//public interface OrderRepository extends JpaRepository<Order, Long> {
//    
//    Optional<Order> findByOrderNumber(String orderNumber);
//    
//    List<Order> findByCustomerId(Long customerId);
//    
//    Page<Order> findByStatus(Order.OrderStatus status, Pageable pageable);
//    
//    Page<Order> findByCustomerIdAndStatus(Long customerId, Order.OrderStatus status, Pageable pageable);
//    
//    @Query("SELECT o FROM Order o WHERE o.createdAt BETWEEN :startDate AND :endDate")
//    Page<Order> findByDateRange(@Param("startDate") LocalDateTime startDate, 
//                                @Param("endDate") LocalDateTime endDate, 
//                                Pageable pageable);
//    
//    @Query("SELECT o FROM Order o WHERE o.customer.email LIKE %:search% OR o.orderNumber LIKE %:search% OR o.logisticsTrackingNumber LIKE %:search%")
//    Page<Order> findBySearchTerm(@Param("search") String search, Pageable pageable);
//    
//    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = :status")
//    long countByStatus(@Param("status") Order.OrderStatus status);
//    
//    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.status = :status AND o.paymentStatus = 'PAID'")
//    Double getTotalRevenueByStatus(@Param("status") Order.OrderStatus status);
//    
//    List<Order> findByPaymentStatus(Order.PaymentStatus paymentStatus);
//    
//    List<Order> findByLogisticsTrackingNumber(String trackingNumber);
//}
