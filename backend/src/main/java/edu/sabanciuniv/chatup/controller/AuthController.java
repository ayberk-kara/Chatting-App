package edu.sabanciuniv.chatup.controller;

import edu.sabanciuniv.chatup.dto.AuthResponse;
import edu.sabanciuniv.chatup.dto.ErrorResponse;
import edu.sabanciuniv.chatup.dto.LoginRequest;
import edu.sabanciuniv.chatup.dto.RegisterRequest;
import edu.sabanciuniv.chatup.model.User;
import edu.sabanciuniv.chatup.repository.UserRepository;
import edu.sabanciuniv.chatup.security.JwtTokenProvider;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity
                .status(HttpStatus.CONFLICT)  // 409 Conflict
                .contentType(MediaType.APPLICATION_JSON)
                .body(new ErrorResponse("Email already registered"));
        }

        // Create new user
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());

        // Save user
        User savedUser = userRepository.save(user);
        
        // Generate token
        String token = tokenProvider.generateToken(savedUser.getEmail());
        
        // Create response
        AuthResponse response = AuthResponse.builder()
                .token(token)
                .email(savedUser.getEmail())
                .firstName(savedUser.getFirstName())
                .lastName(savedUser.getLastName())
                .build();

        return ResponseEntity
            .status(HttpStatus.CREATED)
            .contentType(MediaType.APPLICATION_JSON)
            .body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            System.out.println("Login attempt for email: " + request.getEmail());
            
            // First check if user exists
            User user = userRepository.findByEmail(request.getEmail()).orElseThrow(() -> new RuntimeException("User not found"));

            // Attempt authentication
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    request.getEmail(),
                    request.getPassword()
                )
            );

            System.out.println("Authentication successful for: " + request.getEmail());

            // Generate token
            String token = tokenProvider.generateToken(user.getEmail());

            // Create response
            AuthResponse response = AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .build();

            System.out.println("Login response: " + response);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("Login error: " + e.getMessage());
            e.printStackTrace();
            
            if (e instanceof RuntimeException && e.getMessage().equals("User not found")) {
                return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(new ErrorResponse("Invalid email or password"));
            }
            
            return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .contentType(MediaType.APPLICATION_JSON)
                .body(new ErrorResponse("Invalid email or password"));
        }
    }
}
