
const templateGrid = document.getElementById("templateGrid");
const categoryButtons = document.querySelectorAll(".category");

function renderTemplates(category = "all") {
  const filtered = SWYP_TEMPLATES.filter(template =>
    category === "all" || template.category === category
  );

  templateGrid.replaceChildren();

  filtered.forEach(template => {
    const card = document.createElement("article");
    card.className = "template-card";

    const art = document.createElement("div");
    art.className = "template-art";

    const artInner = document.createElement("div");
    artInner.className = "template-art-inner";

    const label = document.createElement("small");
    label.textContent = "SWYP SITES";

    const title = document.createElement("strong");
    title.textContent = template.previewTitle;

    artInner.append(label, title);
    art.append(artInner);

    const info = document.createElement("div");
    info.className = "template-info";

    const heading = document.createElement("h3");
    heading.textContent = template.name;

    const description = document.createElement("p");
    description.textContent = template.description;

    const button = document.createElement("button");
    button.className = "template-action";
    button.textContent = "Customize template →";
    button.type = "button";

    button.addEventListener("click", () => {
      selectTemplate(template.id);
    });

    info.append(heading, description, button);
    card.append(art, info);
    templateGrid.append(card);
  });
}

function selectTemplate(templateId) {
  const selected = SWYP_TEMPLATES.find(
    template => template.id === templateId
  );

  if (!selected) return;

  localStorage.setItem(
    "swypSitesSelectedTemplate",
    selected.id
  );

  alert(
    selected.name + " selected!\n\n" +
    "The customization engine will be connected in the next milestone."
  );
}

categoryButtons.forEach(button => {
  button.addEventListener("click", () => {
    categoryButtons.forEach(item =>
      item.classList.remove("active")
    );

    button.classList.add("active");
    renderTemplates(button.dataset.category);
  });
});

const menuToggle = document.getElementById("menuToggle");
const navigation = document.getElementById("navigation");

menuToggle.addEventListener("click", () => {
  const isOpen = navigation.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

navigation.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    navigation.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

document.getElementById("year").textContent =
  new Date().getFullYear();

renderTemplates();
                   
