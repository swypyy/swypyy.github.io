
(() => {
    const search = document.getElementById('postSearch');
    const searchForm = document.getElementById('journalSearchForm');

    const featuredGrid = document.getElementById('featuredGrid');
    const grid = document.getElementById('postGrid');

    const empty = document.getElementById('emptyState');
    const categoryBar = document.getElementById('categoryBar');
    const pagination = document.getElementById('postPagination');
    const resultCount = document.getElementById('resultCount');

    const pageSize = 6;

    if (!grid) return;

    const latestCards = Array.from(
        grid.querySelectorAll('.post-row')
    );

    const featuredCards = featuredGrid
        ? Array.from(featuredGrid.querySelectorAll('.featured-card'))
        : [];

    const allCards = [...featuredCards, ...latestCards];

    // Discover categories used in posts.
    const categories = new Set();

    allCards.forEach(card => {
        (card.dataset.categories || '')
            .split(',')
            .map(value => value.trim())
            .filter(Boolean)
            .forEach(value => categories.add(value));
    });

    const titleCase = value => value
        .replace(/[-_]+/g, ' ')
        .replace(/\b\w/g, char => char.toUpperCase());

    // Add custom categories found in posts.
    if (categoryBar) {
        [...categories].sort().forEach(category => {

            if (
                categoryBar.querySelector(
                    `[data-category="${CSS.escape(category)}"]`
                )
            ) {
                return;
            }

            const button = document.createElement('button');

            button.type = 'button';
            button.className = 'category-chip';
            button.dataset.category = category;
            button.textContent = titleCase(category);
            button.setAttribute('aria-pressed', 'false');

            categoryBar.appendChild(button);
        });
    }

    let activeCategory = 'all';
    let currentPage = 1;

    const params = new URLSearchParams(window.location.search);

    if (search) {
        search.value = params.get('q') || '';
    }

    function matches(card) {

        const query = (
            search ? search.value : ''
        ).trim().toLocaleLowerCase();

        const textMatch = !query ||
            (card.dataset.search || '')
                .toLocaleLowerCase()
                .includes(query);

        const cardCategories = (
            card.dataset.categories || ''
        )
            .split(',')
            .map(value => value.trim());

        const categoryMatch =
            activeCategory === 'all' ||
            cardCategories.includes(activeCategory);

        return textMatch && categoryMatch;
    }

    function addPageButton(
        label,
        page,
        className = '',
        ariaLabel = label
    ) {

        const button = document.createElement('button');

        button.type = 'button';
        button.className = `page-control ${className}`.trim();
        button.textContent = label;
        button.setAttribute('aria-label', ariaLabel);

        if (
            page === currentPage &&
            className.includes('page-number')
        ) {
            button.setAttribute('aria-current', 'page');
        }

        button.addEventListener('click', () => {

            currentPage = page;
            render();

            document.getElementById('latest')?.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });

        });

        pagination.appendChild(button);
    }

    function renderPagination(totalPages) {

        if (!pagination) return;

        pagination.replaceChildren();

        if (totalPages <= 1) return;

        // First and previous only after page one.
        if (currentPage > 1) {

            addPageButton(
                'First',
                1,
                'page-edge',
                'First page'
            );

            addPageButton(
                'Prev',
                currentPage - 1,
                'page-edge',
                'Previous page'
            );

        }

        let pages;

        if (totalPages <= 5) {

            pages = Array.from(
                { length: totalPages },
                (_, index) => index + 1
            );

        } else if (currentPage <= 3) {

            pages = [1, 2, 3, 4, '…', totalPages];

        } else if (currentPage >= totalPages - 2) {

            pages = [
                1,
                '…',
                totalPages - 3,
                totalPages - 2,
                totalPages - 1,
                totalPages
            ];

        } else {

            pages = [
                1,
                '…',
                currentPage - 1,
                currentPage,
                currentPage + 1,
                '…',
                totalPages
            ];

        }

        pages.forEach(page => {

            if (page === '…') {

                const span = document.createElement('span');

                span.className = 'page-ellipsis';
                span.textContent = '…';

                pagination.appendChild(span);

            } else {

                addPageButton(
                    String(page),
                    page,
                    `page-number${page === currentPage ? ' is-current' : ''}`,
                    `Page ${page}`
                );

            }

        });

        // Next and last only before the final page.
        if (currentPage < totalPages) {

            addPageButton(
                'Next',
                currentPage + 1,
                'page-edge',
                'Next page'
            );

            addPageButton(
                'Last',
                totalPages,
                'page-edge',
                'Last page'
            );

        }

    }

    function render() {

        const visibleFeatured = featuredCards.filter(matches);

        featuredCards.forEach(card => {
            card.hidden = !matches(card);
        });

        const filteredLatest = latestCards.filter(matches);

        const totalPages = Math.max(
            1,
            Math.ceil(filteredLatest.length / pageSize)
        );

        currentPage = Math.min(currentPage, totalPages);

        const start = (currentPage - 1) * pageSize;

        const visibleOnPage = new Set(
            filteredLatest.slice(start, start + pageSize)
        );

        latestCards.forEach(card => {
            card.hidden = !visibleOnPage.has(card);
        });

        const totalVisible =
            visibleFeatured.length + filteredLatest.length;

        if (empty) {
            empty.hidden = totalVisible !== 0;
        }

        if (pagination) {
            pagination.hidden = filteredLatest.length <= pageSize;
        }

        if (resultCount) {
            resultCount.textContent =
                `${filteredLatest.length} ${
                    filteredLatest.length === 1 ? 'POST' : 'POSTS'
                }`;
        }

        renderPagination(totalPages);
    }

    // Live search.
    if (search) {

        search.addEventListener('input', () => {

            currentPage = 1;
            render();

            const url = new URL(window.location.href);

            if (search.value.trim()) {
                url.searchParams.set('q', search.value.trim());
            } else {
                url.searchParams.delete('q');
            }

            window.history.replaceState({}, '', url);

        });

    }

    if (searchForm) {

        searchForm.addEventListener('submit', event => {

            event.preventDefault();

            currentPage = 1;
            render();

            document.getElementById('latest')?.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });

        });

    }

    // Category filters.
    if (categoryBar) {

        categoryBar.addEventListener('click', event => {

            const button = event.target.closest('[data-category]');

            if (!button) return;

            activeCategory = button.dataset.category;

            categoryBar.querySelectorAll('.category-chip')
                .forEach(chip => {

                    const selected = chip === button;

                    chip.classList.toggle('is-active', selected);

                    chip.setAttribute(
                        'aria-pressed',
                        String(selected)
                    );

                });

            currentPage = 1;
            render();

        });

    }

    // "/" keyboard shortcut focuses search.
    document.addEventListener('keydown', event => {

        const target = event.target;

        const isTyping = target && (
            target.isContentEditable ||
            ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
        );

        if (event.key === '/' && !isTyping && search) {

            event.preventDefault();
            search.focus();

        }

    });

    render();

})();
