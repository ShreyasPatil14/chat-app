package com.chatapp.chat_app.service;

import com.chatapp.chat_app.dto.UserResponse;
import com.chatapp.chat_app.model.User;
import com.chatapp.chat_app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    // search users by username (partial match), excluding the current user:
    @Transactional(readOnly = true)
    public List<UserResponse> searchUsers(User currentUser, String username) {
        String query = username == null ? "" : username.trim();
        if (query.isEmpty()) {
            return List.of();
        }

        return userRepository
                .findByUsernameContainingIgnoreCaseAndIdNot(
                        query,
                        currentUser.getId(),
                        PageRequest.of(0, 20, Sort.by("username")))
                .stream()
                .map(u -> new UserResponse(u.getId(), u.getUsername()))
                .toList();
    }
}