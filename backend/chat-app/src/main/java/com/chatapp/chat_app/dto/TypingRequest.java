package com.chatapp.chat_app.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class TypingRequest {
    @NotNull
    private Long chatId;
}