package com.chatapp.chat_app.dto;

import lombok.*;

import java.time.LocalDateTime;

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
    private LocalDateTime createdAt;

}
