package com.chatapp.chat_app.repository;

import com.chatapp.chat_app.model.Chat;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChatRepository extends JpaRepository<Chat, Long> {
}
