package com.chatapp.chat_app.service;

import com.chatapp.chat_app.dto.RegisterDeviceTokenRequest;
import com.chatapp.chat_app.model.DeviceToken;
import com.chatapp.chat_app.model.User;
import com.chatapp.chat_app.repository.DeviceTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DeviceTokenService {

    private final DeviceTokenRepository deviceTokenRepository;

    // register (or move) a device token for a user:
    @Transactional
    public void register(User user, RegisterDeviceTokenRequest request) {
        String token = request.getFcmToken().trim();

        DeviceToken deviceToken = deviceTokenRepository.findByFcmToken(token)
                .orElseGet(DeviceToken::new);

        deviceToken.setUser(user);
        deviceToken.setFcmToken(token);
        deviceTokenRepository.save(deviceToken);
    }
}