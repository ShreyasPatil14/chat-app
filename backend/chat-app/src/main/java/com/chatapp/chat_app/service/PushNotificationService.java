package com.chatapp.chat_app.service;

import com.chatapp.chat_app.model.DeviceToken;
import com.chatapp.chat_app.repository.DeviceTokenRepository;
import com.google.firebase.messaging.BatchResponse;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.MessagingErrorCode;
import com.google.firebase.messaging.MulticastMessage;
import com.google.firebase.messaging.Notification;
import com.google.firebase.messaging.SendResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PushNotificationService {

    private final FirebaseMessaging firebaseMessaging;
    private final DeviceTokenRepository deviceTokenRepository;

    // send a push for a new message to all devices of a user:
    @Transactional
    public void sendMessagePush(Long userId, String title, String body, Long chatId, Long messageId) {
        List<DeviceToken> devices = deviceTokenRepository.findByUserId(userId);
        if (devices.isEmpty()) {
            return;
        }

        MulticastMessage message = MulticastMessage.builder()
                .addAllTokens(devices.stream().map(DeviceToken::getFcmToken).toList())
                .setNotification(Notification.builder()
                        .setTitle(title)
                        .setBody(body)
                        .build())
                .putData("chatId", chatId.toString())
                .putData("messageId", messageId.toString())
                .build();

        try {
            BatchResponse batch = firebaseMessaging.sendEachForMulticast(message);
            log.info("FCM push for user {}: {} sent, {} failed",
                    userId, batch.getSuccessCount(), batch.getFailureCount());

            // remove tokens that Firebase says are no longer valid:
            List<SendResponse> responses = batch.getResponses();
            List<DeviceToken> invalid = new ArrayList<>();
            for (int i = 0; i < responses.size(); i++) {
                if (!responses.get(i).isSuccessful()) {
                    log.warn("FCM failed for user {}: {}", userId, responses.get(i).getException().getMessagingErrorCode());
                }
                SendResponse response = responses.get(i);
                if (!response.isSuccessful()
                        && response.getException().getMessagingErrorCode() == MessagingErrorCode.UNREGISTERED) {
                    invalid.add(devices.get(i));
                }
            }
            deviceTokenRepository.deleteAll(invalid);
        } catch (FirebaseMessagingException e) {
            log.error("FCM send failed for user {}", userId, e);
        }
    }
}