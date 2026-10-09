package com.chatapp.chat_app.repository;

import com.chatapp.chat_app.model.ChatMember;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChatMemberRepository extends JpaRepository<ChatMember, Long> {
}
