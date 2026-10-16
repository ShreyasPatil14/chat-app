package com.chatapp.chat_app.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class SendMessageRequest {
    @NotNull
    private Long chatId;
    @NotBlank
    @Size(max=2000)
    private String content;
}
