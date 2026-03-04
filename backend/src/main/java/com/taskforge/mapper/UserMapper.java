package com.taskforge.mapper;

import com.taskforge.dto.response.UserResponse;
import com.taskforge.model.User;

public interface UserMapper {
    UserResponse toResponse(User user);
}
