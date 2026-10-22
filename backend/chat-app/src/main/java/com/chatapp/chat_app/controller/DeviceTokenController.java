package com.chatapp.chat_app.controller;

import com.chatapp.chat_app.dto.RegisterDeviceTokenRequest;
import com.chatapp.chat_app.model.User;
import com.chatapp.chat_app.service.DeviceTokenService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/devices")
@RequiredArgsConstructor
public class DeviceTokenController {

    private final DeviceTokenService deviceTokenService;

    @PostMapping("/token")
    public ResponseEntity<Void> registerToken(@AuthenticationPrincipal User user,
                                              @Valid @RequestBody RegisterDeviceTokenRequest request) {
        deviceTokenService.register(user, request);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/token")
    public ResponseEntity<Void> unregisterToken(@AuthenticationPrincipal User user,
                                                @Valid @RequestBody RegisterDeviceTokenRequest request) {
        deviceTokenService.unregister(user, request);
        return ResponseEntity.noContent().build();
    }
}