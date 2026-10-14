package com.chatapp.chat_app.controller;

import com.chatapp.chat_app.dto.ChatResponse;
import com.chatapp.chat_app.dto.ChatSummaryResponse;
import com.chatapp.chat_app.dto.CreateGroupRequest;
import com.chatapp.chat_app.dto.DirectChatRequest;
import com.chatapp.chat_app.model.User;
import com.chatapp.chat_app.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/chats")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @PostMapping("/direct")
    public ResponseEntity<ChatResponse> createDirectChat(@AuthenticationPrincipal User user, @Valid @RequestBody DirectChatRequest request) {
        return ResponseEntity.ok(chatService.getOrCreateDirectChat(user, request.getUserId()));
    }

    @PostMapping("/group")
    public ResponseEntity<ChatResponse> createGroupChat(@AuthenticationPrincipal User user, @Valid @RequestBody CreateGroupRequest request){
        return ResponseEntity.ok(chatService.createGroupChat(user, request));
    }

    @PostMapping
    public ResponseEntity<List<ChatSummaryResponse>> getMyChats(@AuthenticationPrincipal User user){
        return ResponseEntity.ok(chatService.getMyChats(user));
    }

}
