(() => {
    'use strict';

    const search = document.getElementById('postSearch');
    const searchForm = document.getElementById('journalSearchForm');
    const categoryBar = document.getElementById('categoryBar');
    const postGrid = document.getElementById('postGrid');
    const pagination = document.getElementById('postPagination');
    const emptyState = document.getElementById('emptyState');

    // Keep this in sync with the number of posts shown on the first page.
    const pageSize = 20;

    if (!postGrid) return;

    const cards = Array.from(postGrid.querySelectorAll('.post-card'));
    const latestPosts = new Set(cards.slice(0, pageSize));
    const activeFilters = new Set();
    let currentPage = 1;

    const normalize = value => String(value || '').trim().toLocaleLowerCase();

    if (search) {
        const params = new URLSearchParams(window.location.search);
        search.value = params.get('q') || '';
    }

    function matchesFilter(card, filter) {
        if (filter === 'latest') return latestPosts.has(card);
        if (filter === 'featured') return card.dataset.featured === 'true';

        const categories = (card.dataset.categories || '').split(',').map(normalize);
        if (filter === 'announcements') return categories.includes('announcements');
        if (filter === 'creations') {
            return categories.some(category =>
                ['creations', 'creation', 'projects', 'project'].includes(category)
            );
        }

        return true;
    }

    function matchesAllSelectedFilters(card) {
        // Selected non-All filters are combined as AND: the post must satisfy
        // every selected filter (for example, both Latest and Creations).
        for (const filter of activeFilters) {
            if (!matchesFilter(card, filter)) return false;
        }
        return true;
    }

    function createPageButton(label, page, edge = false) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `page-control${edge ? ' page-edge' : ' page-number'}`;
        button.textContent = label;
        button.setAttribute('aria-label', edge ? `${label} page` : `Go to page ${page}`);

        if (!edge && page === currentPage) {
            button.classList.add('is-current');
            button.setAttribute('aria-current', 'page');
        }

        button.addEventListener('click', () => {
            if (page === currentPage) return;
            currentPage = page;
            render();
            postGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });

        pagination.appendChild(button);
    }

    function renderPagination(totalPages) {
        if (!pagination) return;
        pagination.replaceChildren();
        pagination.hidden = totalPages <= 1;
        if (totalPages <= 1) return;

        if (currentPage > 1) createPageButton('First', 1, true);

        const first = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
        const last = Math.min(totalPages, first + 4);
        for (let page = first; page <= last; page++) {
            createPageButton(String(page), page);
        }

        if (currentPage < totalPages) createPageButton('Next', currentPage + 1, true);
        if (currentPage < totalPages - 1) createPageButton('Last', totalPages, true);
    }

    function render() {
        const query = normalize(search ? search.value : '');
        const matching = cards.filter(card =>
            matchesAllSelectedFilters(card) &&
            normalize(card.dataset.search).includes(query)
        );

        const totalPages = Math.max(1, Math.ceil(matching.length / pageSize));
        currentPage = Math.min(currentPage, totalPages);
        const start = (currentPage - 1) * pageSize;
        const visible = new Set(matching.slice(start, start + pageSize));

        cards.forEach(card => { card.hidden = !visible.has(card); });
        if (emptyState) emptyState.hidden = matching.length > 0;
        renderPagination(totalPages);
    }

    function updateUrl() {
        if (!search) return;
        const url = new URL(window.location.href);
        const query = search.value.trim();
        if (query) url.searchParams.set('q', query);
        else url.searchParams.delete('q');
        window.history.replaceState({}, '', url);
    }

    search?.addEventListener('input', () => {
        currentPage = 1;
        render();
        updateUrl();
    });

    searchForm?.addEventListener('submit', event => {
        event.preventDefault();
        currentPage = 1;
        render();
    });

    categoryBar?.addEventListener('click', event => {
        const button = event.target.closest('[data-filter]');
        if (!button || !categoryBar.contains(button)) return;

        const filter = normalize(button.dataset.filter);

        if (filter === 'all') {
            // All is exclusive: clear every other selected filter.
            activeFilters.clear();
        } else {
            // Selecting any specific filter turns All off and toggles this one.
            if (activeFilters.has(filter)) activeFilters.delete(filter);
            else activeFilters.add(filter);
        }

        categoryBar.querySelectorAll('[data-filter]').forEach(chip => {
            const chipFilter = normalize(chip.dataset.filter);
            const selected = chipFilter === 'all'
                ? activeFilters.size === 0
                : activeFilters.has(chipFilter);
            chip.classList.toggle('is-active', selected);
            chip.setAttribute('aria-pressed', String(selected));
        });

        currentPage = 1;
        render();
    });

    document.addEventListener('keydown', event => {
        if (event.key !== '/' || !search) return;
        const target = event.target;
        const typing = target instanceof HTMLElement && (
            target.isContentEditable ||
            ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
        );
        if (typing || event.ctrlKey || event.metaKey || event.altKey) return;
        event.preventDefault();
        search.focus();
    });

    render();
})();
