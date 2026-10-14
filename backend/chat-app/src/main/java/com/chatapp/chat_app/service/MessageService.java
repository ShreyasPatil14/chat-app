package com.chatapp.chat_app.service;

import com.chatapp.chat_app.dto.MessageResponse;
import com.chatapp.chat_app.model.Message;
import com.chatapp.chat_app.model.User;
import com.chatapp.chat_app.repository.ChatMemberRepository;
import com.chatapp.chat_app.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageService {
    private final MessageRepository messageRepository;
    private final ChatMemberRepository chatMemberRepository;

    @Transactional(readOnly = true)
    public List<MessageResponse> getMessages(User currentUser, Long chatId, Long before, int limit) {
        if (!chatMemberRepository.existsByChatIdAndUserId(chatId, currentUser.getId())) {
            throw new IllegalArgumentException("You are not a member of this chat");
        }
        int size = Math.max(1, Math.min(limit, 50));
        Pageable pageable = PageRequest.of(0, size);

        List<Message> messages;
        if (before == null) {
            messages = messageRepository.findByChatIdOrderByIdDesc(chatId, pageable);
        } else {
            messages = messageRepository.findByChatIdAndIdLessThanOrderByIdDesc(chatId, before, pageable);
        }

        return messages.stream()
                .map(m -> new MessageResponse(
                        m.getId(),
                        m.getChat().getId(),
                        m.getSender().getId(),
                        m.getSender().getUsername(),
                        m.getContent(),
                        m.getCreatedAt()))
                .toList();
    }
}
