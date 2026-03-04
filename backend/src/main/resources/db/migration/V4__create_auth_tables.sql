-- Users table
CREATE TABLE users (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email                VARCHAR(255)  NOT NULL UNIQUE,
    password_hash        VARCHAR(255)  NOT NULL,
    full_name            VARCHAR(100),
    failed_attempt_count INT           NOT NULL DEFAULT 0,
    locked_until         TIMESTAMPTZ,
    created_at           TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at           TIMESTAMPTZ   NOT NULL DEFAULT now(),
    created_by           VARCHAR(255)
);

CREATE INDEX idx_users_email ON users (email);

-- Refresh tokens table
CREATE TABLE refresh_tokens (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash   VARCHAR(255) NOT NULL UNIQUE,
    expires_at   TIMESTAMPTZ  NOT NULL,
    last_used_at TIMESTAMPTZ,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_refresh_tokens_user_id    ON refresh_tokens (user_id);
CREATE INDEX idx_refresh_tokens_token_hash ON refresh_tokens (token_hash);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens (expires_at);

-- Token denylist table
CREATE TABLE token_denylist (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_jti  VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ  NOT NULL
);

CREATE INDEX idx_token_denylist_token_jti  ON token_denylist (token_jti);
CREATE INDEX idx_token_denylist_expires_at ON token_denylist (expires_at);

-- Login audit table
CREATE TABLE login_audit (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email          VARCHAR(255) NOT NULL,
    success        BOOLEAN      NOT NULL,
    failure_reason VARCHAR(255),
    ip_address     VARCHAR(45),
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_login_audit_email      ON login_audit (email);
CREATE INDEX idx_login_audit_created_at ON login_audit (created_at);
