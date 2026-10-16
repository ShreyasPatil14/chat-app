package com.chatapp.chat_app.service;

import com.chatapp.chat_app.dto.MessageResponse;
import com.chatapp.chat_app.dto.SendMessageRequest;
import com.chatapp.chat_app.model.Chat;
import com.chatapp.chat_app.model.ChatMember;
import com.chatapp.chat_app.model.Message;
import com.chatapp.chat_app.model.User;
import com.chatapp.chat_app.repository.ChatMemberRepository;
import com.chatapp.chat_app.repository.ChatRepository;
import com.chatapp.chat_app.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MessageService {
    private final MessageRepository messageRepository;
    private final ChatMemberRepository chatMemberRepository;
    private final ChatRepository chatRepository;


    // get messages for chat:
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

    // get new messages (undelivered) for a user:
    @Transactional(readOnly = true)
    public List<MessageResponse> syncMessages(User user) {
        List<ChatMember> memberships = chatMemberRepository.findByUserId(user.getId());

        List<MessageResponse> result = new ArrayList<>();

        for (ChatMember membership : memberships) {
            Long chatId = membership.getChat().getId();
            Long afterId = membership.getLastDeliveredMessageId() != null
                    ? membership.getLastDeliveredMessageId()
                    : 0L;

            List<Message> missed = messageRepository
                    .findByChatIdAndIdGreaterThanOrderByIdAsc(chatId, afterId, PageRequest.of(0, 200));

            for (Message m : missed) {
                result.add(new MessageResponse(
                        m.getId(),
                        m.getChat().getId(),
                        m.getSender().getId(),
                        m.getSender().getUsername(),
                        m.getContent(),
                        m.getCreatedAt()));
            }
        }

        return result;
    }

    // save message:
    @Transactional
    public MessageResponse saveMessage(User sender, SendMessageRequest request){
        if(!chatMemberRepository.existsByChatIdAndUserId(request.getChatId(), sender.getId())){
            throw new IllegalArgumentException("You are not a member of this chat");
        }

        Optional<Chat> chat = chatRepository.findById(request.getChatId());
        if(chat.isEmpty()){
            throw new IllegalArgumentException("Chat not found");
        }

        Message message = new Message();
        message.setChat(chat.get());
        message.setSender(sender);
        message.setContent(request.getContent().trim());

        Message response = messageRepository.save(message);

        return new MessageResponse(
                response.getId(),
                response.getChat().getId(),
                response.getSender().getId(),
                response.getSender().getUsername(),
                response.getContent(),
                response.getCreatedAt()
        );
    }
}
