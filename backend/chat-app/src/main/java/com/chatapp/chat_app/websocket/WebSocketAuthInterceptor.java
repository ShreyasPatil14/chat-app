package com.chatapp.chat_app.websocket;

import com.chatapp.chat_app.model.User;
import com.chatapp.chat_app.repository.UserRepository;
import com.chatapp.chat_app.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessagingException;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class WebSocketAuthInterceptor implements ChannelInterceptor {
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    @Override
    public Message<?> preSend(@NonNull Message<?> message, @NonNull MessageChannel channel) {
        StompHeaderAccessor accessor =
                MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null && accessor.getCommand() == StompCommand.CONNECT) {
            String header = accessor.getFirstNativeHeader("Authorization");
            if (header == null || !header.startsWith("Bearer ")) {
                throw new MessagingException("Missing or invalid token");
            }

            String token = header.substring(7);
            if (!jwtUtil.isTokenValid(token)) {
                throw new MessagingException("Missing or invalid token");
            }

            User user = userRepository.findByUsername(jwtUtil.extractUsername(token))
                    .orElseThrow(() -> new MessagingException("Missing or invalid token"));

            accessor.setUser(new UsernamePasswordAuthenticationToken(
                    user.getId().toString(), null, List.of()));
        }

        return message;
    }
}
