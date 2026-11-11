---
layout: post
title: "Building Anonymous Chat: Real-Time Conversations Without Accounts or a Database"
date: 2026-11-11 10:30:00 +0530
description: "A behind-the-scenes look at how I built Anonymous Chat with Node.js, Express, and Socket.IO, including temporary rooms, real-time messaging, room cleanup, and the decisions behind its lightweight architecture."
tags: [Projects, Web Development, JavaScript]
categories: [Projects]
---

What if people could create a chat room, invite others, and start talking immediately without creating accounts or going through a registration process?

That was the idea behind **Anonymous Chat**, a project I developed as part of Swypyy.

I wanted to build a simple, accessible messaging experience where users could create temporary chat rooms, choose their own display names, share room invitations, and communicate in real time.

Instead of building a traditional messaging platform with user accounts and a database, I chose a lightweight architecture using Node.js, Express, and Socket.IO.

Here's how the project works and some of the engineering decisions behind it.

## 1. The idea behind the project

Most conventional messaging applications require users to create accounts, remember passwords, and sometimes provide personal information before they can communicate.

For this project, I wanted to experiment with a different approach.

The basic idea was simple:

- No account registration.
- No email or password requirements.
- Temporary chat rooms.
- Custom display names.
- Shareable room invitations.
- Real-time messaging.
- Messages kept in server memory rather than a permanent database.

The objective was to make starting a conversation as straightforward as possible.

## 2. Technologies used

I selected technologies that could handle real-time communication without making the application unnecessarily complicated.

| Technology | Purpose |
| --- | --- |
| HTML | Application structure |
| CSS | Interface styling |
| JavaScript | Frontend interactions |
| Node.js | Backend runtime |
| Express.js | HTTP server and routes |
| Socket.IO | Real-time communication |

One of the most important choices was Socket.IO.

Unlike a traditional request-and-response approach, Socket.IO allows the browser and server to maintain a connection and exchange events in both directions.

That makes it suitable for features such as instant messages, participant updates, and typing indicators.

## 3. How the architecture works

The application has two main parts:

**Frontend:** The interface users interact with. It handles room creation, joining, displaying messages, and user interactions.

**Backend:** The Node.js server manages connections, room membership, message validation, and communication between participants.

The backend uses Express to create an HTTP server, and Socket.IO is attached to that same server.

The general communication flow looks like this:

```text
          USER A
             |
             v
       Chat Interface
             |
             | Socket.IO
             v
       Node.js Server
             |
       Room Management
             |
             v
       Temporary Room
             |
             | Socket.IO
             v
       Chat Interface
             |
             v
          USER B
```

When one participant sends a message, the backend receives it, validates it, and broadcasts it to the other participants in that room.

This allows messages to appear without repeatedly refreshing the page.

## 4. Creating a chat room

When a user creates a room, the frontend sends a `create-room` event to the server with the chosen display name.

The backend first validates the username.

It then generates a room code using Node.js's built-in cryptography module.

The room code is six characters long and uses hexadecimal characters.

The server creates a room object containing:

- The host's socket ID.
- A collection of connected users.
- A temporary message array.
- The room creation timestamp.

The room is stored inside a JavaScript `Map` called `rooms`.

A simplified representation looks like this:

```javascript
const rooms = new Map();

const room = {
    hostId: socket.id,
    users: new Map(),
    messages: [],
    createdAt: Date.now()
};

rooms.set(code, room);
```

This is one of the most important parts of the application.

The room exists in the server's memory while the server process is running. The backend does not need a database to manage these temporary sessions.

## 5. Joining an existing room

Other users can join by entering the room code.

The frontend sends a `join-room` event containing the room code and display name.

The server checks several things:

1. Is the username valid?
2. Is the room code in the correct format?
3. Does the room actually exist?
4. Has the room reached its maximum capacity?
5. Is the user already participating in another room?

If everything is valid, the server adds the participant to the room.

The new participant receives the current user list and the room's available message history.

Other participants receive a `user-joined` event.

This keeps everyone updated without requiring a page reload.

## 6. Real-time messaging with Socket.IO

Messaging is the central feature of Anonymous Chat.

When someone sends a message, the frontend emits a `send-message` event.

The backend checks that:

- The sender belongs to the room.
- The message is a valid string.
- The message is not empty.
- The message does not exceed 1,000 characters.
- The sender has not exceeded the message rate limit.

After validation, the server creates a message object.

Each message contains:

- A unique message ID.
- The message text.
- The sender's display name.
- The sender's socket ID.
- A creation timestamp.

The message is added to the room's temporary message array.

Socket.IO then broadcasts the `new-message` event to the other participants.

The sender receives a success response through the event callback, and the frontend displays the confirmed message.

This is how the application provides real-time messaging.

## 7. Temporary message storage

One of the main architectural decisions was avoiding a permanent database for chat messages.

The backend stores messages in an ordinary JavaScript array inside each room object.

There is also a limit of 100 messages per room.

When the limit is exceeded, the oldest message is removed.

```javascript
room.messages.push(message);

if (room.messages.length > MAX_ROOM_MESSAGES) {
    room.messages.shift();
}
```

This keeps the amount of message data in memory bounded for each room.

Because the application does not persist these messages to a database, they are not available as permanent chat history after the server process loses its in-memory state.

## 8. Typing indicators and participant updates

