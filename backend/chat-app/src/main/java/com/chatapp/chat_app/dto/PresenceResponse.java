package com.chatapp.chat_app.dto;

import lombok.*;
import java.time.Instant;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class PresenceResponse {
    private Long userId;
    private boolean online;
    private Instant lastSeen;
}
