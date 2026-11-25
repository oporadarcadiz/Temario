(() => {
  document.addEventListener('DOMContentLoaded', () => {
    const intro = document.querySelector('.page-intro');
    const heading = document.querySelector('.opportunities .section-heading');
    if (!intro) return;

    const title = intro.querySelector('h1');
    const description = intro.querySelector('p:last-child');
    if (title) title.textContent = 'Convocatorias en seguimiento';
    if (description) description.textContent = 'Procesos públicos de Cádiz, con estado y fuente oficial.';
    // Se conserva el h2 para lectores de pantalla; solo se oculta visualmente.
    heading?.classList.add('section-heading-compact');

  });
})();
