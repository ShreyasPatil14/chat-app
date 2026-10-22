package com.chatapp.chat_app.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
public class RegisterDeviceTokenRequest {

    @NotBlank
    @Size(max=512)
    private String fcmToken;
}
