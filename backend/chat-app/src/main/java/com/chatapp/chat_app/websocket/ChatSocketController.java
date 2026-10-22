package com.chatapp.chat_app.websocket;

import com.chatapp.chat_app.dto.MessageResponse;
import com.chatapp.chat_app.dto.ReceiptRequest;
import com.chatapp.chat_app.dto.SendMessageRequest;
import com.chatapp.chat_app.model.ChatMember;
import com.chatapp.chat_app.model.User;
import com.chatapp.chat_app.repository.ChatMemberRepository;
import com.chatapp.chat_app.repository.UserRepository;
import com.chatapp.chat_app.service.MessageService;
import com.chatapp.chat_app.service.PresenceService;
import com.chatapp.chat_app.service.PushNotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.List;

@Controller
@RequiredArgsConstructor
public class ChatSocketController {

    private final UserRepository userRepository;
    private final MessageService messageService;
    private final ChatMemberRepository chatMemberRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final PresenceService presenceService;
    private final PushNotificationService pushNotificationService;

    private User getUser(Principal principal) {
        return userRepository.findById(Long.valueOf(principal.getName()))
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload @Valid SendMessageRequest request, Principal principal) {
        MessageResponse response = messageService.saveMessage(getUser(principal), request);

        List<ChatMember> members = chatMemberRepository.findByChatId(request.getChatId());
        for (ChatMember member : members) {
            Long memberId = member.getUser().getId();

            messagingTemplate.convertAndSendToUser(
                    memberId.toString(),
                    "/queue/messages",
                    response);
            if (!memberId.equals(response.getSenderId()) && !presenceService.isOnline(memberId)) {
                pushNotificationService.sendMessagePush(
                        memberId,
                        response.getSenderUsername(),
                        response.getContent(),
                        response.getChatId(),
                        response.getId());
            }
        }
    }

    @MessageMapping("/chat.delivered")
    public void delivered(@Payload @Valid ReceiptRequest request, Principal principal) {
        messageService.markDelivered(getUser(principal), request);
    }

    @MessageMapping("/chat.read")
    public void read(@Payload @Valid ReceiptRequest request, Principal principal) {
        messageService.markRead(getUser(principal), request);
    }
}
