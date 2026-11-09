const grid = document.getElementById("template-grid");
const editor = document.getElementById("editor");
const templatesSection = document.getElementById("templates");
const questionFields = document.getElementById("question-fields");
const customizationForm = document.getElementById("customization-form");

let selectedTemplate = null;
let currentAnswers = {};

const STORAGE_KEY = "swypSitesProjects";

function loadProjects() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveAnswers() {
  if (!selectedTemplate) return;

  const projects = loadProjects();
  projects[selectedTemplate.id] = currentAnswers;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (error) {
    console.warn("Could not save project:", error);
  }
}

function renderTemplates(category = "all") {
  grid.textContent = "";

  const filtered = SWYP_TEMPLATES.filter(template =>
    category === "all" || template.category === category
  );

  filtered.forEach(template => {
    const card = document.createElement("article");
    card.className = "template-card";

    const preview = document.createElement("div");
    preview.className = "template-preview";
    preview.textContent = template.previewTitle;

    const info = document.createElement("div");
    info.className = "template-info";

    const title = document.createElement("h3");
    title.textContent = template.name;

    const description = document.createElement("p");
    description.textContent = template.description;

    const button = document.createElement("button");
    button.className = "primary-button";
    button.type = "button";
    button.textContent = "Use Template";
    button.addEventListener("click", () => openEditor(template));

    info.append(title, description, button);
    card.append(preview, info);
    grid.append(card);
  });
}

function openEditor(template) {
  selectedTemplate = template;

  const projects = loadProjects();
  const savedAnswers = projects[template.id] || {};

  currentAnswers = {};

  const questions = SWYP_QUESTIONS[template.category] || [];

  questions.forEach(question => {
    currentAnswers[question.name] =
      savedAnswers[question.name] ?? question.defaultValue;
  });

  document.getElementById("editor-title").textContent =
    `Customize ${template.name}`;

  renderQuestions();

  templatesSection.classList.add("hidden");
  document.querySelector(".hero").classList.add("hidden");
  document.querySelector(".steps-section").classList.add("hidden");
  document.querySelector(".about-section").classList.add("hidden");
  editor.classList.remove("hidden");

  updateWebsitePreview(template, currentAnswers);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderQuestions() {
  questionFields.textContent = "";

  const questions = SWYP_QUESTIONS[selectedTemplate.category] || [];

  questions.forEach(question => {
    const group = document.createElement("div");
    group.className = "form-group";

    const label = document.createElement("label");
    label.textContent = question.label;
    label.htmlFor = `field-${question.name}`;

    let field;

    if (question.type === "textarea") {
      field = document.createElement("textarea");
      field.rows = 4;
    } else {
      field = document.createElement("input");
      field.type = question.type;
    }

    field.id = `field-${question.name}`;
    field.name = question.name;
    field.placeholder = question.placeholder || "";
    field.value = currentAnswers[question.name] ?? "";

    if (question.type === "color") {
      field.className = "color-input";
    }

    field.addEventListener("input", () => {
      currentAnswers[question.name] = field.value;
      saveAnswers();
      updateWebsitePreview(selectedTemplate, currentAnswers);
    });

    group.append(label, field);
    questionFields.append(group);
  });
}

document.querySelectorAll(".filter-btn").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach(item =>
      item.classList.remove("active")
    );

    button.classList.add("active");
    renderTemplates(button.dataset.category);
  });
});

document.getElementById("back-to-templates").addEventListener("click", () => {
  editor.classList.add("hidden");
  templatesSection.classList.remove("hidden");
  document.querySelector(".hero").classList.remove("hidden");
  document.querySelector(".steps-section").classList.remove("hidden");
  document.querySelector(".about-section").classList.remove("hidden");

  window.scrollTo({ top: templatesSection.offsetTop - 70, behavior: "smooth" });
});

document.getElementById("reset-answers").addEventListener("click", () => {
  if (!selectedTemplate) return;

  const projects = loadProjects();
  delete projects[selectedTemplate.id];

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (error) {
    console.warn("Could not reset project:", error);
  }

  currentAnswers = {};

  (SWYP_QUESTIONS[selectedTemplate.category] || []).forEach(question => {
    currentAnswers[question.name] = question.defaultValue;
  });

  renderQuestions();
  updateWebsitePreview(selectedTemplate, currentAnswers);
});

document.getElementById("menu-toggle").addEventListener("click", () => {
  const nav = document.getElementById("nav-links");
  const isOpen = nav.classList.toggle("open");

  document.getElementById("menu-toggle")
    .setAttribute("aria-expanded", String(isOpen));
});

document.querySelectorAll(".nav-link, .nav-cta").forEach(link => {
  link.addEventListener("click", () => {
    document.getElementById("nav-links").classList.remove("open");
    document.getElementById("menu-toggle")
      .setAttribute("aria-expanded", "false");
  });
});

document.getElementById("home-link").addEventListener("click", event => {
  event.preventDefault();

  editor.classList.add("hidden");
  templatesSection.classList.remove("hidden");
  document.querySelector(".hero").classList.remove("hidden");
  document.querySelector(".steps-section").classList.remove("hidden");
  document.querySelector(".about-section").classList.remove("hidden");

  window.scrollTo({ top: 0, behavior: "smooth" });
});

document.getElementById("year").textContent = new Date().getFullYear();

renderTemplates();
