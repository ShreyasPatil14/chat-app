package com.chatapp.chat_app.controller;

import com.chatapp.chat_app.dto.UserResponse;
import com.chatapp.chat_app.model.User;
import com.chatapp.chat_app.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserResponse>  getCurrentUser(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(new UserResponse(user.getId(), user.getUsername()));
    }

    @GetMapping("/search")
    public ResponseEntity<List<UserResponse>> searchUsers(@AuthenticationPrincipal User user,
                                                          @RequestParam String username) {
        return ResponseEntity.ok(userService.searchUsers(user, username));
    }
}
