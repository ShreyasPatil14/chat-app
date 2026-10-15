package com.chatapp.chat_app.repository;

import com.chatapp.chat_app.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.Optional;

public interface MessageRepository extends JpaRepository<Message, Long> {
    Optional<Message> findFirstByChatIdOrderByIdDesc(Long chatId);

    List<Message> findByChatIdOrderByIdDesc(Long chatId, Pageable pageable);

    List<Message> findByChatIdAndIdLessThanOrderByIdDesc(Long chatId, Long id, Pageable pageable);

    List<Message> findByChatIdAndIdGreaterThanOrderByIdAsc(Long chatId, Long id, Pageable pageable);
}
