package com.chatapp.chat_app.repository;

import com.chatapp.chat_app.model.DeviceToken;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DeviceTokenRepository extends JpaRepository<DeviceToken, Long> {
}
