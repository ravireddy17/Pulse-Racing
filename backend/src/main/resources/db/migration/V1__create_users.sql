CREATE TABLE users (
    id UUID PRIMARY KEY,
    username VARCHAR(30) NOT NULL,
    username_key VARCHAR(30) NOT NULL UNIQUE,
    email VARCHAR(254) NOT NULL UNIQUE,
    password_hash VARCHAR(72) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    last_login_at TIMESTAMP WITH TIME ZONE,
    total_races INTEGER NOT NULL DEFAULT 0 CHECK (total_races >= 0),
    best_time_ms BIGINT CHECK (best_time_ms IS NULL OR best_time_ms > 0),
    coins INTEGER NOT NULL DEFAULT 0 CHECK (coins >= 0),
    experience BIGINT NOT NULL DEFAULT 0 CHECK (experience >= 0),
    highest_unlocked_level INTEGER NOT NULL DEFAULT 1 CHECK (highest_unlocked_level >= 1),
    selected_car_color VARCHAR(16) NOT NULL DEFAULT 'RED'
);

CREATE INDEX idx_users_best_time ON users (best_time_ms);
