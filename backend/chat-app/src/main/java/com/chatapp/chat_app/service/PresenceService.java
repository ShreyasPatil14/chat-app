package com.chatapp.chat_app.service;

import com.chatapp.chat_app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class PresenceService {
    private final UserRepository userRepository;
    private final Map<Long, Set<String>> sessions = new ConcurrentHashMap<>();

    // returns true if the user just came online (first open session)
    public boolean userConnected(Long userId, String sessionId) {
        boolean[] firstSession = {false};
        sessions.compute(userId, (id, set) -> {
            if (set == null) {
                set = ConcurrentHashMap.newKeySet();
            }
            set.add(sessionId);
            firstSession[0] = set.size() == 1;
            return set;
        });
        return firstSession[0];
    }

    // returns true if the user just went offline (last open session closed)
    public boolean userDisconnected(Long userId, String sessionId) {
        boolean[] wentOffline = {false};
        sessions.computeIfPresent(userId, (id, set) -> {
            set.remove(sessionId);
            if (set.isEmpty()) {
                wentOffline[0] = true;
                return null; // removes the user from the map
            }
            return set;
        });

        if (wentOffline[0]) {
            userRepository.findById(userId).ifPresent(user -> {
                user.setLastSeen(LocalDateTime.now());
                userRepository.save(user);
            });
        }
        return wentOffline[0];
    }

    public boolean isOnline(Long userId) {
        return sessions.containsKey(userId);
    }
}
