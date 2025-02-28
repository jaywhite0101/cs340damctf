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

// Teams page
app.get('/teams', (req, res) => {
    res.render('placeholder', {
        title: 'Teams Management',
        message: 'Teams Management allows you to add, view, edit, and delete teams in the CTF competition.',
        isTeams: true
    });
});

// Participants page
app.get('/participants', (req, res) => {
    res.render('placeholder', {
        title: 'Participants Management',
        message: 'Participants Management allows you to manage competitor information and assign them to teams.',
        isParticipants: true
    });
});

// Challenges page
app.get('/challenges', (req, res) => {
    res.render('placeholder', {
        title: 'Challenges Management',
        message: 'Challenges Management allows you to configure CTF challenges, their difficulty levels, and point values.',
        isChallenges: true
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
