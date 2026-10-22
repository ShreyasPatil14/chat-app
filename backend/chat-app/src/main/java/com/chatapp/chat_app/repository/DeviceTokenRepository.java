package com.chatapp.chat_app.repository;

import com.chatapp.chat_app.model.DeviceToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DeviceTokenRepository extends JpaRepository<DeviceToken, Long> {
    Optional<DeviceToken> findByFcmToken(String fcmToken);

    List<DeviceToken> findByUserId(Long userId);

    long deleteByFcmTokenAndUserId(String fcmToken, Long userId);
}
