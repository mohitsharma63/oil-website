//package com.oli.oli.service;
//
//import com.oli.oli.dto.CustomerDto;
//import com.oli.oli.model.Customer;
//import com.oli.oli.repository.CustomerRepository;
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.data.domain.Page;
//import org.springframework.data.domain.Pageable;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//import jakarta.persistence.EntityNotFoundException;
//import java.util.List;
//import java.util.stream.Collectors;
//
//@Service
//@RequiredArgsConstructor
//@Slf4j
//@Transactional
//public class CustomerService {
//    
//    private final CustomerRepository customerRepository;
//    
//    public CustomerDto createCustomer(CustomerDto customerDto) {
//        log.info("Creating new customer: {}", customerDto.getEmail());
//        
//        if (customerRepository.existsByEmail(customerDto.getEmail())) {
//            throw new IllegalArgumentException("Customer with email " + customerDto.getEmail() + " already exists");
//        }
//        
//        Customer customer = convertToEntity(customerDto);
//        customer = customerRepository.save(customer);
//        
//        log.info("Customer created successfully with ID: {}", customer.getId());
//        return convertToDto(customer);
//    }
//    
//    @Transactional(readOnly = true)
//    public Page<CustomerDto> getAllCustomers(Pageable pageable) {
//        return customerRepository.findByActiveTrue(pageable).map(this::convertToDto);
//    }
//    
//    @Transactional(readOnly = true)
//    public CustomerDto getCustomerById(Long id) {
//        Customer customer = customerRepository.findById(id)
//                .orElseThrow(() -> new EntityNotFoundException("Customer not found with ID: " + id));
//        return convertToDto(customer);
//    }
//    
//    @Transactional(readOnly = true)
//    public CustomerDto getCustomerByEmail(String email) {
//        Customer customer = customerRepository.findByEmail(email)
//                .orElseThrow(() -> new EntityNotFoundException("Customer not found with email: " + email));
//        return convertToDto(customer);
//    }
//    
//    @Transactional(readOnly = true)
//    public Page<CustomerDto> searchCustomers(String searchTerm, Pageable pageable) {
//        return customerRepository.findBySearchTerm(searchTerm, pageable).map(this::convertToDto);
//    }
//    
//    public CustomerDto updateCustomer(Long id, CustomerDto customerDto) {
//        log.info("Updating customer with ID: {}", id);
//        
//        Customer existingCustomer = customerRepository.findById(id)
//                .orElseThrow(() -> new EntityNotFoundException("Customer not found with ID: " + id));
//        
//        // Check if email is being changed and if it already exists
//        if (!existingCustomer.getEmail().equals(customerDto.getEmail()) && 
//            customerRepository.existsByEmail(customerDto.getEmail())) {
//            throw new IllegalArgumentException("Customer with email " + customerDto.getEmail() + " already exists");
//        }
//        
//        existingCustomer.setFirstName(customerDto.getFirstName());
//        existingCustomer.setLastName(customerDto.getLastName());
//        existingCustomer.setEmail(customerDto.getEmail());
//        existingCustomer.setPhone(customerDto.getPhone());
//        existingCustomer.setAddress(customerDto.getAddress());
//        existingCustomer.setCity(customerDto.getCity());
//        existingCustomer.setState(customerDto.getState());
//        existingCustomer.setPincode(customerDto.getPincode());
//        existingCustomer.setCompany(customerDto.getCompany());
//        existingCustomer.setCustomerType(Customer.CustomerType.valueOf(customerDto.getCustomerType()));
//        
//        existingCustomer = customerRepository.save(existingCustomer);
//        
//        log.info("Customer updated successfully: {}", existingCustomer.getId());
//        return convertToDto(existingCustomer);
//    }
//    
//    public void deleteCustomer(Long id) {
//        log.info("Deleting customer with ID: {}", id);
//        Customer customer = customerRepository.findById(id)
//                .orElseThrow(() -> new EntityNotFoundException("Customer not found with ID: " + id));
//        
//        customer.setActive(false);
//        customerRepository.save(customer);
//        
//        log.info("Customer deactivated successfully: {}", id);
//    }
//    
//    private Customer convertToEntity(CustomerDto dto) {
//        Customer customer = new Customer();
//        customer.setId(dto.getId());
//        customer.setFirstName(dto.getFirstName());
//        customer.setLastName(dto.getLastName());
//        customer.setEmail(dto.getEmail());
//        customer.setPhone(dto.getPhone());
//        customer.setAddress(dto.getAddress());
//        customer.setCity(dto.getCity());
//        customer.setState(dto.getState());
//        customer.setPincode(dto.getPincode());
//        customer.setCompany(dto.getCompany());
//        customer.setCustomerType(Customer.CustomerType.valueOf(dto.getCustomerType()));
//        customer.setActive(dto.getActive() != null ? dto.getActive() : true);
//        return customer;
//    }
//    
//    private CustomerDto convertToDto(Customer customer) {
//        CustomerDto dto = new CustomerDto();
//        dto.setId(customer.getId());
//        dto.setFirstName(customer.getFirstName());
//        dto.setLastName(customer.getLastName());
//        dto.setEmail(customer.getEmail());
//        dto.setPhone(customer.getPhone());
//        dto.setAddress(customer.getAddress());
//        dto.setCity(customer.getCity());
//        dto.setState(customer.getState());
//        dto.setPincode(customer.getPincode());
//        dto.setCompany(customer.getCompany());
//        dto.setCustomerType(customer.getCustomerType().name());
//        dto.setActive(customer.getActive());
//        dto.setCreatedAt(customer.getCreatedAt());
//        dto.setUpdatedAt(customer.getUpdatedAt());
//        return dto;
//    }
//}
