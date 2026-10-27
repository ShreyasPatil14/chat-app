package com.chatapp.chat_app.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ChatMemberResponse {
    private Long id;
    private String username;
    private String role;
    private boolean online;
    private LocalDateTime lastSeen;
}