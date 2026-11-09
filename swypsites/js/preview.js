function escapePreviewText(value) {
  return String(value ?? "").replace(/[&<>"']/g, function (character) {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };

    return entities[character];
  });
}

function updateWebsitePreview(template, answers) {
  const frame = document.getElementById("website-preview");

  if (!frame || !template) return;

  const siteName = escapePreviewText(answers.siteName || "Your Website");
  const headline = escapePreviewText(answers.headline || "Your headline goes here");
  const description = escapePreviewText(
    answers.description || "Your website description will appear here."
  );
  const contact = escapePreviewText(answers.contact || "hello@example.com");

  const accent = /^#[0-9a-fA-F]{6}$/.test(answers.accent)
    ? answers.accent
    : "#8b5cf6";

  const isRestaurant = template.category === "restaurant";
  const buttonText = isRestaurant ? "Contact Us" : "Get in Touch";

  const documentHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * { box-sizing: border-box; }
        body {
          margin: 0;
          font-family: Arial, sans-serif;
          color: #222;
          background: #fff;
        }
        header {
          padding: 22px 7%;
          border-bottom: 1px solid #eee;
          font-weight: bold;
          font-size: 18px;
        }
        .hero {
          min-height: 330px;
          padding: 65px 8%;
          background: #f7f5fb;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .tag {
          color: ${accent};
          font-size: 12px;
          font-weight: bold;
          letter-spacing: 2px;
          text-transform: uppercase;
        }
        h1 {
          font-size: clamp(30px, 7vw, 48px);
          max-width: 600px;
          margin: 15px 0;
          line-height: 1.1;
        }
        .description {
          max-width: 540px;
          line-height: 1.7;
          color: #666;
        }
        .button {
          display: inline-block;
          width: fit-content;
          margin-top: 18px;
          padding: 13px 20px;
          background: ${accent};
          color: white;
          border-radius: 6px;
          font-size: 14px;
          font-weight: bold;
        }
        .about {
          padding: 35px 8%;
        }
        .about h2 { font-size: 24px; }
        .about p { color: #666; line-height: 1.7; }
        footer {
          padding: 22px 8%;
          background: #171421;
          color: white;
          font-size: 13px;
        }
      </style>
    </head>
    <body>
      <header>${siteName}</header>
      <main>
        <section class="hero">
          <span class="tag">${isRestaurant ? "WELCOME" : "WELCOME TO MY WEBSITE"}</span>
          <h1>${headline}</h1>
          <p class="description">${description}</p>
          <span class="button">${buttonText}</span>
        </section>
        <section class="about">
          <h2>About ${siteName}</h2>
          <p>${description}</p>
        </section>
      </main>
      <footer>Contact: ${contact}</footer>
    </body>
    </html>
  `;

  frame.srcdoc = documentHTML;
            }
