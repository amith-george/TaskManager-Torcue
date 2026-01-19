const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/database-config');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const socketMiddleware = require('./middleware/socketMiddleware');
require('dotenv').config();

const PORT = process.env.PORT || 4000;

const userRoutes = require('./routes/user.routes');
const taskRoutes = require('./routes/tasks.routes');


const app = express();

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET","POST","PATCH","DELETE"]
    }
});

io.use(socketMiddleware);

connectDB();

app.use(cors());
app.use(express.json());


app.set('io',io);


/* Automatic Logging */
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

const infoLogStream = fs.createWriteStream(path.join(logsDir, 'info.txt'), { flags: 'a' });
const errorLogStream = fs.createWriteStream(path.join(logsDir, 'error.txt'), { flags: 'a' });

app.use(morgan('combined', {
    skip: function (req,res) { return res.statusCode >= 400 },
    stream: infoLogStream
}));

app.use(morgan('combined', {
    skip: function (req,res) { return res.statusCode < 400},
    stream: errorLogStream
}));


io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.email} (${socket.user._id})`);
    
    socket.join(socket.user._id.toString());

    if (socket.user.role === 'admin') {
        socket.join('admin-room');
        console.log(`User ${socket.user.email} joined admin-room.`);
    }

    socket.on('disconnect', () => {
        console.log('User disconnected: ', socket.id);
    });
});


app.use('/users', userRoutes);
app.use('/tasks', taskRoutes);


server.listen(PORT, () => 
    console.log(`Server started on PORT: ${PORT}`)
);