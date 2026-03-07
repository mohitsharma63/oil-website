//package com.oli.oli.repository;
//
//import com.oli.oli.model.Customer;
//import org.springframework.data.domain.Page;
//import org.springframework.data.domain.Pageable;
//import org.springframework.data.jpa.repository.JpaRepository;
//import org.springframework.data.jpa.repository.Query;
//import org.springframework.data.repository.query.Param;
//import org.springframework.stereotype.Repository;
//
//import java.util.List;
//import java.util.Optional;
//
//@Repository
//public interface CustomerRepository extends JpaRepository<Customer, Long> {
//    
//    Optional<Customer> findByEmail(String email);
//    
//    Optional<Customer> findByPhone(String phone);
//    
//    boolean existsByEmail(String email);
//    
//    boolean existsByPhone(String phone);
//    
//    Page<Customer> findByActiveTrue(Pageable pageable);
//    
//    @Query("SELECT c FROM Customer c WHERE c.firstName LIKE %:search% OR c.lastName LIKE %:search% OR c.email LIKE %:search% OR c.phone LIKE %:search%")
//    Page<Customer> findBySearchTerm(@Param("search") String search, Pageable pageable);
//    
//    List<Customer> findByCustomerType(Customer.CustomerType customerType);
//    
//    @Query("SELECT COUNT(c) FROM Customer c WHERE c.active = true")
//    long countActiveCustomers();
//}
