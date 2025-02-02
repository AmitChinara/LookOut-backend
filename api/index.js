// Import the express module
const express = require('express');
const cors = require("cors");
const PATHS = require('../routes/paths');
const http = require('http');
const router = require('../routers/router');
require('dotenv').config(); // This loads the environment variables from the .env file
const WebSocket = require('ws');

// Created a connection with mongodb
const connectDB = require('../db/db')
const { fetchAllStatusWS } = require("../controllers/statusController");
const {addClient} = require("../services/WebSocketService");
connectDB();

// Create an instance of the express application
const index = express();

// Allow all origins (for development)
index.use(cors());

// OR: Allow specific origin (recommended for production)
index.use(
    cors({
        origin: "https://lookout-frontend-5vfs.onrender.com", // Allow only frontend URL
        methods: "GET,POST,PUT,DELETE,OPTIONS",
        allowedHeaders: "Content-Type,Authorization",
    })
);

// Create HTTP server and integrate with WebSocket server
const server = http.createServer(index);
const wss = new WebSocket.Server({ server });

// Define a port number
const port = process.env.PORT || 3000;

// Middleware to handle JSON requests
index.use(express.json());

// Set up a simple Express route for HTTP requests (REST API)
index.use(PATHS.BASE, router);

// WebSocket handling
wss.on('connection', (ws) => {
    console.log('New WebSocket connection established');
    addClient(ws);
    // Listen for messages from the client
    ws.on('message', (message) => {
        message = message.toString();
        console.log('Received message: ', message);

        // Handle the message to fetch statuses and respond via WebSocket
        if (message === 'fetchAllStatus') {
            fetchAllStatusWS(ws);
        }
    });

    ws.on('close', () => {
        console.log('WebSocket connection closed');
    });
});

// Start the server
server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});