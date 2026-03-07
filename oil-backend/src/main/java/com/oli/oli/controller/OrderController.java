//package com.oli.oli.controller;
//
//import com.oli.oli.dto.OrderDto;
//import com.oli.oli.model.Order;
//import com.oli.oli.service.OrderService;
//import com.oli.oli.service.PaymentService;
//import com.oli.oli.service.LogisticsService;
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.data.domain.Page;
//import org.springframework.data.domain.PageRequest;
//import org.springframework.data.domain.Pageable;
//import org.springframework.data.domain.Sort;
//import org.springframework.http.ResponseEntity;
//import org.springframework.validation.annotation.Validated;
//import org.springframework.web.bind.annotation.*;
//
//import jakarta.validation.Valid;
//import java.time.LocalDateTime;
//import java.util.Map;
//
//@RestController
//@RequestMapping("/api/orders")
//@RequiredArgsConstructor
//@Slf4j
//@Validated
//@CrossOrigin(origins = "*")
//public class OrderController {
//    
//    private final OrderService orderService;
//    private final PaymentService paymentService;
//    private final LogisticsService logisticsService;
//    
//    @PostMapping
//    public ResponseEntity<OrderDto> createOrder(@Valid @RequestBody OrderDto orderDto) {
//        log.info("Creating new order request");
//        OrderDto createdOrder = orderService.createOrder(orderDto);
//        return ResponseEntity.ok(createdOrder);
//    }
//    
//    @GetMapping
//    public ResponseEntity<Page<OrderDto>> getAllOrders(
//            @RequestParam(defaultValue = "0") int page,
//            @RequestParam(defaultValue = "10") int size,
//            @RequestParam(defaultValue = "createdAt") String sortBy,
//            @RequestParam(defaultValue = "desc") String sortDir) {
//        
//        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
//            Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
//        Pageable pageable = PageRequest.of(page, size, sort);
//        
//        Page<OrderDto> orders = orderService.getAllOrders(pageable);
//        return ResponseEntity.ok(orders);
//    }
//    
//    @GetMapping("/{id}")
//    public ResponseEntity<OrderDto> getOrderById(@PathVariable Long id) {
//        OrderDto order = orderService.getOrderById(id);
//        return ResponseEntity.ok(order);
//    }
//    
//    @GetMapping("/number/{orderNumber}")
//    public ResponseEntity<OrderDto> getOrderByNumber(@PathVariable String orderNumber) {
//        OrderDto order = orderService.getOrderByNumber(orderNumber);
//        return ResponseEntity.ok(order);
//    }
//    
//    @GetMapping("/status/{status}")
//    public ResponseEntity<Page<OrderDto>> getOrdersByStatus(
//            @PathVariable Order.OrderStatus status,
//            @RequestParam(defaultValue = "0") int page,
//            @RequestParam(defaultValue = "10") int size) {
//        
//        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
//        Page<OrderDto> orders = orderService.getOrdersByStatus(status, pageable);
//        return ResponseEntity.ok(orders);
//    }
//    
//    @GetMapping("/search")
//    public ResponseEntity<Page<OrderDto>> searchOrders(
//            @RequestParam String searchTerm,
//            @RequestParam(defaultValue = "0") int page,
//            @RequestParam(defaultValue = "10") int size) {
//        
//        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
//        Page<OrderDto> orders = orderService.searchOrders(searchTerm, pageable);
//        return ResponseEntity.ok(orders);
//    }
//    
//    @GetMapping("/date-range")
//    public ResponseEntity<Page<OrderDto>> getOrdersByDateRange(
//            @RequestParam String startDate,
//            @RequestParam String endDate,
//            @RequestParam(defaultValue = "0") int page,
//            @RequestParam(defaultValue = "10") int size) {
//        
//        LocalDateTime start = LocalDateTime.parse(startDate);
//        LocalDateTime end = LocalDateTime.parse(endDate);
//        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
//        
//        Page<OrderDto> orders = orderService.getOrdersByDateRange(start, end, pageable);
//        return ResponseEntity.ok(orders);
//    }
//    
//    @PutMapping("/{id}/status")
//    public ResponseEntity<OrderDto> updateOrderStatus(
//            @PathVariable Long id,
//            @RequestParam Order.OrderStatus status) {
//        
//        OrderDto updatedOrder = orderService.updateOrderStatus(id, status);
//        return ResponseEntity.ok(updatedOrder);
//    }
//    
//    @PutMapping("/{id}/tracking")
//    public ResponseEntity<OrderDto> addLogisticsTracking(
//            @PathVariable Long id,
//            @RequestParam String trackingNumber) {
//        
//        OrderDto updatedOrder = orderService.addLogisticsTracking(id, trackingNumber);
//        return ResponseEntity.ok(updatedOrder);
//    }
//    
//    @PostMapping("/{id}/payment-link")
//    public ResponseEntity<Map<String, Object>> createPaymentLink(@PathVariable Long id) {
//        OrderDto order = orderService.getOrderById(id);
//        
//        if ("CASHFREE".equals(order.getPaymentType())) {
//            Map<String, Object> paymentLink = paymentService.createCashfreePaymentLink(
//                orderService.convertToEntity(order));
//            return ResponseEntity.ok(paymentLink);
//        }
//        
//        return ResponseEntity.badRequest().body(Map.of(
//            "error", "Payment link only available for CASHFREE payments"
//        ));
//    }
//    
//    @PostMapping("/{id}/shipment")
//    public ResponseEntity<Map<String, Object>> createShipment(@PathVariable Long id) {
//        OrderDto order = orderService.getOrderById(id);
//        Map<String, Object> shipment = logisticsService.createShipment(
//            orderService.convertToEntity(order));
//        return ResponseEntity.ok(shipment);
//    }
//    
//    @GetMapping("/tracking/{trackingNumber}")
//    public ResponseEntity<Map<String, Object>> trackShipment(@PathVariable String trackingNumber) {
//        Map<String, Object> tracking = logisticsService.trackShipment(trackingNumber);
//        return ResponseEntity.ok(tracking);
//    }
//    
//    @PostMapping("/tracking/{trackingNumber}/cancel")
//    public ResponseEntity<Map<String, Object>> cancelShipment(@PathVariable String trackingNumber) {
//        Map<String, Object> result = logisticsService.cancelShipment(trackingNumber);
//        return ResponseEntity.ok(result);
//    }
//    
//    @GetMapping("/{id}/shipping-rates")
//    public ResponseEntity<Map<String, Object>> getShippingRates(@PathVariable Long id) {
//        OrderDto order = orderService.getOrderById(id);
//        Map<String, Object> rates = logisticsService.getShippingRates(
//            orderService.convertToEntity(order));
//        return ResponseEntity.ok(rates);
//    }
//    
//    @DeleteMapping("/{id}")
//    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
//        orderService.deleteOrder(id);
//        return ResponseEntity.noContent().build();
//    }
//    
//    @GetMapping("/stats/dashboard")
//    public ResponseEntity<Map<String, Object>> getDashboardStats() {
//        // This would typically come from a dedicated stats service
//        Map<String, Object> stats = Map.of(
//            "totalOrders", 1250,
//            "totalRevenue", 2500000.0,
//            "pendingOrders", 45,
//            "deliveredOrders", 1100,
//            "rtoOrders", 25,
//            "codOrders", 800,
//            "onlineOrders", 450
//        );
//        return ResponseEntity.ok(stats);
//    }
//}
