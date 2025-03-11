const express = require('express');
const exphbs = require('express-handlebars');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = process.env.PORT || 2539;

// Create the Handlebars instance with helpers
const hbs = exphbs.create({
    helpers: {
        eq: function (a, b) {
            return a === b;
        },
        formatDate: function (dateTime) {
            const date = new Date(dateTime);
            return date.toISOString().slice(0, 16);
        }
    },
    defaultLayout: 'main'
});

// Set up Handlebars
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

// Database connection
const db = mysql.createConnection({
    host: 'classmysql.engr.oregonstate.edu',
    user: 'cs340_whitejo8',
    password: '6175',  // Replace with your actual password
    database: 'cs340_whitejo8'
});

// Connect to database
db.connect(err => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to database');
});

// Routes
// Home page
app.get('/', (req, res) => {
    res.render('index');
});

// CTF Scores - READ (List all scores)
app.get('/scores', (req, res) => {
    // Query to get all scores with participant and challenge info
    const query = `
        SELECT cs.score_id, p.username, c.challenge_name, cs.score, cs.timestamp
        FROM CTF_Scores cs
        INNER JOIN Participants p ON cs.participant_id = p.participant_id
        INNER JOIN Challenges c ON cs.challenge_id = c.challenge_id
    `;

    db.query(query, (err, scores) => {
        if (err) {
            console.error('Error fetching scores:', err);
            return res.status(500).send('Error fetching scores');
        }

        // Get participants for dropdown
        db.query('SELECT participant_id, username FROM Participants', (err, participants) => {
            if (err) {
                console.error('Error fetching participants:', err);
                return res.status(500).send('Error fetching participants');
            }

            // Get challenges for dropdown
            db.query('SELECT challenge_id, challenge_name, max_points FROM Challenges', (err, challenges) => {
                if (err) {
                    console.error('Error fetching challenges:', err);
                    return res.status(500).send('Error fetching challenges');
                }

                res.render('scores', {
                    scores: scores,
                    participants: participants,
                    challenges: challenges
                });
            });
        });
    });
});

// CTF Scores - CREATE (Add new score)
app.post('/scores/add', (req, res) => {
    // Get form data
    const { participantId, challengeId, score, timestamp } = req.body;

    // Insert query
    const query = `
        INSERT INTO CTF_Scores (participant_id, challenge_id, score, timestamp)
        VALUES (?, ?, ?, ?)
    `;

    db.query(query, [participantId, challengeId, score, timestamp], (err, result) => {
        if (err) {
            console.error('Error adding score:', err);
            return res.status(500).send('Error adding score');
        }

        res.redirect('/scores');
    });
});

// CTF Scores - READ (Get score by ID for update)
app.get('/scores/edit/:id', (req, res) => {
    const scoreId = req.params.id;

    // Query to get score data
    const query = `
        SELECT * FROM CTF_Scores WHERE score_id = ?
    `;

    db.query(query, [scoreId], (err, scores) => {
        if (err || scores.length === 0) {
            console.error('Error fetching score:', err);
            return res.status(404).send('Score not found');
        }

        // Get participants for dropdown
        db.query('SELECT participant_id, username FROM Participants', (err, participants) => {
            if (err) {
                console.error('Error fetching participants:', err);
                return res.status(500).send('Error fetching participants');
            }

            // Get challenges for dropdown
            db.query('SELECT challenge_id, challenge_name, max_points FROM Challenges', (err, challenges) => {
                if (err) {
                    console.error('Error fetching challenges:', err);
                    return res.status(500).send('Error fetching challenges');
                }

                res.render('edit-score', {
                    score: scores[0],
                    participants: participants,
                    challenges: challenges
                });
            });
        });
    });
});

// CTF Scores - UPDATE
app.post('/scores/update', (req, res) => {
    const { scoreId, participantId, challengeId, score, timestamp } = req.body;

    const query = `
        UPDATE CTF_Scores
        SET participant_id = ?, challenge_id = ?, score = ?, timestamp = ?
        WHERE score_id = ?
    `;

    db.query(query, [participantId, challengeId, score, timestamp, scoreId], (err, result) => {
        if (err) {
            console.error('Error updating score:', err);
            return res.status(500).send('Error updating score');
        }

        res.redirect('/scores');
    });
});

