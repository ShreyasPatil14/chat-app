package com.chatapp.chat_app.dto;

import com.chatapp.chat_app.model.ChatType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChatResponse {
    private Long id;
    private ChatType type;
    private String name; // other user's name or group name
}
