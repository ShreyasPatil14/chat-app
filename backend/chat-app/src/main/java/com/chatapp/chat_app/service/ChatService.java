package com.chatapp.chat_app.service;

import com.chatapp.chat_app.dto.ChatResponse;
import com.chatapp.chat_app.model.Chat;
import com.chatapp.chat_app.model.ChatMember;
import com.chatapp.chat_app.model.MemberRole;
import com.chatapp.chat_app.model.User;
import com.chatapp.chat_app.repository.ChatMemberRepository;
import com.chatapp.chat_app.repository.ChatRepository;
import com.chatapp.chat_app.repository.UserRepository;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.chatapp.chat_app.model.ChatType;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ChatService {
    private final ChatRepository chatRepository;
    private final UserRepository userRepository;
    private final ChatMemberRepository chatMemberRepository;

    @Transactional
    public ChatResponse getOrCreateDirectChat(User currentUser, Long otherUserId){
        if(currentUser.getId().equals(otherUserId)){
            throw new IllegalArgumentException("Cannot chat with yourself");
        }

        User otherUser = userRepository.findById(otherUserId).orElseThrow(()-> new IllegalArgumentException("User not found"));

        Optional<Chat> chat = chatMemberRepository.findDirectChat(currentUser.getId(), otherUserId);

        if(chat.isPresent()){
            return new ChatResponse(chat.get().getId(), chat.get().getType(), otherUser.getUsername());
        }

        Chat newChat = new Chat();
        newChat.setType(ChatType.DIRECT);
        newChat.setCreatedBy(currentUser);
        chatRepository.save(newChat);

        ChatMember member1 = new ChatMember();
        member1.setUser(currentUser);
        member1.setRole(MemberRole.MEMBER);
        member1.setChat(newChat);

        ChatMember member2 = new ChatMember();
        member2.setUser(otherUser);
        member2.setRole(MemberRole.MEMBER);
        member2.setChat(newChat);

        chatMemberRepository.saveAll(List.of(member1, member2));

        return new ChatResponse(newChat.getId(), newChat.getType(), otherUser.getUsername());
    }
}
