package com.chatapp.chat_app.service;

import com.chatapp.chat_app.dto.AuthResponse;
import com.chatapp.chat_app.dto.LoginRequest;
import com.chatapp.chat_app.dto.RegisterRequest;
import com.chatapp.chat_app.model.User;
import com.chatapp.chat_app.repository.UserRepository;
import com.chatapp.chat_app.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor // Lombok, builds the constructor for the final fields
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    // register new user:
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username already taken");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        User savedUser = userRepository.save(user);

        String token = jwtUtil.generateToken(savedUser);
        return new AuthResponse(token, savedUser.getId(), savedUser.getUsername());
    }

    // login user:
    public AuthResponse login(LoginRequest request) {
        Optional<User> user = userRepository.findByUsername(request.getUsername());
        if (user.isPresent()) {
            if (passwordEncoder.matches(request.getPassword(), user.get().getPassword())) {
                String token = jwtUtil.generateToken(user.get());
                return new AuthResponse(token, user.get().getId(), user.get().getUsername());
            }
        }
        throw new IllegalArgumentException("Invalid Username or Password");

    }
}
