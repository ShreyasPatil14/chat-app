package com.chatapp.chat_app.dto;

import com.chatapp.chat_app.model.ChatType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ChatSummaryResponse {
    private Long id;
    private ChatType type;
    private String name;
    private String lastMessage;
    private LocalDateTime lastMessageAt;
}
