package com.chatapp.chat_app.dto;

import lombok.*;
import java.time.Instant;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class MessageResponse {
    private Long id;
    private Long chatId;
    private Long senderId;
    private String senderUsername;
    private String content;
    private Instant createdAt;
    private String clientId;

    public MessageResponse(Long id, Long chatId, Long senderId, String senderUsername,
                           String content, Instant createdAt) {
        this(id, chatId, senderId, senderUsername, content, createdAt, null);
    }
}
