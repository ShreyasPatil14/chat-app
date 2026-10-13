package com.chatapp.chat_app.controller;

import com.chatapp.chat_app.dto.UserResponse;
import com.chatapp.chat_app.model.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @GetMapping("/me")
    public ResponseEntity<UserResponse>  getCurrentUser(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(new UserResponse(user.getId(), user.getUsername()));
    }
}
