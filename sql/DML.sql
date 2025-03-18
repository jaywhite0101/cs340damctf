-- Teams Table Operations
-- Create a new team
INSERT INTO Teams (team_name, creation_date, num_members)
VALUES (:teamNameInput, :creationDateInput, :numMembersInput);

-- Read all teams
SELECT * FROM Teams;

-- Update a team
UPDATE Teams
SET team_name = :teamNameInput,
    creation_date = :creationDateInput,
    num_members = :numMembersInput
WHERE team_id = :teamIdInput;

-- Delete a team
DELETE FROM Teams WHERE team_id = :teamIdInput;

-- Participants Table Operations
-- Create a new participant
INSERT INTO Participants (username, real_name, email, team_id)
VALUES (:usernameInput, :realNameInput, :emailInput, :teamIdInput);

-- Read all participants with team names (JOIN)
SELECT p.participant_id, p.username, p.real_name, p.email, p.team_id, t.team_name
FROM Participants p
LEFT JOIN Teams t ON p.team_id = t.team_id;

-- Update a participant
-- Demonstrates nullable relationship with team_id
UPDATE Participants
SET username = :usernameInput,
    real_name = :realNameInput,
    email = :emailInput,
    team_id = :teamIdInput
WHERE participant_id = :participantIdInput;

-- Delete a participant
DELETE FROM Participants WHERE participant_id = :participantIdInput;

-- Challenges Table Operations
-- Create a new challenge
INSERT INTO Challenges (challenge_name, max_points, difficulty)
VALUES (:challengeNameInput, :maxPointsInput, :difficultyInput);

-- Read all challenges
SELECT * FROM Challenges;

-- Update a challenge
UPDATE Challenges
SET challenge_name = :challengeNameInput,
    max_points = :maxPointsInput,
    difficulty = :difficultyInput
WHERE challenge_id = :challengeIdInput;

-- Delete a challenge
DELETE FROM Challenges WHERE challenge_id = :challengeIdInput;

-- CTF_Scores Table Operations (M:M relationship)
-- Create a new score entry
INSERT INTO CTF_Scores (participant_id, challenge_id, score, timestamp)
VALUES (:participantIdInput, :challengeIdInput, :scoreInput, :timestampInput);

-- Read all scores with participant and challenge names (JOIN)
SELECT cs.score_id, p.username, c.challenge_name, cs.score, cs.timestamp
FROM CTF_Scores cs
INNER JOIN Participants p ON cs.participant_id = p.participant_id
INNER JOIN Challenges c ON cs.challenge_id = c.challenge_id;

-- Update a score (M:M relationship update)
-- This demonstrates updating a record in an M:M relationship
UPDATE CTF_Scores
SET participant_id = :participantIdInput,
    challenge_id = :challengeIdInput,
    score = :scoreInput,
    timestamp = :timestampInput
WHERE score_id = :scoreIdInput;

-- Delete a score (M:M relationship delete)
-- This demonstrates deleting a record from an M:M relationship
DELETE FROM CTF_Scores WHERE score_id = :scoreIdInput;

-- Get participants without a team (demonstrates NULL FK query)
SELECT * FROM Participants WHERE team_id IS NULL;

-- Get all participants for a specific team
SELECT * FROM Participants WHERE team_id = :teamIdInput;

-- Get all scores for a specific participant
SELECT cs.score_id, p.username, c.challenge_name, cs.score, cs.timestamp
FROM CTF_Scores cs
INNER JOIN Participants p ON cs.participant_id = p.participant_id
INNER JOIN Challenges c ON cs.challenge_id = c.challenge_id
WHERE p.participant_id = :participantIdInput;

-- Get total scores by participant
SELECT p.username, SUM(cs.score) as total_score
FROM Participants p
LEFT JOIN CTF_Scores cs ON p.participant_id = cs.participant_id
GROUP BY p.participant_id, p.username;
