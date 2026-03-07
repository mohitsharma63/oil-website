//package com.oli.oli.repository;
//
//import com.oli.oli.model.OrderItem;
//import org.springframework.data.jpa.repository.JpaRepository;
//import org.springframework.stereotype.Repository;
//
//import java.util.List;
//
//@Repository
//public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
//    
//    List<OrderItem> findByOrderId(Long orderId);
//    
//    List<OrderItem> findByOrderIdAndActiveTrue(Long orderId);
//    
//    void deleteByOrderId(Long orderId);
//}
