package com.oli.oli.controller;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.oli.oli.dto.UserDto;
import com.oli.oli.model.User;
import com.oli.oli.repository.UserRepository;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    public record RegisterRequest(
            String firstName,
            String lastName,
            String email,
            String phone,
            String password,
            String confirmPassword
    ) {
    }

    public record LoginRequest(String email, String password) {
    }

    public record AuthResponse(String message, UserDto user) {
    }

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@RequestBody RegisterRequest req) {
        if (req == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request body is required");
        }
        if (!StringUtils.hasText(req.firstName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "firstName is required");
        }
        if (!StringUtils.hasText(req.email())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "email is required");
        }
        if (!StringUtils.hasText(req.password())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "password is required");
        }
        if (req.confirmPassword() != null && !req.password().equals(req.confirmPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "password and confirmPassword must match");
        }

        String email = req.email().trim();
        String phone = StringUtils.hasText(req.phone()) ? req.phone().trim() : null;

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        }
        if (phone != null && userRepository.existsByPhone(phone)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Phone already exists");
        }

        User user = new User();
        user.setFirstName(req.firstName().trim());
        user.setLastName(StringUtils.hasText(req.lastName()) ? req.lastName().trim() : null);
        user.setEmail(email);
        user.setPhone(phone);
        user.setPasswordHash(passwordEncoder.encode(req.password()));

        User saved = userRepository.save(user);

        UserDto dto = new UserDto(
                saved.getId(),
                saved.getFirstName(),
                saved.getLastName(),
                saved.getEmail(),
                saved.getPhone(),
                saved.getCreatedAt(),
                saved.getUpdatedAt()
        );

        return new AuthResponse("Registered successfully", dto);
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest req) {
        if (req == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request body is required");
        }
        if (!StringUtils.hasText(req.email())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "email is required");
        }
        if (!StringUtils.hasText(req.password())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "password is required");
        }

        String email = req.email().trim();

        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        if (!passwordEncoder.matches(req.password(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        UserDto dto = new UserDto(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getPhone(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );

        return new AuthResponse("Login successful", dto);
    }
}
