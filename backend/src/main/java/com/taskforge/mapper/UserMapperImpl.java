package com.taskforge.mapper;

import com.taskforge.dto.response.UserResponse;
import com.taskforge.model.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapperImpl implements UserMapper {

    @Override
    public UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName()
        );
    }
}
