const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express();
const http = require('http').createServer(app);

const Sentiment = require('sentiment'); // Import Sentiment library

const PORT = process.env.PORT || 3000;
app.use(bodyParser.json());
http.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Socket 
const io = require('socket.io')(http);

const sentiment = new Sentiment(); // Create a Sentiment instance

io.on('connection', (socket) => {
    console.log('Connected...')
    socket.on('message', (msg) => {
        try {
            const sentimentResult = sentiment.analyze(msg.message); // Analyze sentiment of message
            msg.sentimentScore = sentimentResult.score; // Add sentiment score to message object
            socket.broadcast.emit('message', msg);
        } catch (error) {
            console.error('Error analyzing sentiment:', error);
            msg.sentimentScore = undefined; // Set sentiment score to undefined
            socket.broadcast.emit('message', msg);
        }
    })

})

app.get('/reRender', (req, res) => {
    res.sendFile(__dirname + '/index.html');
})

app.post('/checkUser', async (req, res) => {
    try {
        let username = req.body.username;

        // Read existing usernames from file asynchronously
        const data = await fs.promises.readFile('username.txt', 'utf8');
        const usernames = data.split('\n');

        // Check if username already exists
        const exists = usernames.includes(username);
        if (exists) {
            res.json({
                isUnique: false
            });
            return;
        } else {
            // Append username to file if it doesn't exist
            await fs.promises.appendFile('username.txt', username + '\n', 'utf8');
            res.json({
                isUnique: true
            });
            return;
        }
    } catch (err) {
        console.log("Some error occurs: " + err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
