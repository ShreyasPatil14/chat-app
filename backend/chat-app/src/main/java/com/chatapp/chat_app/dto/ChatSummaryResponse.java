package com.chatapp.chat_app.dto;

import com.chatapp.chat_app.model.ChatType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.Instant;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ChatSummaryResponse {
    private Long id;
    private ChatType type;
    private String name;
    private Long otherUserId;
    private boolean online;
    private Instant lastSeen;
    private String lastMessage;
    private String lastMessageSender;
    private Instant lastMessageAt;
    private long unreadCount;
}
