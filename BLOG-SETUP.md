# Swypyy Blog: installation

This package adds a Jekyll-powered blog at `https://swypyy.github.io/blog/`.
It is designed for the existing `swypyy/swypyy.github.io` repository.

## 1. Upload the files

Extract this ZIP and upload/merge its contents into the **root** of the existing
`swypyy/swypyy.github.io` repository. Keep the folder structure exactly as shown.
Do not delete or replace your existing `index.html`, `anonymous-chat.html`,
`anonymous-drop.html`, `assets/logo.png`, or other existing files.

The package adds:

- `_config.yml`
- `_layouts/default.html` and `_layouts/post.html`
- `_posts/2026-11-07-welcome-to-the-swypyy-blog.md`
- `blog/index.html`
- `assets/blog.css` and `assets/blog.js`

The favicon references your existing `assets/s-logo.png`.

## 2. Confirm GitHub Pages

In the repository, open **Settings → Pages**. The publishing source should be
`Deploy from a branch`, using `main` and `/ (root)`, if that is how the site is
currently configured. Do not change a working custom publishing workflow.

GitHub Pages builds Jekyll automatically for branch-based publishing. If the
repository uses a custom GitHub Actions Pages workflow, make sure that workflow
runs a Jekyll build and deploys the generated `_site` directory.

## 3. Publish

Commit the added files to `main`. Wait for the Pages deployment to finish, then
open:

`https://swypyy.github.io/blog/`

A first build can take a few minutes. Check the repository's **Actions** tab
if the page does not appear.

## 4. Add a new article

Create a Markdown file inside `_posts/` using this exact filename pattern:

`YYYY-MM-DD-your-post-title.md`

Example:

`2026-11-12-my-first-update.md`

Start the file with front matter:

```yaml
---
layout: post
title: "My First Update"
date: 2026-11-12 18:00:00 +0530
description: "A short summary shown on the blog homepage."
tags: [Updates, Swypyy]
categories: [News]
---

Write your article here using Markdown.

## A heading

A paragraph, a list, **bold text**, links, and images are supported.
```

Commit the new file. Jekyll automatically adds it to the blog homepage and
creates its article page. Use a unique filename for every post.

## 5. Optional: add Blog to the main homepage navigation

The blog works at `/blog/` without changing the existing homepage. To add a
navigation link later, add this inside the desktop navigation in `index.html`:

```html
<a href="blog/" class="text-sm font-semibold text-gray-300 hover:text-brand-glow transition-colors">Blog</a>
```

Add a matching link inside the mobile menu:

```html
<a href="blog/" class="mobile-nav-link text-xl font-bold text-white hover:text-brand-glow">Blog</a>
```

Do not replace the entire homepage just to add these links.

## Notes

- This is a public static blog. Do not publish private information.
- There is no admin dashboard or visitor comment system. Posts are published
  by adding Markdown files to the GitHub repository.
- The package intentionally does not modify the existing homepage or chat pages.


## Design update
The blog layout now reuses the Swypyy homepage header, mobile navigation, logo fallback, font setup, and footer wording/year behavior. Blog content uses the homepage palette: #07060b, #120f1d, #1c172e, #7c3aed, #a78bfa, and #c084fc. The existing homepage and app HTML files are not replaced.
