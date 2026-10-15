package com.chatapp.chat_app.controller;

import com.chatapp.chat_app.dto.MessageResponse;
import com.chatapp.chat_app.model.User;
import com.chatapp.chat_app.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class MessageController {
    private final MessageService messageService;

    @GetMapping("/api/chats/{chatId}/messages")
    public ResponseEntity<List<MessageResponse>> getMessages(
            @AuthenticationPrincipal User user,
            @PathVariable Long chatId,
            @RequestParam(required = false) Long before,
            @RequestParam(defaultValue = "30") int limit
    ) {
        return ResponseEntity.ok(messageService.getMessages(user, chatId, before, limit));
    }

    @GetMapping("/api/messages/sync")
    public ResponseEntity<List<MessageResponse>> syncMessages(@AuthenticationPrincipal User user){
        return ResponseEntity.ok(messageService.syncMessages(user));
    }
}
