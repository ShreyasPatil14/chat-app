package com.chatapp.chat_app.repository;

import com.chatapp.chat_app.model.Chat;
import com.chatapp.chat_app.model.ChatMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ChatMemberRepository extends JpaRepository<ChatMember, Long> {
    @Query("""
    SELECT cm1.chat FROM ChatMember cm1
    JOIN ChatMember cm2 ON cm1.chat = cm2.chat
    WHERE cm1.chat.type = com.chatapp.chat_app.model.ChatType.DIRECT
    AND cm1.user.id = :userId1
    AND cm2.user.id = :userId2
""")
    Optional<Chat> findDirectChat(@Param("userId1") Long userId1, @Param("userId2") Long userId2);

    List<ChatMember> findByUserId(Long userId);
    List<ChatMember> findByChatId(Long chatId);

    Optional<ChatMember> findByChatIdAndUserId(Long chatId, Long userId);
    boolean existsByChatIdAndUserId(Long chatId, Long userId);
}

