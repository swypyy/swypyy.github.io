(() => {
    'use strict';

    const search = document.getElementById('postSearch');
    const searchForm = document.getElementById('journalSearchForm');
    const categoryBar = document.getElementById('categoryBar');
    const postGrid = document.getElementById('postGrid');
    const pagination = document.getElementById('postPagination');
    const emptyState = document.getElementById('emptyState');
    const pageSize = 20;

    if (!postGrid) return;

    const cards = Array.from(postGrid.querySelectorAll('.post-card'));
    let activeFilter = 'all';
    let currentPage = 1;

    const normalize = value => String(value || '').trim().toLocaleLowerCase();

    if (search) {
        const params = new URLSearchParams(window.location.search);
        search.value = params.get('q') || '';
    }

    function matchesFilter(card) {
        if (activeFilter === 'all' || activeFilter === 'latest') return true;
        if (activeFilter === 'featured') return card.dataset.featured === 'true';
        const categories = (card.dataset.categories || '').split(',').map(normalize);
        if (activeFilter === 'announcements') return categories.includes('announcements');
        if (activeFilter === 'creations') return categories.some(category => ['creations', 'creation', 'projects', 'project'].includes(category));
        return false;
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
            currentPage = page;
            render();
            postGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        pagination.appendChild(button);
    }

    function render() {
        const query = normalize(search ? search.value : '');
        const matching = cards.filter(card => matchesFilter(card) && normalize(card.dataset.search).includes(query));
        const totalPages = Math.max(1, Math.ceil(matching.length / pageSize));
        currentPage = Math.min(currentPage, totalPages);
        const start = (currentPage - 1) * pageSize;
        const visible = new Set(matching.slice(start, start + pageSize));

        cards.forEach(card => { card.hidden = !visible.has(card); });
        if (emptyState) emptyState.hidden = matching.length > 0;

        if (!pagination) return;
        pagination.replaceChildren();
        pagination.hidden = totalPages <= 1;
        if (totalPages <= 1) return;

        if (currentPage > 1) createPageButton('First', 1, true);
        const first = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
        const last = Math.min(totalPages, first + 4);
        for (let page = first; page <= last; page++) createPageButton(String(page), page);
        if (currentPage < totalPages) createPageButton('Next', currentPage + 1, true);
        if (currentPage < totalPages - 1) createPageButton('Last', totalPages, true);
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
        activeFilter = normalize(button.dataset.filter);
        categoryBar.querySelectorAll('[data-filter]').forEach(chip => {
            const selected = chip === button;
            chip.classList.toggle('is-active', selected);
            chip.setAttribute('aria-pressed', String(selected));
        });
        currentPage = 1;
        render();
    });

    document.addEventListener('keydown', event => {
        if (event.key !== '/' || !search) return;
        const target = event.target;
        const typing = target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));
        if (typing || event.ctrlKey || event.metaKey || event.altKey) return;
        event.preventDefault();
        search.focus();
    });

    render();
})();
