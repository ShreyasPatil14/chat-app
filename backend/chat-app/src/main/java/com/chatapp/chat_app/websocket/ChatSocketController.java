package com.chatapp.chat_app.websocket;

import com.chatapp.chat_app.dto.MessageResponse;
import com.chatapp.chat_app.dto.SendMessageRequest;
import com.chatapp.chat_app.model.ChatMember;
import com.chatapp.chat_app.model.User;
import com.chatapp.chat_app.repository.ChatMemberRepository;
import com.chatapp.chat_app.repository.UserRepository;
import com.chatapp.chat_app.service.MessageService;
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

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload @Valid SendMessageRequest request, Principal principal) {
        Long senderId = Long.valueOf(principal.getName());
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        MessageResponse response = messageService.saveMessage(sender, request);

        List<ChatMember> members = chatMemberRepository.findByChatId(request.getChatId());
        for (ChatMember member : members) {
            messagingTemplate.convertAndSendToUser(
                    member.getUser().getId().toString(),
                    "/queue/messages",
                    response);
        }
    }
}
