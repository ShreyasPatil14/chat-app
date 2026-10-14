package com.chatapp.chat_app.repository;

import com.chatapp.chat_app.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MessageRepository extends JpaRepository<Message, Long> {
    Optional<Message> findFirstByChatIdOrderByIdDesc(Long chatId);
}
