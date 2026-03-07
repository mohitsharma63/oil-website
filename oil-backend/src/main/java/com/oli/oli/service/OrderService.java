//package com.oli.oli.service;
//
//import com.oli.oli.dto.OrderDto;
//import com.oli.oli.dto.OrderItemDto;
//import com.oli.oli.model.*;
//import com.oli.oli.repository.*;
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.data.domain.Page;
//import org.springframework.data.domain.Pageable;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//import jakarta.persistence.EntityNotFoundException;
//import java.math.BigDecimal;
//import java.time.LocalDateTime;
//import java.util.List;
//import java.util.stream.Collectors;
//
//@Service
//@RequiredArgsConstructor
//@Slf4j
//@Transactional
//public class OrderService {
//
//    private final OrderRepository orderRepository;
//    private final CustomerRepository customerRepository;
//    private final OrderItemRepository orderItemRepository;
//    private final PaymentService paymentService;
//    private final LogisticsService logisticsService;
//
//    public OrderDto createOrder(OrderDto orderDto) {
//        log.info("Creating new order: {}", orderDto.getOrderNumber());
//
//        Customer customer = customerRepository.findById(orderDto.getCustomerId())
//                .orElseThrow(
//                        () -> new EntityNotFoundException("Customer not found with ID: " + orderDto.getCustomerId()));
//
//        Order order = convertToEntity(orderDto);
//        order.setCustomer(customer);
//        order.setOrderNumber(generateOrderNumber());
//
//        // Calculate total amount from items
//        BigDecimal totalAmount = calculateTotalAmount(orderDto.getItems());
//        order.setTotalAmount(totalAmount);
//
//        Order savedOrder = orderRepository.save(order);
//
//        // Save order items
//        if (orderDto.getItems() != null && !orderDto.getItems().isEmpty()) {
//            List<OrderItem> items = orderDto.getItems().stream()
//                    .map(itemDto -> {
//                        OrderItem item = convertToEntity(itemDto);
//                        item.setOrder(savedOrder);
//                        return item;
//                    })
//                    .collect(Collectors.toList());
//            orderItemRepository.saveAll(items);
//        }
//
//        // Initialize payment record
//        if (savedOrder.getPaymentType() == Order.PaymentType.CASHFREE) {
//            paymentService.initializePayment(savedOrder);
//        }
//
//        log.info("Order created successfully with ID: {}", savedOrder.getId());
//        return convertToDto(savedOrder);
//    }
//
//    @Transactional(readOnly = true)
//    public Page<OrderDto> getAllOrders(Pageable pageable) {
//        return orderRepository.findAll(pageable).map(this::convertToDto);
//    }
//
//    @Transactional(readOnly = true)
//    public OrderDto getOrderById(Long id) {
//        Order order = orderRepository.findById(id)
//                .orElseThrow(() -> new EntityNotFoundException("Order not found with ID: " + id));
//        return convertToDto(order);
//    }
//
//    @Transactional(readOnly = true)
//    public OrderDto getOrderByNumber(String orderNumber) {
//        Order order = orderRepository.findByOrderNumber(orderNumber)
//                .orElseThrow(() -> new EntityNotFoundException("Order not found with number: " + orderNumber));
//        return convertToDto(order);
//    }
//
//    @Transactional(readOnly = true)
//    public Page<OrderDto> getOrdersByStatus(Order.OrderStatus status, Pageable pageable) {
//        return orderRepository.findByStatus(status, pageable).map(this::convertToDto);
//    }
//
//    @Transactional(readOnly = true)
//    public Page<OrderDto> searchOrders(String searchTerm, Pageable pageable) {
//        return orderRepository.findBySearchTerm(searchTerm, pageable).map(this::convertToDto);
//    }
//
//    @Transactional(readOnly = true)
//    public Page<OrderDto> getOrdersByDateRange(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
//        return orderRepository.findByDateRange(startDate, endDate, pageable).map(this::convertToDto);
//    }
//
//    public OrderDto updateOrderStatus(Long orderId, Order.OrderStatus newStatus) {
//        log.info("Updating order {} status to {}", orderId, newStatus);
//
//        Order order = orderRepository.findById(orderId)
//                .orElseThrow(() -> new EntityNotFoundException("Order not found with ID: " + orderId));
//
//        Order.OrderStatus oldStatus = order.getStatus();
//        order.setStatus(newStatus);
//
//        // Update timestamps based on status
//        switch (newStatus) {
//            case DISPATCH -> order.setDispatchedAt(LocalDateTime.now());
//            case DELIVERED -> order.setDeliveredAt(LocalDateTime.now());
//            case STORE_ORDER, READY_TO_DISPATCH, MANIFEST, INTRANSIT, RTO, CANCELLED -> {
//                // No specific timestamp updates needed for these statuses
//            }
//        }
//
//        order = orderRepository.save(order);
//
//        // Update logistics if status changed
//        if (!oldStatus.equals(newStatus)) {
//            logisticsService.updateOrderStatus(order, oldStatus, newStatus);
//        }
//
//        return convertToDto(order);
//    }
//
//    public void deleteOrder(Long id) {
//        log.info("Deleting order with ID: {}", id);
//        Order order = orderRepository.findById(id)
//                .orElseThrow(() -> new EntityNotFoundException("Order not found with ID: " + id));
//        orderRepository.delete(order);
//    }
//
//    public OrderDto addLogisticsTracking(Long orderId, String trackingNumber) {
//        Order order = orderRepository.findById(orderId)
//                .orElseThrow(() -> new EntityNotFoundException("Order not found with ID: " + orderId));
//
//        order.setLogisticsTrackingNumber(trackingNumber);
//        order = orderRepository.save(order);
//
//        return convertToDto(order);
//    }
//
//    private String generateOrderNumber() {
//        return "ORD" + System.currentTimeMillis();
//    }
//
//    private BigDecimal calculateTotalAmount(List<OrderItemDto> items) {
//        if (items == null || items.isEmpty()) {
//            return BigDecimal.ZERO;
//        }
//        return items.stream()
//                .map(item -> item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
//                .reduce(BigDecimal.ZERO, BigDecimal::add);
//    }
//
//    public Order convertToEntity(OrderDto dto) {
//        Order order = new Order();
//        order.setId(dto.getId());
//        order.setOrderNumber(dto.getOrderNumber());
//        order.setStatus(Order.OrderStatus.valueOf(dto.getStatus()));
//        order.setPaymentType(Order.PaymentType.valueOf(dto.getPaymentType()));
//        order.setPaymentStatus(Order.PaymentStatus.valueOf(dto.getPaymentStatus()));
//        order.setTotalAmount(dto.getTotalAmount());
//        order.setPaidAmount(dto.getPaidAmount() != null ? dto.getPaidAmount() : BigDecimal.ZERO);
//        order.setPickupAddress(dto.getPickupAddress());
//        order.setDeliveryAddress(dto.getDeliveryAddress());
//        order.setNotes(dto.getNotes());
//        order.setLogisticsTrackingNumber(dto.getLogisticsTrackingNumber());
//        order.setRiskLevel(dto.getRiskLevel());
//        order.setBuyerIntent(dto.getBuyerIntent());
//        return order;
//    }
//
//    private OrderItem convertToEntity(OrderItemDto dto) {
//        OrderItem item = new OrderItem();
//        item.setId(dto.getId());
//        item.setProductName(dto.getProductName());
//        item.setSku(dto.getSku());
//        item.setUnitPrice(dto.getUnitPrice());
//        item.setQuantity(dto.getQuantity());
//        item.setDescription(dto.getDescription());
//        item.setImageUrl(dto.getImageUrl());
//        item.setActive(dto.getActive());
//        return item;
//    }
//
//    private OrderDto convertToDto(Order order) {
//        OrderDto dto = new OrderDto();
//        dto.setId(order.getId());
//        dto.setOrderNumber(order.getOrderNumber());
//        dto.setCustomerId(order.getCustomer().getId());
//        dto.setCustomerName(order.getCustomer().getFirstName() + " " + order.getCustomer().getLastName());
//        dto.setCustomerEmail(order.getCustomer().getEmail());
//        dto.setCustomerPhone(order.getCustomer().getPhone());
//        dto.setStatus(order.getStatus().name());
//        dto.setPaymentType(order.getPaymentType().name());
//        dto.setPaymentStatus(order.getPaymentStatus().name());
//        dto.setTotalAmount(order.getTotalAmount());
//        dto.setPaidAmount(order.getPaidAmount());
//        dto.setPickupAddress(order.getPickupAddress());
//        dto.setDeliveryAddress(order.getDeliveryAddress());
//        dto.setNotes(order.getNotes());
//        dto.setLogisticsTrackingNumber(order.getLogisticsTrackingNumber());
//        dto.setRiskLevel(order.getRiskLevel());
//        dto.setBuyerIntent(order.getBuyerIntent());
//        dto.setCreatedAt(order.getCreatedAt());
//        dto.setUpdatedAt(order.getUpdatedAt());
//        dto.setDispatchedAt(order.getDispatchedAt());
//        dto.setDeliveredAt(order.getDeliveredAt());
//
//        if (order.getItems() != null) {
//            dto.setItems(order.getItems().stream()
//                    .map(this::convertItemToDto)
//                    .collect(Collectors.toList()));
//        }
//
//        return dto;
//    }
//
//    private OrderItemDto convertItemToDto(OrderItem item) {
//        OrderItemDto dto = new OrderItemDto();
//        dto.setId(item.getId());
//        dto.setProductName(item.getProductName());
//        dto.setSku(item.getSku());
//        dto.setUnitPrice(item.getUnitPrice());
//        dto.setQuantity(item.getQuantity());
//        dto.setTotalPrice(item.getTotalPrice());
//        dto.setDescription(item.getDescription());
//        dto.setImageUrl(item.getImageUrl());
//        dto.setActive(item.getActive());
//        return dto;
//    }
//}
