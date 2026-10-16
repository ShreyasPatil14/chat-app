package com.chatapp.chat_app.websocket;

import com.chatapp.chat_app.dto.PresenceResponse;
import com.chatapp.chat_app.repository.ChatMemberRepository;
import com.chatapp.chat_app.service.PresenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.security.Principal;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class PresenceEventListener {
    private final PresenceService presenceService;
    private final ChatMemberRepository chatMemberRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @EventListener
    public void onConnected(SessionConnectedEvent event) {
        Principal principal = event.getUser();
        if (principal == null) {
            return;
        }
        Long userId = Long.valueOf(principal.getName());
        String sessionId = StompHeaderAccessor.wrap(event.getMessage()).getSessionId();

        if (presenceService.userConnected(userId, sessionId)) {
            broadcast(userId, true, null);
        }
    }

    @EventListener
    public void onDisconnected(SessionDisconnectEvent event) {
        Principal principal = event.getUser();
        if (principal == null) {
            return;
        }
        Long userId = Long.valueOf(principal.getName());

        if (presenceService.userDisconnected(userId, event.getSessionId())) {
            broadcast(userId, false, LocalDateTime.now());
        }
    }

    private void broadcast(Long userId, boolean online, LocalDateTime lastSeen) {
        PresenceResponse presence = new PresenceResponse(userId, online, lastSeen);
        for (Long contactId : chatMemberRepository.findContactIds(userId)) {
            messagingTemplate.convertAndSendToUser(
                    contactId.toString(),
                    "/queue/presence",
                    presence);
        }
    }

}
