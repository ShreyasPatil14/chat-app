package com.chatapp.chat_app.controller;

import com.chatapp.chat_app.dto.*;
import com.chatapp.chat_app.model.User;
import com.chatapp.chat_app.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<ChatResponse> createGroupChat(@AuthenticationPrincipal User user, @Valid @RequestBody CreateGroupRequest request) {
        return ResponseEntity.ok(chatService.createGroupChat(user, request));
    }

    @GetMapping("/{chatId}/members")
    public ResponseEntity<List<ChatMemberResponse>> getMembers(@AuthenticationPrincipal User user,
                                                               @PathVariable Long chatId) {
        return ResponseEntity.ok(chatService.getMembers(user, chatId));
    }

    @GetMapping
    public ResponseEntity<List<ChatSummaryResponse>> getMyChats(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(chatService.getMyChats(user));
    }

    @PostMapping("/{id}/members")
    public ResponseEntity<Void> addMember(@AuthenticationPrincipal User user, @PathVariable Long id, @Valid @RequestBody AddMemberRequest request) {
        chatService.addMember(user, id, request.getUserId());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{chatId}/members/{userId}")
    public ResponseEntity<Void> removeMember(@AuthenticationPrincipal User user, @PathVariable Long chatId, @PathVariable Long userId) {
        chatService.removeMember(user, chatId, userId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{chatId}")
    public ResponseEntity<Void> deleteChat(@AuthenticationPrincipal User user, @PathVariable Long chatId) {
        chatService.deleteChat(user, chatId);
        return ResponseEntity.noContent().build();
    }
}
