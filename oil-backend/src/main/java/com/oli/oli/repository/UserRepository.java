package com.oli.oli.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.oli.oli.model.User;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmailIgnoreCase(String email);

    Optional<User> findByPhone(String phone);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByPhone(String phone);
}
