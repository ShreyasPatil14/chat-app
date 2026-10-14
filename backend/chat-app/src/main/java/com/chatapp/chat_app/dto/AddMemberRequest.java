package com.chatapp.chat_app.dto;

import com.chatapp.chat_app.model.Chat;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AddMemberRequest {
    @NotNull
    private Long userId;
}