A chat application feels more interactive when users can see what is happening around them.

Anonymous Chat includes event handling for typing indicators and participant activity.

When someone starts or stops typing, the frontend can emit a `typing` event.

The backend forwards a `typing-update` event to the other users in that room.

The frontend uses these updates to display messages such as "Someone is typing..." and automatically clears stale typing indicators.

The application also handles events for:

- A participant joining.
- A participant leaving.
- A room being destroyed.

These events allow the interface to stay synchronized with the actual room state.

## 9. What happens when someone leaves?

Room cleanup is another important part of the backend.

There are two main situations.

**When an ordinary participant leaves:**

- Their socket is removed from the room's user collection.
- They leave the Socket.IO room.
- The remaining participants receive a `user-left` event.

**When the room host leaves:**

- The server announces that the session has ended.
- Connected participants are removed from the Socket.IO room.
- Their room-related socket state is cleared.
- The room is deleted from the server's `rooms` Map.

The backend also handles unexpected disconnections.

This is important because users can close a browser tab or lose their internet connection without pressing a Leave button.

## 10. Input validation and basic protections

Real-time applications need more than just a working message-sending feature.

I included several validation and resource-control measures in the backend.

| Protection | Implementation |
| --- | --- |
| Username validation | 1 to 24 characters |
| Message validation | 1 to 1,000 characters |
| Room capacity | Maximum 30 participants |
| Message rate control | Maximum 8 messages in 5 seconds per connection |
| Room code validation | Six hexadecimal characters |
| Message history limit | Maximum 100 messages per room |
| Socket.IO payload limit | 1 MB |

The backend also removes certain invisible characters from usernames, normalizes whitespace, and removes null characters from messages.

These checks help prevent invalid input and reduce simple forms of abuse.

They are basic safeguards, not a complete security or anti-abuse system.

## 11. The interface and sharing a room

I kept the frontend focused on the main actions: creating a room or joining one.

Users enter a display name to create a room, or enter a display name and room code to join an existing conversation.

Once inside a room, the interface provides:

- A conversation area with message bubbles and timestamps.
- A member list showing connected participants and the host.
- A typing indicator.
- A button to copy the room code.
- A Share button for sending an invitation.
- A Leave button to exit the session.

The Share button uses the browser's native sharing feature when available. If that is unavailable, the application falls back to copying the invitation text.

I also made the layout responsive so the chat interface can adapt to smaller screens. On mobile, the conversation takes priority and the member panel is hidden.

## 12. Hosting and deployment

The backend is designed to run as a Node.js service.

The project uses an npm start script:

```bash
npm install
npm start
```

By default, the server listens on port 3000.

For hosting environments such as Render, it reads the port from the environment:

```javascript
const PORT = process.env.PORT || 3000;
```

The backend also provides a `/health` endpoint that returns a small JSON response indicating that the service is online.

The Socket.IO configuration allows the Swypyy GitHub Pages origin:

```javascript
cors: {
    origin: 'https://swypyy.github.io',
    methods: ['GET', 'POST']
}
```

The frontend is hosted separately on GitHub Pages and connects to the backend service at `swypyy-messenger.onrender.com`.

This separation lets the static frontend and the real-time server be deployed independently.

## 13. What I learned from building it

Building Anonymous Chat was a useful opportunity to work with real-time application architecture.

Some of the main concepts I explored were:

- Creating and managing Socket.IO connections.
- Understanding event-based communication.
- Managing multiple users in temporary rooms.
- Handling unexpected disconnections.
- Validating user-generated input.
- Managing temporary data in server memory.
- Broadcasting events to specific groups of connected users.
- Building a responsive chat interface.
- Deploying a Node.js backend separately from a static frontend.

The room lifecycle was especially interesting because the application needs to keep track of users, messages, hosts, and connections without relying on a database.

## 14. Current limitations and future possibilities

The current implementation is intentionally lightweight, but there are areas that could be improved.

Possible future improvements include:

- More advanced abuse prevention and moderation.
- Better handling of host disconnections and room ownership.
- Improved monitoring and operational logging.
- Support for multiple backend instances with shared room state.
- More extensive automated tests.
- Additional accessibility and interface improvements.

Since room state is stored in memory, restarting the backend clears active rooms and their messages. Also, a single in-memory `Map` is not shared between multiple server instances.

The application does not provide end-to-end encryption, and temporary in-memory storage should not be treated as a guarantee of complete anonymity or confidentiality.

These are important trade-offs to consider if the application grows.

## 15. Final thoughts

Anonymous Chat started as an idea to make temporary conversations easier to start.

By combining HTML, CSS, JavaScript, Node.js, Express, and Socket.IO, I built a room-based messaging application that does not require traditional user accounts or a permanent message database.

The project helped me understand how real-time communication works behind the scenes, how servers manage multiple connected users, and why room lifecycle management matters.

It is one of the projects developed under **Swypyy**, where I experiment with building practical web applications and learning through real implementation.

**Explore the project:**

- Live application: https://swypyy.github.io/anonymous-chat.html
- GitHub repository: https://github.com/swypyy/Anonymous-Chat-repo

---

*Anonymous Chat is a lightweight experimental messaging project. Messages are held in server memory while a room is active and are not end-to-end encrypted. Avoid sharing passwords, contact details, or sensitive personal information in temporary rooms.*
