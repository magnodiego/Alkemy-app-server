CREATE TABLE users(
    name VARCHAR(30),
    lastName VARCHAR(30),
    username VARCHAR(10),
    password VARCHAR(10),
    role VARCHAR(10),
    hash CHAR(24),
    apps TEXT,
    wishlist TEXT
);

CREATE TABLE apps(
    apphash VARCHAR(24),
    userHash VARCHAR(24),
    category varchar(30),
    name VARCHAR(30),
    price FLOAT,
    descript TEXT,
    photo TEXT,
    date TEXT
);

CREATE TABLE categories(
    id serial PRIMARY KEY,
    category varchar(30)
);

INSERT INTO categories (category) VALUES 
('Games'), 
('Sports'), 
('Education'), 
('Finance'), 
('Others'), 
('Social'), 
('Weather'), 
('All');

