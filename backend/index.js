const express = require('express');
const connectDB = require('./config/database-config');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const PORT = process.env.PORT || 4000;

const userRoutes = require('./routes/user.routes');
const taskRoutes = require('./routes/tasks.routes');


const app = express();
connectDB();

app.use(cors());
app.use(express.json());


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


app.use('/users', userRoutes);
app.use('/tasks', taskRoutes);


app.listen(PORT, () => 
    console.log(`Server started on PORT: ${PORT}`)
);