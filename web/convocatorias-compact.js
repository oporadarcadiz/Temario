(() => {
  const openFilters = (fields, controls, search, focusSearch) => {
    const opening = fields.hidden;
    fields.hidden = !opening;
    controls.forEach(button => button.setAttribute('aria-expanded', String(opening)));
    if (opening && focusSearch) window.setTimeout(() => search?.focus(), 0);
  };

  document.addEventListener('DOMContentLoaded', () => {
    const intro = document.querySelector('.page-intro');
    const fields = document.querySelector('.radar-fields');
    const heading = document.querySelector('.opportunities .section-heading');
    const results = document.querySelector('#opportunity-results');
    if (!intro || !fields || !results) return;

    const title = intro.querySelector('h1');
    const description = intro.querySelector('p:last-child');
    if (title) title.textContent = 'Convocatorias en seguimiento';
    if (description) description.textContent = 'Procesos públicos de Cádiz, con estado y fuente oficial.';
    heading?.remove();

    const controls = document.createElement('div');
    controls.className = 'radar-compact-controls';
    controls.setAttribute('role', 'group');
    controls.setAttribute('aria-label', 'Abrir búsqueda y filtros');
    controls.innerHTML = `
      <button type="button" class="radar-toggle" data-radar-toggle="search" aria-controls="radar-search-panel" aria-expanded="false" title="Buscar y filtrar"><span aria-hidden="true">⌕</span><span class="sr-only">Buscar y filtrar</span></button>
      <button type="button" class="radar-toggle" data-radar-toggle="filters" aria-controls="radar-search-panel" aria-expanded="false" title="Abrir filtros"><span aria-hidden="true">＋</span><span class="sr-only">Abrir filtros</span></button>`;
    fields.id = 'radar-search-panel';
    fields.hidden = true;
    fields.before(controls);
    const buttons = [...controls.querySelectorAll('[data-radar-toggle]')];
    const search = fields.querySelector('#radar-search');
    buttons.forEach(button => button.addEventListener('click', () =>
      openFilters(fields, buttons, search, button.dataset.radarToggle === 'search')
    ));
  });
})();
