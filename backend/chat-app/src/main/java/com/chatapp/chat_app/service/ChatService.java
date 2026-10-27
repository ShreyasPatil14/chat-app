package com.chatapp.chat_app.service;

import com.chatapp.chat_app.dto.ChatMemberResponse;
import com.chatapp.chat_app.dto.ChatResponse;
import com.chatapp.chat_app.dto.ChatSummaryResponse;
import com.chatapp.chat_app.dto.CreateGroupRequest;
import com.chatapp.chat_app.model.*;
import com.chatapp.chat_app.repository.ChatMemberRepository;
import com.chatapp.chat_app.repository.ChatRepository;
import com.chatapp.chat_app.repository.MessageRepository;
import com.chatapp.chat_app.repository.UserRepository;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ChatService {
    private final ChatRepository chatRepository;
    private final UserRepository userRepository;
    private final ChatMemberRepository chatMemberRepository;
    private final MessageRepository messageRepository;
    private final PresenceService presenceService;

    // create or get direct chat:
    @Transactional
    public ChatResponse getOrCreateDirectChat(User currentUser, Long otherUserId) {
        if (currentUser.getId().equals(otherUserId)) {
            throw new IllegalArgumentException("Cannot chat with yourself");
        }

        User otherUser = userRepository.findById(otherUserId).orElseThrow(() -> new IllegalArgumentException("User not found"));

        Optional<Chat> chat = chatMemberRepository.findDirectChat(currentUser.getId(), otherUserId);

        if (chat.isPresent()) {
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

    // create group chat:
    @Transactional
    public ChatResponse createGroupChat(User currentUser, CreateGroupRequest request) {
        Set<Long> ids = new HashSet<>(request.getMemberIds());
        ids.remove(currentUser.getId());

        if (ids.isEmpty()) {
            throw new IllegalArgumentException("Add at least one other member");
        }

        List<User> users = userRepository.findAllById(ids);
        if (users.size() != ids.size()) {
            throw new IllegalArgumentException("One or more users not found!");
        }

        // new chat:
        Chat newChat = new Chat();
        newChat.setType(ChatType.GROUP);
        newChat.setName(request.getName());
        newChat.setCreatedBy(currentUser);
        chatRepository.save(newChat);

        List<ChatMember> members = new ArrayList<>();

        // admin:
        ChatMember admin = new ChatMember();
        admin.setChat(newChat);
        admin.setUser(currentUser);
        admin.setRole(MemberRole.ADMIN);
        members.add(admin);

        // other members:
        for (User user : users) {
            ChatMember member = new ChatMember();
            member.setChat(newChat);
            member.setUser(user);
            member.setRole(MemberRole.MEMBER);
            members.add(member);
        }

        // save all members list:
        chatMemberRepository.saveAll(members);

        return new ChatResponse(newChat.getId(), newChat.getType(), newChat.getName());
    }

    // get members of a chat:
    @Transactional(readOnly = true)
    public List<ChatMemberResponse> getMembers(User currentUser, Long chatId) {
        if (!chatMemberRepository.existsByChatIdAndUserId(chatId, currentUser.getId())) {
            throw new IllegalArgumentException("You are not a member of this chat");
        }

        return chatMemberRepository.findByChatId(chatId).stream()
                .map(m -> {
                    User u = m.getUser();
                    return new ChatMemberResponse(
                            u.getId(),
                            u.getUsername(),
                            m.getRole().name(),
                            presenceService.isOnline(u.getId()),
                            u.getLastSeen());
                })
                .toList();
    }

    // get all chats for a user with online/offline status for direct chats:
    @Transactional(readOnly = true)
    public List<ChatSummaryResponse> getMyChats(User currentUser) {
        List<ChatMember> memberships = chatMemberRepository.findByUserId(currentUser.getId());
        List<ChatSummaryResponse> result = new ArrayList<>();

        for (ChatMember membership : memberships) {
            Chat chat = membership.getChat();

            String name;
            Long otherUserId = null;
            boolean online = false;
            LocalDateTime lastSeen = null;

            if (chat.getType() == ChatType.GROUP) {
                name = chat.getName();
            } else {
                User other = chatMemberRepository.findByChatId(chat.getId()).stream()
                        .map(ChatMember::getUser)
                        .filter(u -> !u.getId().equals(currentUser.getId()))
                        .findFirst()
                        .orElse(null);

                if (other == null) {
                    name = "Unknown";
                } else {
                    name = other.getUsername();
                    otherUserId = other.getId();
                    online = presenceService.isOnline(other.getId());
                    lastSeen = other.getLastSeen();
                }
            }

            Optional<Message> last = messageRepository.findFirstByChatIdOrderByIdDesc(chat.getId());
            String lastMessage = last.map(Message::getContent).orElse(null);
            LocalDateTime lastMessageAt = last.map(Message::getCreatedAt).orElse(null);
            String lastMessageSender = last.map(m -> m.getSender().getUsername()).orElse(null);

            Long lastRead = membership.getLastReadMessageId() != null ? membership.getLastReadMessageId() : 0L;
            long unreadCount = messageRepository.countByChatIdAndIdGreaterThanAndSenderIdNot(
                    chat.getId(), lastRead, currentUser.getId());

            result.add(new ChatSummaryResponse(
                    chat.getId(), chat.getType(), name, otherUserId, online, lastSeen, lastMessage, lastMessageSender, lastMessageAt, unreadCount));
        }

        return result;
    }

    // add a member in group chat:
    @Transactional
    public void addMember(User currentUser, Long chatId, Long userId) {
        Chat chat = chatRepository.findById(chatId).orElseThrow(() -> new IllegalArgumentException("Chat not found"));

        if (chat.getType().equals(ChatType.DIRECT)) {
            throw new IllegalArgumentException("Members can only be added to group chats");
        }

        Optional<ChatMember> member = chatMemberRepository.findByChatIdAndUserId(chatId, currentUser.getId());
        if (member.isEmpty()) {
            throw new IllegalArgumentException("You are not a member of this chat");
        } else if (!member.get().getRole().equals(MemberRole.ADMIN)) {
            throw new IllegalArgumentException("Only admins can add members");
        }

        if (chatMemberRepository.existsByChatIdAndUserId(chatId, userId)) {
            throw new IllegalArgumentException("User is already a member");
        }

        User newMember = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        ChatMember memberToAdd = new ChatMember();
        memberToAdd.setChat(chat);
        memberToAdd.setUser(newMember);
        memberToAdd.setRole(MemberRole.MEMBER);
        chatMemberRepository.save(memberToAdd);
    }

    // remove member:
    @Transactional
    public void removeMember(User currentUser, Long chatId, Long userId) {
        Chat chat = chatRepository.findById(chatId).orElseThrow(() -> new IllegalArgumentException("Chat not found"));
        if (chat.getType().equals(ChatType.DIRECT)) {
            throw new IllegalArgumentException("Members can only be removed from group chats");
        }

        Optional<ChatMember> caller = chatMemberRepository.findByChatIdAndUserId(chatId, currentUser.getId());
        if (caller.isEmpty()) {
            throw new IllegalArgumentException("You are not a member of this chat");
        }

        Optional<ChatMember> target = chatMemberRepository.findByChatIdAndUserId(chatId, userId);
        if (target.isEmpty()) {
            throw new IllegalArgumentException("User is not a member of this chat");
        }

        if (!currentUser.getId().equals(userId) && !caller.get().getRole().equals(MemberRole.ADMIN)) {
            throw new IllegalArgumentException("Only admins can remove members");
        }

        if (target.get().getRole() == MemberRole.ADMIN) {
            List<ChatMember> others = chatMemberRepository.findByChatId(chatId).stream()
                    .filter(m -> !m.getId().equals(target.get().getId()))
                    .toList();

            boolean anotherAdminExists = others.stream()
                    .anyMatch(m -> m.getRole() == MemberRole.ADMIN);

            if (!others.isEmpty() && !anotherAdminExists) {
                ChatMember newAdmin = others.stream()
                        .min(Comparator.comparing(ChatMember::getJoinedAt))
                        .get();
                newAdmin.setRole(MemberRole.ADMIN);
                chatMemberRepository.save(newAdmin);
            }
        }

        chatMemberRepository.delete(target.get());
    }
}
