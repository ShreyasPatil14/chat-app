package com.chatapp.chat_app.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class PresenceResponse {
    private Long userId;
    private boolean online;
    private LocalDateTime lastSeen;
}
