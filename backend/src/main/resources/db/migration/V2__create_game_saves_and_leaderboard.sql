CREATE TABLE game_saves (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    current_level INTEGER NOT NULL DEFAULT 1 CHECK (current_level >= 1),
    coins INTEGER NOT NULL DEFAULT 0 CHECK (coins >= 0),
    best_time_ms BIGINT CHECK (best_time_ms IS NULL OR best_time_ms > 0),
    unlocked_maps VARCHAR(128) NOT NULL DEFAULT 'green-hills',
    master_volume INTEGER NOT NULL DEFAULT 80 CHECK (master_volume BETWEEN 0 AND 100),
    reduced_motion BOOLEAN NOT NULL DEFAULT FALSE,
    last_played_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE leaderboard (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    best_time_ms BIGINT CHECK (best_time_ms IS NULL OR best_time_ms > 0),
    total_wins INTEGER NOT NULL DEFAULT 0 CHECK (total_wins >= 0),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX idx_leaderboard_ranking
    ON leaderboard (best_time_ms ASC, total_wins DESC);
