//package com.oli.oli.repository;
//
//import com.oli.oli.model.Payment;
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
//public interface PaymentRepository extends JpaRepository<Payment, Long> {
//    
//    Optional<Payment> findByTransactionId(String transactionId);
//    
//    Optional<Payment> findByGatewayTransactionId(String gatewayTransactionId);
//    
//    List<Payment> findByOrderId(Long orderId);
//    
//    Page<Payment> findByStatus(Payment.PaymentStatus status, Pageable pageable);
//    
//    Page<Payment> findByGateway(Payment.PaymentGateway gateway, Pageable pageable);
//    
//    @Query("SELECT p FROM Payment p WHERE p.createdAt BETWEEN :startDate AND :endDate")
//    Page<Payment> findByDateRange(@Param("startDate") LocalDateTime startDate, 
//                                 @Param("endDate") LocalDateTime endDate, 
//                                 Pageable pageable);
//    
//    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.status = 'SUCCESS' AND p.gateway = :gateway")
//    Double getTotalRevenueByGateway(@Param("gateway") Payment.PaymentGateway gateway);
//    
//    @Query("SELECT COUNT(p) FROM Payment p WHERE p.status = :status")
//    long countByStatus(@Param("status") Payment.PaymentStatus status);
//}
