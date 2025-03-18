SET FOREIGN_KEY_CHECKS=0;
SET AUTOCOMMIT = 0;

-- Drop tables if they exist
DROP TABLE IF EXISTS CTF_Scores;
DROP TABLE IF EXISTS Participants;
DROP TABLE IF EXISTS Challenges;
DROP TABLE IF EXISTS Teams;

-- Teams table
-- Stores information about CTF teams
CREATE TABLE Teams (
    team_id INT AUTO_INCREMENT PRIMARY KEY,
    team_name VARCHAR(100) UNIQUE NOT NULL,
    creation_date DATETIME NOT NULL,
    num_members INT NOT NULL
);

-- Participants table
-- Stores information about individual participants
-- Has optional relationship with Teams (team_id can be NULL)
CREATE TABLE Participants (
    participant_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    real_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    team_id INT,
    FOREIGN KEY (team_id) REFERENCES Teams(team_id) ON DELETE SET NULL
);

-- Challenges table
-- Stores CTF challenge information
CREATE TABLE Challenges (
    challenge_id INT AUTO_INCREMENT PRIMARY KEY,
    challenge_name VARCHAR(100) NOT NULL,
    max_points INT NOT NULL,
    difficulty ENUM('Easy', 'Intermediate', 'Hard') NOT NULL
);

-- CTF_Scores table (intersection table for M:M relationship)
-- Tracks participant scores for each challenge
-- Implements M:M relationship between Participants and Challenges
CREATE TABLE CTF_Scores (
    score_id INT AUTO_INCREMENT PRIMARY KEY,
    participant_id INT NOT NULL,
    challenge_id INT NOT NULL,
    score INT NOT NULL DEFAULT 0,
    timestamp DATETIME NOT NULL,
    FOREIGN KEY (participant_id) REFERENCES Participants(participant_id) ON DELETE CASCADE,
    FOREIGN KEY (challenge_id) REFERENCES Challenges(challenge_id) ON DELETE CASCADE
);

-- Insert sample Teams
INSERT INTO Teams (team_name, creation_date, num_members) VALUES
('OSUSEC', '2024-03-10', 6),
('WiCyS', '2024-03-12', 5),
('SWE', '2024-03-17', 5);

-- Insert sample Participants
-- Using subqueries for FK relationships to avoid hardcoding IDs
INSERT INTO Participants (username, real_name, email, team_id) VALUES
('jaywhite0101', 'Jay White', 'whitejo8@oregonstate.edu', 
    (SELECT team_id FROM Teams WHERE team_name = 'OSUSEC')),
('alexab04', 'Alexa Baruela', 'baruelaa@oregonstate.edu', 
    (SELECT team_id FROM Teams WHERE team_name = 'WiCyS')),
('janejane435', 'Jane Doe', 'doej56@oregonstate.edu', 
    (SELECT team_id FROM Teams WHERE team_name = 'SWE'));

-- Insert sample Challenges
INSERT INTO Challenges (challenge_name, max_points, difficulty) VALUES
('SQL Injection', 700, 'Intermediate'),
('OSINT', 400, 'Easy'),
('Buffer Overflow', 900, 'Hard');

-- Insert sample CTF Scores
-- Using subqueries for FK relationships to avoid hardcoding IDs
INSERT INTO CTF_Scores (participant_id, challenge_id, score, timestamp) VALUES
((SELECT participant_id FROM Participants WHERE username = 'jaywhite0101'),
 (SELECT challenge_id FROM Challenges WHERE challenge_name = 'SQL Injection'),
 500, '2024-04-01 14:23:00'),
((SELECT participant_id FROM Participants WHERE username = 'alexab04'),
 (SELECT challenge_id FROM Challenges WHERE challenge_name = 'OSINT'),
 350, '2024-04-01 15:10:00'),
((SELECT participant_id FROM Participants WHERE username = 'janejane435'),
 (SELECT challenge_id FROM Challenges WHERE challenge_name = 'Buffer Overflow'),
 200, '2024-04-02 10:00:00');

SET FOREIGN_KEY_CHECKS=1;
COMMIT;
