/* =========================================
   SWYPYY LEARN
   Main JavaScript
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {

    // =====================================
    // INITIALIZE LUCIDE ICONS
    // =====================================

    function initializeIcons() {
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    initializeIcons();


    // =====================================
    // CURRENT YEAR
    // =====================================

    const yearElement = document.getElementById("current-year");

    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }


    // =====================================
    // MOBILE NAVIGATION
    // =====================================

    const menuToggle = document.getElementById("mobile-menu-toggle");
    const navLinks = document.getElementById("nav-links");

    function closeMenu() {
        if (!menuToggle || !navLinks) return;

        navLinks.classList.remove("active");

        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open navigation menu");

        menuToggle.innerHTML = '<i data-lucide="menu"></i>';

        initializeIcons();
    }

    function toggleMenu() {
        if (!menuToggle || !navLinks) return;

        const isOpen = navLinks.classList.toggle("active");

        menuToggle.setAttribute("aria-expanded", String(isOpen));

        menuToggle.setAttribute(
            "aria-label",
            isOpen ? "Close navigation menu" : "Open navigation menu"
        );

        menuToggle.innerHTML = isOpen
            ? '<i data-lucide="x"></i>'
            : '<i data-lucide="menu"></i>';

        initializeIcons();
    }

    if (menuToggle && navLinks) {

        menuToggle.addEventListener("click", toggleMenu);

        // Close navigation after selecting a link.

        navLinks.querySelectorAll("a").forEach(link => {

            link.addEventListener("click", closeMenu);

        });

        // Close navigation when clicking outside it.

        document.addEventListener("click", event => {

            const clickedInsideMenu = navLinks.contains(event.target);
            const clickedToggle = menuToggle.contains(event.target);

            if (!clickedInsideMenu && !clickedToggle) {
                closeMenu();
            }

        });

        // Close navigation using Escape.

        document.addEventListener("keydown", event => {

            if (event.key === "Escape") {
                closeMenu();
            }

        });

        // Close navigation when switching to desktop layout.

        window.addEventListener("resize", () => {

            if (window.innerWidth > 700) {
                closeMenu();
            }

        });

    }


    // =====================================
    // LOGIN BUTTON
    // =====================================

    const loginButton = document.getElementById("login-button");

    if (loginButton) {

        loginButton.addEventListener("click", event => {

            event.preventDefault();

            showNotice(
                "Student accounts are coming soon!",
                "You can currently explore the learning platform as a guest. Account registration and cloud progress saving will be added in a future update."
            );

        });

    }


    // =====================================
    // SIMPLE NOTICE
    // =====================================

    function showNotice(title, message) {

        // Remove an existing notice.

        const existingNotice = document.querySelector(".learn-notice");

        if (existingNotice) {
            existingNotice.remove();
        }

        const notice = document.createElement("div");

        notice.className = "learn-notice";

        notice.setAttribute("role", "dialog");
        notice.setAttribute("aria-modal", "true");
        notice.setAttribute("aria-labelledby", "notice-title");

        notice.innerHTML = `
            <div class="notice-backdrop"></div>

            <div class="notice-box">

                <div class="notice-icon">
                    <i data-lucide="info"></i>
                </div>

                <h3 id="notice-title"></h3>

                <p class="notice-message"></p>

                <button class="btn btn-primary notice-close">
                    Got it
                </button>

            </div>
        `;

        // Add text safely.

        notice.querySelector("#notice-title").textContent = title;

        notice.querySelector(".notice-message").textContent = message;

        document.body.appendChild(notice);

        initializeIcons();

        // Close handlers.

        const closeButton = notice.querySelector(".notice-close");
        const backdrop = notice.querySelector(".notice-backdrop");

        function closeNotice() {
            notice.remove();
        }

        closeButton.addEventListener("click", closeNotice);
        backdrop.addEventListener("click", closeNotice);

        // Close using Escape.

        function handleEscape(event) {

            if (event.key === "Escape") {

                closeNotice();

                document.removeEventListener("keydown", handleEscape);

            }

        }

        document.addEventListener("keydown", handleEscape);

        closeButton.focus();

    }


    // =====================================
    // SMOOTH ANCHOR NAVIGATION
    // =====================================

    document.querySelectorAll('a[href^="#"]').forEach(link => {

        link.addEventListener("click", event => {

            const targetId = link.getAttribute("href");

            if (!targetId || targetId === "#") return;

            const target = document.querySelector(targetId);

            if (!target) return;

            event.preventDefault();

            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

            // Update URL without jumping.

            history.replaceState(null, "", targetId);

        });

    });


    // =====================================
    // CONSOLE MESSAGE
    // =====================================

    console.log(
        "%cSwypyy Learn",
        "color:#a78bfa;font-size:22px;font-weight:bold;"
    );

    console.log(
        "%cLearn freely. Build confidently.",
        "color:#c084fc;font-size:12px;"
    );

});
