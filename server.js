// server.js

const express = require('express');
const WebSocket = require('ws');
const SocketServer = require('ws').Server;
const uuidv1 = require('uuid/v1');
var randomColor = require('randomcolor');

// Set the port to 3001
const PORT = 3001;

// Create a new express server
const server = express()
  // Make the express server serve static assets (html, javascript, css) from the /public folder
  .use(express.static('public'))
  .listen(PORT, '0.0.0.0', 'localhost', () => console.log(`Listening on ${ PORT }`));

// Create the WebSockets server
const wss = new SocketServer({ server });

// Set up a callback that will run when a client connects to the server
// When a client connects they are assigned a socket, represented by
// the ws parameter in the callback.
wss.on('connection', (ws) => {  
  //general function for all broadcasts
  wss.broadcast = function broadcast(data) {
    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  };

  //whenever someone connects to client, assign them a color and send back # of connected users
  wss.clients.forEach(function each(client) {
    let color_and_users = {loggedIn: wss.clients.size, color: randomColor()};
    wss.broadcast(JSON.stringify(color_and_users));
  });

  //handle assembly of objects for incoming messages or username changes
  ws.on('message', function incoming(data) {
    let new_data = Object.assign({}, JSON.parse(data));
    new_data.id = uuidv1();
    new_data.type.includes("Message") ? new_data.type = "incomingMessage" : new_data.type = "incomingNotification";
    wss.broadcast(JSON.stringify(new_data));
  });

  // Set up a callback for when a client closes the socket. This usually means they closed their browser.  Send back # of now connected users.
  ws.on('close', function() {
    console.log('Client disconnected');
    wss.broadcast(wss.clients.size);
  });
});