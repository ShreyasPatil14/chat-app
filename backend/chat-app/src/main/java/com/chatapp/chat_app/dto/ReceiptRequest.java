package com.chatapp.chat_app.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ReceiptRequest {
    @NotNull
    private Long chatId;
    @NotNull
    private Long messageId;
}
