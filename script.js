// Load remaining sections
document.addEventListener('DOMContentLoaded', function () {
  fetch('sections-rest.html')
    .then(function (r) { return r.text(); })
    .then(function (html) {
      document.getElementById('sections-rest').innerHTML = html;
      // Re-run scroll spy after content loaded
      initScrollSpy();
    })
    .catch(function () {
      // Fallback: if fetch fails (e.g. file:// protocol), inline nothing
      console.warn('Could not load sections-rest.html. If viewing via file://, open with a local server.');
    });

  initScrollSpy();
});

function initScrollSpy() {
  var links = document.querySelectorAll('#sidebar a');
  var sections = [];

  links.forEach(function (link) {
    var id = link.getAttribute('href').replace('#', '');
    var el = document.getElementById(id);
    if (el) sections.push({ el: el, link: link });
  });

  if (!sections.length) return;

  function onScroll() {
    var scrollPos = window.scrollY + 120;
    var current = sections[0];

    for (var i = 0; i < sections.length; i++) {
      if (sections[i].el.offsetTop <= scrollPos) {
        current = sections[i];
      }
    }

    links.forEach(function (l) { l.classList.remove('active'); });
    current.link.classList.add('active');
  }

  window.addEventListener('scroll', onScroll);
  onScroll();
}
