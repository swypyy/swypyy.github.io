---
layout: post
title: "Building Anonymous Drop: An Anonymous Posting App"
date: 2026-11-11 10:30:00 +0530
description: "A look at how I built Anonymous Drop, a community posting app with anonymous posts, comments, and a JavaScript API backed by PostgreSQL."
tags: [Projects, Web Development, JavaScript]
categories: [Projects]
cover: /assets/blog/anonymous-drop-thumbnail.svg
cover_alt: "Purple Anonymous Drop illustration showing a public post card and comment bubbles"
---

I built **Anonymous Drop** as a simple place for people to share thoughts and join conversations without needing to create an account. Visitors can publish a post, read what others have shared, and leave comments.

## What you can do

- Publish a post with a title and message.
- Add an optional display name or post anonymously.
- Browse the latest posts and open a post to read it.
- Leave comments and read replies.

Posts and comments are public. The site warns that posts cannot be edited or deleted by their author, so it’s important to review what you write before publishing. Avoid sharing private or sensitive information.

## How I built it

The web page is hosted on GitHub Pages. Its JavaScript frontend sends requests to a backend built with **Node.js** and **Express**. The API handles creating and retrieving posts and comments. **PostgreSQL** stores the content so it can be loaded again later.

When a visitor opens Anonymous Drop, the page requests the latest posts from the API. Selecting a post shows its details and comments. Publishing a post or comment sends the content to the backend, which validates it before saving it.

## What I learned

Building Anonymous Drop helped me practice connecting a browser-based interface to an API, handling user-submitted content, and saving data in a relational database. It also showed me why clear privacy expectations matter for a public community site.

## Try Anonymous Drop

- **Live app:** https://swypyy.github.io/anonymous-drop/
- **Source code:** https://github.com/swypyy/Anonymous-Drop-repo

Anonymous Drop is a community experiment for sharing ideas and perspectives. Posts and comments are public, and the project is not intended for confidential communication.
