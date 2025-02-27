-- Create a new team
INSERT INTO Teams (team_name, creation_date, num_members)
VALUES (:teamNameInput, :creationDateInput, :numMembersInput);

-- Read all teams
SELECT * FROM Teams;

-- Update a team
UPDATE Teams
SET team_name = :teamNameInput,
    num_members = :numMembersInput
WHERE team_id = :teamIdInput;

-- Delete a team
DELETE FROM Teams WHERE team_id = :teamIdInput;

-- Participants Table Operations
-- Create a new participant
INSERT INTO Participants (username, real_name, email, team_id)
VALUES (:usernameInput, :realNameInput, :emailInput, :teamIdInput);

-- Read all participants with team names (JOIN)
SELECT p.participant_id, p.username, p.real_name, p.email, t.team_name
FROM Participants p
LEFT JOIN Teams t ON p.team_id = t.team_id;

-- Update a participant
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

-- CTF_Scores Table Operations
-- Create a new score entry
INSERT INTO CTF_Scores (participant_id, challenge_id, score, timestamp)
VALUES (:participantIdInput, :challengeIdInput, :scoreInput, :timestampInput);

-- Read all scores with participant and challenge names (JOIN)
SELECT cs.score_id, p.username, c.challenge_name, cs.score, cs.timestamp
FROM CTF_Scores cs
INNER JOIN Participants p ON cs.participant_id = p.participant_id
INNER JOIN Challenges c ON cs.challenge_id = c.challenge_id;

-- Update a score
UPDATE CTF_Scores
SET score = :scoreInput,
    timestamp = :timestampInput
WHERE score_id = :scoreIdInput;

-- Delete a score
DELETE FROM CTF_Scores WHERE score_id = :scoreIdInput;

-- Search/Filter Operations
-- Search participants by team
SELECT p.* FROM Participants p
INNER JOIN Teams t ON p.team_id = t.team_id
WHERE t.team_name = :teamNameInput;

-- Get total scores by participant
SELECT p.username, SUM(cs.score) as total_score
FROM Participants p
LEFT JOIN CTF_Scores cs ON p.participant_id = cs.participant_id
GROUP BY p.participant_id, p.username;