// CTF Scores - DELETE
app.get('/scores/delete/:id', (req, res) => {
    const scoreId = req.params.id;

    const query = `
        DELETE FROM CTF_Scores WHERE score_id = ?
    `;

    db.query(query, [scoreId], (err, result) => {
        if (err) {
            console.error('Error deleting score:', err);
            return res.status(500).send('Error deleting score');
        }

        res.redirect('/scores');
    });
});

// Teams - READ (List all teams)
app.get('/teams', (req, res) => {
    // Query to get all teams
    const query = `SELECT * FROM Teams`;

    db.query(query, (err, teams) => {
        if (err) {
            console.error('Error fetching teams:', err);
            return res.status(500).send('Error fetching teams');
        }

        res.render('teams', {
            teams: teams
        });
    });
});

// Teams - CREATE (Add new team)
app.post('/teams/add', (req, res) => {
    // Get form data
    const { teamName, creationDate, numMembers } = req.body;

    // Insert query
    const query = `
        INSERT INTO Teams (team_name, creation_date, num_members)
        VALUES (?, ?, ?)
    `;

    db.query(query, [teamName, creationDate, numMembers], (err, result) => {
        if (err) {
            console.error('Error adding team:', err);
            return res.status(500).send('Error adding team');
        }

        res.redirect('/teams');
    });
});

// Teams - READ (Get team by ID for update)
app.get('/teams/edit/:id', (req, res) => {
    const teamId = req.params.id;

    // Query to get team data
    const query = `SELECT * FROM Teams WHERE team_id = ?`;

    db.query(query, [teamId], (err, teams) => {
        if (err || teams.length === 0) {
            console.error('Error fetching team:', err);
            return res.status(404).send('Team not found');
        }

        res.render('edit-team', {
            team: teams[0]
        });
    });
});

// Teams - UPDATE
app.post('/teams/update', (req, res) => {
    const { teamId, teamName, creationDate, numMembers } = req.body;

    const query = `
        UPDATE Teams
        SET team_name = ?, creation_date = ?, num_members = ?
        WHERE team_id = ?
    `;

    db.query(query, [teamName, creationDate, numMembers, teamId], (err, result) => {
        if (err) {
            console.error('Error updating team:', err);
            return res.status(500).send('Error updating team');
        }

        res.redirect('/teams');
    });
});

// Teams - DELETE
app.get('/teams/delete/:id', (req, res) => {
    const teamId = req.params.id;

    const query = `DELETE FROM Teams WHERE team_id = ?`;

    db.query(query, [teamId], (err, result) => {
        if (err) {
            console.error('Error deleting team:', err);
            return res.status(500).send('Error deleting team');
        }

        res.redirect('/teams');
    });
});


// Participants - READ (List all participants)
app.get('/participants', (req, res) => {
    // Query to get all participants with team names
    const query = `
        SELECT p.participant_id, p.username, p.real_name, p.email, p.team_id, t.team_name
        FROM Participants p
        LEFT JOIN Teams t ON p.team_id = t.team_id
    `;

    db.query(query, (err, participants) => {
        if (err) {
            console.error('Error fetching participants:', err);
            return res.status(500).send('Error fetching participants');
        }

        // Get teams for dropdown
        db.query('SELECT team_id, team_name FROM Teams', (err, teams) => {
            if (err) {
                console.error('Error fetching teams:', err);
                return res.status(500).send('Error fetching teams');
            }

            res.render('participants', {
                participants: participants,
                teams: teams
            });
        });
    });
});

// Participants - CREATE (Add new participant)
app.post('/participants/add', (req, res) => {
    // Get form data
    const { username, realName, email, teamId } = req.body;

    // Handle null team_id
    const teamIdValue = teamId === '' ? null : teamId;

    // Insert query
    const query = `
        INSERT INTO Participants (username, real_name, email, team_id)
        VALUES (?, ?, ?, ?)
    `;

    db.query(query, [username, realName, email, teamIdValue], (err, result) => {
        if (err) {
            console.error('Error adding participant:', err);
            return res.status(500).send('Error adding participant');
        }

        res.redirect('/participants');
    });
});

