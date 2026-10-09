package com.chatapp.chat_app.repository;

import com.chatapp.chat_app.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
}
