//package com.oli.oli.controller;
//
//import com.oli.oli.dto.CustomerDto;
//import com.oli.oli.service.CustomerService;
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
//
//@RestController
//@RequestMapping("/api/customers")
//@RequiredArgsConstructor
//@Slf4j
//@Validated
//@CrossOrigin(origins = "*")
//public class CustomerController {
//    
//    private final CustomerService customerService;
//    
//    @PostMapping
//    public ResponseEntity<CustomerDto> createCustomer(@Valid @RequestBody CustomerDto customerDto) {
//        log.info("Creating new customer request");
//        CustomerDto createdCustomer = customerService.createCustomer(customerDto);
//        return ResponseEntity.ok(createdCustomer);
//    }
//    
//    @GetMapping
//    public ResponseEntity<Page<CustomerDto>> getAllCustomers(
//            @RequestParam(defaultValue = "0") int page,
//            @RequestParam(defaultValue = "10") int size,
//            @RequestParam(defaultValue = "createdAt") String sortBy,
//            @RequestParam(defaultValue = "desc") String sortDir) {
//        
//        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
//            Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
//        Pageable pageable = PageRequest.of(page, size, sort);
//        
//        Page<CustomerDto> customers = customerService.getAllCustomers(pageable);
//        return ResponseEntity.ok(customers);
//    }
//    
//    @GetMapping("/{id}")
//    public ResponseEntity<CustomerDto> getCustomerById(@PathVariable Long id) {
//        CustomerDto customer = customerService.getCustomerById(id);
//        return ResponseEntity.ok(customer);
//    }
//    
//    @GetMapping("/email/{email}")
//    public ResponseEntity<CustomerDto> getCustomerByEmail(@PathVariable String email) {
//        CustomerDto customer = customerService.getCustomerByEmail(email);
//        return ResponseEntity.ok(customer);
//    }
//    
//    @GetMapping("/search")
//    public ResponseEntity<Page<CustomerDto>> searchCustomers(
//            @RequestParam String searchTerm,
//            @RequestParam(defaultValue = "0") int page,
//            @RequestParam(defaultValue = "10") int size) {
//        
//        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
//        Page<CustomerDto> customers = customerService.searchCustomers(searchTerm, pageable);
//        return ResponseEntity.ok(customers);
//    }
//    
//    @PutMapping("/{id}")
//    public ResponseEntity<CustomerDto> updateCustomer(
//            @PathVariable Long id,
//            @Valid @RequestBody CustomerDto customerDto) {
//        
//        CustomerDto updatedCustomer = customerService.updateCustomer(id, customerDto);
//        return ResponseEntity.ok(updatedCustomer);
//    }
//    
//    @DeleteMapping("/{id}")
//    public ResponseEntity<Void> deleteCustomer(@PathVariable Long id) {
//        customerService.deleteCustomer(id);
//        return ResponseEntity.noContent().build();
//    }
//}