// Participants - READ (Get participant by ID for update)
app.get('/participants/edit/:id', (req, res) => {
    const participantId = req.params.id;

    // Query to get participant data
    const query = `SELECT * FROM Participants WHERE participant_id = ?`;

    db.query(query, [participantId], (err, participants) => {
        if (err || participants.length === 0) {
            console.error('Error fetching participant:', err);
            return res.status(404).send('Participant not found');
        }

        // Get teams for dropdown
        db.query('SELECT team_id, team_name FROM Teams', (err, teams) => {
            if (err) {
                console.error('Error fetching teams:', err);
                return res.status(500).send('Error fetching teams');
            }

            res.render('edit-participant', {
                participant: participants[0],
                teams: teams
            });
        });
    });
});

// Participants - UPDATE
app.post('/participants/update', (req, res) => {
    const { participantId, username, realName, email, teamId } = req.body;

    // Handle null team_id
    const teamIdValue = teamId === '' ? null : teamId;

    const query = `
        UPDATE Participants
        SET username = ?, real_name = ?, email = ?, team_id = ?
        WHERE participant_id = ?
    `;

    db.query(query, [username, realName, email, teamIdValue, participantId], (err, result) => {
        if (err) {
            console.error('Error updating participant:', err);
            return res.status(500).send('Error updating participant');
        }

        res.redirect('/participants');
    });
});

// Participants - DELETE
app.get('/participants/delete/:id', (req, res) => {
    const participantId = req.params.id;

    const query = `DELETE FROM Participants WHERE participant_id = ?`;

    db.query(query, [participantId], (err, result) => {
        if (err) {
            console.error('Error deleting participant:', err);
            return res.status(500).send('Error deleting participant. This participant may have associated scores.');
        }

        res.redirect('/participants');
    });
});


// Challenges - READ (List all challenges)
app.get('/challenges', (req, res) => {
    // Query to get all challenges
    const query = `SELECT * FROM Challenges`;

    db.query(query, (err, challenges) => {
        if (err) {
            console.error('Error fetching challenges:', err);
            return res.status(500).send('Error fetching challenges');
        }

        res.render('challenges', {
            challenges: challenges
        });
    });
});

// Challenges - CREATE (Add new challenge)
app.post('/challenges/add', (req, res) => {
    // Get form data
    const { challengeName, maxPoints, difficulty } = req.body;

    // Insert query
    const query = `
        INSERT INTO Challenges (challenge_name, max_points, difficulty)
        VALUES (?, ?, ?)
    `;

    db.query(query, [challengeName, maxPoints, difficulty], (err, result) => {
        if (err) {
            console.error('Error adding challenge:', err);
            return res.status(500).send('Error adding challenge');
        }

        res.redirect('/challenges');
    });
});

// Challenges - READ (Get challenge by ID for update)
app.get('/challenges/edit/:id', (req, res) => {
    const challengeId = req.params.id;

    // Query to get challenge data
    const query = `SELECT * FROM Challenges WHERE challenge_id = ?`;

    db.query(query, [challengeId], (err, challenges) => {
        if (err || challenges.length === 0) {
            console.error('Error fetching challenge:', err);
            return res.status(404).send('Challenge not found');
        }

        res.render('edit-challenge', {
            challenge: challenges[0]
        });
    });
});

// Challenges - UPDATE
app.post('/challenges/update', (req, res) => {
    const { challengeId, challengeName, maxPoints, difficulty } = req.body;

    const query = `
        UPDATE Challenges
        SET challenge_name = ?, max_points = ?, difficulty = ?
        WHERE challenge_id = ?
    `;

    db.query(query, [challengeName, maxPoints, difficulty, challengeId], (err, result) => {
        if (err) {
            console.error('Error updating challenge:', err);
            return res.status(500).send('Error updating challenge');
        }

        res.redirect('/challenges');
    });
});

// Challenges - DELETE
app.get('/challenges/delete/:id', (req, res) => {
    const challengeId = req.params.id;

    const query = `DELETE FROM Challenges WHERE challenge_id = ?`;

    db.query(query, [challengeId], (err, result) => {
        if (err) {
            console.error('Error deleting challenge:', err);
            return res.status(500).send('Error deleting challenge. This challenge may have associated scores.');
        }

        res.redirect('/challenges');
    });
});


// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
