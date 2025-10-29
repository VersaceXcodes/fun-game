-- Create Tables
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    image_url VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    post_id INTEGER NOT NULL REFERENCES posts(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Seed Data
INSERT INTO users (username, email, password_hash)
VALUES
    ('john_doe', 'john@example.com', 'password123'),
    ('jane_smith', 'jane@example.com', 'user123'),
    ('admin', 'admin@example.com', 'admin123'),
    ('traveler', 'travel@example.com', 'travel123'),
    ('photographer', 'photo@example.com', 'photo123');

INSERT INTO posts (user_id, title, content, image_url)
VALUES
    (1, 'Mountain Sunrise', 'Breathtaking view of the mountains at dawn.', 'https://picsum.photos/seed/mountain-sunrise/800/600'),
    (2, 'City Lights', 'Vibrant cityscape at night.', 'https://picsum.photos/seed/city-lights/800/600'),
    (3, 'Admin Test Post', 'This is an administrative test post.', 'https://picsum.photos/seed/admin-test/800/600'),
    (4, 'Ocean Waves', 'Peaceful ocean scenery.', 'https://picsum.photos/seed/ocean-waves/800/600'),
    (5, 'Urban Exploration', 'Exploring abandoned buildings.', 'https://picsum.photos/seed/urban-exploration/800/600'),
    (1, 'Forest Hike', 'Adventure in the woods.', 'https://picsum.photos/seed/forest-hike/800/600');

INSERT INTO comments (user_id, post_id, content)
VALUES
    (1, 1, 'Incredible shot!'),
    (2, 1, 'Wish I was there!'),
    (4, 2, 'Love the lighting!'),
    (3, 3, 'Testing comment functionality.'),
    (5, 4, 'So calming'),
    (1, 5, 'Great composition!'),
    (2, 6, 'Perfect trail guide'),
    (4, 2, 'More like this please'),
    (5, 3, 'Admins know best'),
    (3, 1, 'Official approval');