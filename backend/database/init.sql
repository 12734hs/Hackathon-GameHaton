CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

--CREATING LANGUAGES
CREATE TABLE languages(
    id SERIAL PRIMARY KEY,
    lang_name VARCHAR(250) NOT NULL UNIQE, --EX english
    lang_code VARCHAR(10) NOT NULL UNIQE --EX eng
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nickname VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    age INT NOT NULL,
    discord_link VARCHAR(150) NULL,       -- Optional
    steam_link VARCHAR(150) DEFAULT NULL, -- Optional
    epic_link VARCHAR(150) DEFAULT NULL,  -- Optional
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--MANY TO MANY CONNECTING TABLE
CREATE TABLE user_languages (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    language_id INT REFERENCES languages(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, language_id)
);

CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    description TEXT,
    game_name VARCHAR(100) NOT NULL,
    game_start_time TIMESTAMP NOT NULL,
    game_end_time TIMESTAMP NOT NULL,
    min_age INT DEFAULT 0,
    max_age INT DEFAULT 99,
    max_players INT NOT NULL DEFAULT 5,
    host_id UUID REFERENCES users(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE room_members (
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (room_id, user_id)
);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    message_text TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO languages (lang_name, lang_code) VALUES 
('Azerbaijani', 'az'),
('English', 'en'),
('Russian', 'ru'),
('Turkish', 'tr');

