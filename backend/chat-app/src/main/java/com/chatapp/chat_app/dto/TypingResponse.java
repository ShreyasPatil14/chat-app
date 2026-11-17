package com.chatapp.chat_app.dto;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class TypingResponse {
    private Long chatId;
    private Long userId;
    private String username;
}