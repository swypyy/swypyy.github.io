---
layout: post
title: "Building Anonymous Chat with Node.js and Socket.IO"
date: 2026-11-11 10:30:00 +0530
description: "Learn how I built Anonymous Chat, a real-time chat app with Node.js, Express, and Socket.IO. Discover how temporary rooms, live messaging, and in-memory storage work."
tags: [Projects, Web Development, JavaScript]
categories: [Projects]
cover: /assets/blog/anonymous-chat-thumbnail.svg
cover_alt: "Purple graphic for Anonymous Chat showing a sample real-time chat room beside the title and Node.js and Socket.IO labels"
---

I built **Anonymous Chat** to make it easy to start a conversation without creating an account. Users can choose a name, create a temporary room, and invite others with a room code.

This project is a simple real-time chat app built with JavaScript and a lightweight backend. It is designed to help people connect quickly without sign-ups or a database-driven user system.

## What the app does

Anonymous Chat lets people:

- Create or join a room with a six-character code.
- Send and receive messages instantly.
- See who is in the room.
- Know when someone is typing.
- Share a room invite or copy the code.

The app does not save permanent chat history. Messages exist only while the room is active and the server is running.

## Tech used

The interface is built with **HTML, CSS, and JavaScript**. The backend uses **Node.js** and **Express**, while **Socket.IO** enables real-time communication between users.

## How it works

When a user creates a room, the server generates a code and keeps track of the room state in memory. It stores the room’s host, connected users, and recent messages.

When a message is sent, the server validates it and broadcasts it to everyone in that room. The app also sends updates when users join, leave, or start typing.

To keep the app lightweight, the backend stores message history in memory instead of a database. Each room keeps a limited number of messages, and the oldest ones are removed when the limit is reached.

## Why this approach

This setup keeps the project simple and fast. It removes the need for accounts, sign-in flows, and a full database. That makes it useful for short-lived conversations and experiments.

The trade-off is that room data is temporary. If the server restarts, active rooms disappear. The app also does not provide end-to-end encryption, so users should avoid sharing sensitive information in these rooms.

## What I learned

Building Anonymous Chat helped me understand:

- how real-time communication works in web apps,
- how to manage temporary rooms and user sessions,
- why input validation matters,
- and how to separate a static frontend from a backend service.

It was a great way to explore real-time messaging, event-driven architecture, and simple deployment patterns.

## Try it

- Live app: [https://swypyy.github.io/anonymous-chat/](https://swypyy.github.io/anonymous-chat/)
- GitHub: https://github.com/swypyy/Anonymous-Chat-repo/

Anonymous Chat is a lightweight experimental project for temporary conversations. It is useful for quick collaboration and idea-sharing, but it is not designed for permanent chat storage or secure private communication.
