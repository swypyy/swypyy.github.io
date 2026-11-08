
(() => {
    'use strict';

    const search = document.getElementById('postSearch');
    const searchForm = document.getElementById('journalSearchForm');

    const featuredGrid = document.getElementById('featuredGrid');
    const latestSection = document.getElementById('latest');
    const postGrid = document.getElementById('postGrid');

    const categoryBar = document.getElementById('categoryBar');
    const pagination = document.getElementById('postPagination');

    const emptyState = document.getElementById('emptyState');
    const featuredEmptyState = document.getElementById('featuredEmptyState');
    const resultCount = document.getElementById('resultCount');

    const pageSize = 6;

    if (!postGrid) return;

    const featuredCards = featuredGrid
        ? Array.from(featuredGrid.querySelectorAll('.featured-card'))
        : [];

    const latestCards = Array.from(
        postGrid.querySelectorAll('.post-row')
    );

    const allCards = [...featuredCards, ...latestCards];

    let activeCategory = 'all';
    let currentPage = 1;

    // Normalize text consistently.
    function normalize(value) {
        return String(value || '')
            .trim()
            .toLocaleLowerCase();
    }

    function getCategories(card) {
        return (card.dataset.categories || '')
            .split(',')
            .map(normalize)
            .filter(Boolean);
    }

    // Add categories found in posts that aren't already listed.
    function setupCategories() {
        if (!categoryBar) return;

        const categories = new Set();

        allCards.forEach(card => {
            getCategories(card).forEach(category => {
                categories.add(category);
            });
        });

        const existingCategories = Array.from(
            categoryBar.querySelectorAll('[data-category]')
        ).map(button => normalize(button.dataset.category));

        categories.forEach(category => {
            if (existingCategories.includes(category)) return;

            const button = document.createElement('button');

            button.type = 'button';
            button.className = 'category-chip';
            button.dataset.category = category;
            button.textContent = category
                .replace(/[-_]+/g, ' ')
                .replace(/\b\w/g, char => char.toUpperCase());

            button.setAttribute('aria-pressed', 'false');

            categoryBar.appendChild(button);
        });
    }

    // Restore search from the URL.
    if (search) {
        const params = new URLSearchParams(window.location.search);
        search.value = params.get('q') || '';
    }

    function matchesSearch(card) {
        const query = normalize(search ? search.value : '');

        if (!query) return true;

        const searchableText = normalize(card.dataset.search);

        return searchableText.includes(query);
    }

    function matchesCategory(card) {
        if (activeCategory === 'all') return true;

        return getCategories(card).includes(activeCategory);
    }

    function matches(card) {
        return matchesSearch(card) && matchesCategory(card);
    }

    function createPageButton(label, page, className, ariaLabel) {
        const button = document.createElement('button');

        button.type = 'button';
        button.className = `page-control ${className || ''}`.trim();
        button.textContent = label;
        button.setAttribute('aria-label', ariaLabel || label);

        if (className.includes('page-number') && page === currentPage) {
            button.classList.add('is-current');
            button.setAttribute('aria-current', 'page');
        }

        button.addEventListener('click', () => {
            if (page === currentPage) return;

            currentPage = page;
            render();

            latestSection?.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        });

        pagination.appendChild(button);
    }

    function renderPagination(totalPages) {
        if (!pagination) return;

        pagination.replaceChildren();

        if (totalPages <= 1) {
            pagination.hidden = true;
            return;
        }

        pagination.hidden = false;

        // First and Previous.
        if (currentPage > 1) {
            createPageButton(
                'First',
                1,
                'page-edge',
                'Go to first page'
            );

            createPageButton(
                'Prev',
                currentPage - 1,
                'page-edge',
                'Go to previous page'
            );
        }

        // Numbered pages.
        let pages = [];

        if (totalPages <= 5) {
            pages = Array.from(
                { length: totalPages },
                (_, index) => index + 1
            );
        } else if (currentPage <= 3) {
            pages = [1, 2, 3, 4, 'ellipsis', totalPages];
        } else if (currentPage >= totalPages - 2) {
            pages = [
                1,
                'ellipsis',
                totalPages - 3,
                totalPages - 2,
                totalPages - 1,
                totalPages
            ];
        } else {
            pages = [
                1,
                'ellipsis',
                currentPage - 1,
                currentPage,
                currentPage + 1,
                'ellipsis',
                totalPages
            ];
        }

        pages.forEach(page => {
            if (page === 'ellipsis') {
                const span = document.createElement('span');

                span.className = 'page-ellipsis';
                span.textContent = '…';

                pagination.appendChild(span);
                return;
            }

            createPageButton(
                String(page),
                page,
                'page-number',
                `Go to page ${page}`
            );
        });

        // Next and Last.
        if (currentPage < totalPages) {
            createPageButton(
                'Next',
                currentPage + 1,
                'page-edge',
                'Go to next page'
            );

            createPageButton(
                'Last',
                totalPages,
                'page-edge',
                'Go to last page'
            );
        }
    }

    function updateSearchURL() {
        if (!search) return;

        const url = new URL(window.location.href);
        const value = search.value.trim();

        if (value) {
            url.searchParams.set('q', value);
        } else {
            url.searchParams.delete('q');
        }

        window.history.replaceState({}, '', url);
    }

    function render() {
        // Featured posts are independent of latest pagination.
        const matchingFeatured = featuredCards.filter(matches);

        featuredCards.forEach(card => {
            card.hidden = !matches(card);
        });

        if (featuredEmptyState) {
            featuredEmptyState.hidden = matchingFeatured.length > 0;
        }

        // Filter the latest posts.
        const matchingLatest = latestCards.filter(matches);

        const totalPages = Math.max(
            1,
            Math.ceil(matchingLatest.length / pageSize)
        );

        // Keep the current page valid after filtering.
        currentPage = Math.min(currentPage, totalPages);

        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;

        const visibleLatest = new Set(
            matchingLatest.slice(startIndex, endIndex)
        );

        latestCards.forEach(card => {
            card.hidden = !visibleLatest.has(card);
        });

        // Show the main empty state only when neither section has results.
        const totalMatches =
            matchingFeatured.length + matchingLatest.length;

        if (emptyState) {
            emptyState.hidden = totalMatches > 0;
        }

        // Update result count.
        if (resultCount) {
            resultCount.textContent =
                `${matchingLatest.length} ${
                    matchingLatest.length === 1 ? 'POST' : 'POSTS'
                }`;
        }

        // Update pagination.
        renderPagination(totalPages);
    }

    // Live search.
    if (search) {
        search.addEventListener('input', () => {
            currentPage = 1;
            render();
            updateSearchURL();
        });
    }

    // Search form submission.
    if (searchForm) {
        searchForm.addEventListener('submit', event => {
            event.preventDefault();

            currentPage = 1;
            render();
            updateSearchURL();

            latestSection?.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        });
    }

    // Category selection.
    if (categoryBar) {
        categoryBar.addEventListener('click', event => {
            const button = event.target.closest('[data-category]');

            if (!button || !categoryBar.contains(button)) return;

            activeCategory = normalize(button.dataset.category);

            categoryBar.querySelectorAll('[data-category]').forEach(chip => {
                const selected = chip === button;

                chip.classList.toggle('is-active', selected);
                chip.setAttribute('aria-pressed', String(selected));
            });

            currentPage = 1;
            render();
        });
    }

    // Press "/" to focus search, unless the user is typing elsewhere.
    document.addEventListener('keydown', event => {
        if (event.key !== '/' || !search) return;

        const target = event.target;

        const isTyping = target instanceof HTMLElement && (
            target.isContentEditable ||
            ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
        );

        if (isTyping || event.ctrlKey || event.metaKey || event.altKey) {
            return;
        }

        event.preventDefault();
        search.focus();
    });

    // Initialize.
    setupCategories();
    render();

})();
