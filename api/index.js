import express from "express";
import mongoose from "mongoose";
import { config, configDotenv } from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/message.route.js'
import userRoutes from './routes/users.route.js'
import { WebSocketServer, WebSocket } from 'ws';
import ws from 'ws'
import jwt from 'jsonwebtoken'; // Don't forget to import jwt
import cors from 'cors';
import Message from "./models/message.model.js";
import { createServer } from 'http'
import fs from 'fs'
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

configDotenv(); // Corrected method name

mongoose.connect(process.env.DATABASE_URL)
    .then(() => { console.log("database connected"); })
    .catch((e) => console.log(e));

const app = express();
app.use(express.json());
app.use(cookieParser());


app.use(cors({
    credentials: true,
    origin: process.env.CLIENT_URL
}));

app.use('/api/auth', authRoutes);
app.use('/api/message', messageRoutes)
app.use('/api/users', userRoutes)
app.use('/api/message/uploads', express.static(__dirname + '/uploads'))


const server = createServer(app)
const wss = new WebSocketServer({ server })

// const wss = new WebSocket(`${server}`);
// console.log(wss.clients)

server.listen(4000);


wss.on('connection', (connection, req) => {


    function notifyAboutOnlinePeople() {
        [...wss.clients].forEach(client => {
            client.send(JSON.stringify({
                online: [...wss.clients].map(c => ({ userId: c.userId, username: c.username }))
            }))
        })
    }



    connection.isAlive = true;
    connection.timer = setInterval(() => {
        connection.ping()
        connection.deathTimer = setTimeout(() => {
            connection.isAlive = false;
            connection.terminate()
            clearInterval(connection.timer)
            notifyAboutOnlinePeople()
            console.log('dead')
        }, 1000)
    }, 5000)


    connection.on('pong', () => {
        clearTimeout(connection.deathTimer)
    })

    //read user
    const cookies = req.headers.cookie;
    // console.log(cookies)  refresh front-end each time to view the result
    if (cookies) {
        const tokenCookieString = cookies.split(';').find(str => str.startsWith('access_token='));
        // console.log(tokenCookieString)
        if (tokenCookieString) {
            const token = tokenCookieString.split('=')[1];
            // console.log(token)
            if (token) {
                jwt.verify(token, process.env.SECRET_KEY, (err, userData) => {
                    if (err) {
                        console.error('Token verification failed:', err);
                        return;
                    }
                    // console.log(userData)
                    const { id, username } = userData
                    connection.userId = id;
                    connection.username = username;
                    // console.log(connection)
                });
            }
        }
    }
    // console.log([...wss.clients].map(c => (c.username)))
    // console.log(wss.clients)

    connection.on('message', async (message) => {
        const messageData = JSON.parse(message.toString())
        // console.log(messageData)
        const { recipient, text, file } = messageData.message
        // console.log(file)
        let filename = null;
        if (file) {
            const parts = file.info.split('.');
            console.log(parts)
            const ext = parts[parts.length - 1];
            console.log(ext)
            filename = Date.now() + '.' + ext;
            const path = __dirname + '/uploads/' + filename;
            const bufferData = Buffer.from(file.data, 'base64');
            fs.writeFile(path, bufferData, () => {
                console.log('file uploaded: ', filename)
            })
        }
        // console.log(recipient)
        if (recipient && (text || file)) {
            const messageDoc = await Message.create({
                sender: connection.userId,
                recipient,
                text,
                file: file ? filename : null
            });


            [...wss.clients].filter(c => c.userId === recipient).forEach(c => c.send(JSON.stringify({
                text,
                sender: connection.userId,
                _id: messageDoc._id,
                recipient,
                file: file ? filename : null
            })));
        }
    });



    //notify who is online
    notifyAboutOnlinePeople();

});
