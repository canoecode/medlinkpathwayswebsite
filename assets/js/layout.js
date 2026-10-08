/*
 * MedLink Pathways: shared header and footer.
 *
 * The header and footer markup lives here once. It is injected into
 * <div id="site-header"></div> and <div id="site-footer"></div> on every page.
 * To change a menu item, edit the lists below; every page picks up the change.
 *
 * Pages with <body data-header-overlay> (the homepage) get a header that is
 * transparent over the hero until the page scrolls. main.js handles that.
 */
(function () {
  'use strict';

  var WHO_WE_ARE = [
    { label: 'Our Story', href: '/our-story/' },
    { label: 'Founders', href: '/founders/' },
    { label: 'Our Team', href: '/our-team/' },
    { label: 'Consultants & Doctors', href: '/consultants/' },
    { label: 'Partners & Sponsors', href: '/partners/' }
  ];

  var WHAT_WE_DO = [
    { label: 'Healthcare Access', href: '/healthcare-access/' },
    { label: 'Community Empowerment', href: '/community-empowerment/' },
    { label: 'Medical Exploration', href: '/medical-exploration/' },
    { label: 'Research & Innovation', href: '/research-innovation/' }
  ];

  // Shown as an indented sub-list under Research & Innovation.
  var PROJECTS = [
    { label: 'Pulma', href: '/projects/pulma/' },
    { label: 'TeleSync', href: '/projects/telesync/' },
    { label: 'RememoCare', href: '/projects/rememocare/' },
    { label: 'EpivaScan', href: '/projects/epivascan/' },
    { label: 'Thermography Study', href: '/projects/thermography/' }
  ];

  var OUR_IMPACT = [
    { label: 'Impact at a Glance', href: '/our-impact/' },
    { label: 'Timeline', href: '/timeline/' },
    { label: 'Awards', href: '/awards/' },
    { label: 'Gallery', href: '/gallery/' }
  ];

  var NAV = [
    { id: 'who-we-are', label: 'Who We Are', items: WHO_WE_ARE },
    { id: 'what-we-do', label: 'What We Do', items: WHAT_WE_DO, projects: PROJECTS, projectsUnder: '/research-innovation/' },
    { id: 'our-impact', label: 'Our Impact', items: OUR_IMPACT }
  ];

  var CONTACT = {
    email: '[Organization email]',
    phone: '[Phone]',
    social: [
      { label: 'Instagram', href: '#', icon: 'instagram' },
      { label: 'LinkedIn', href: '#', icon: 'linkedin' },
      { label: 'LINE', href: '#', icon: 'line' }
    ]
  };

  // Lucide-style line icons, 2px stroke, currentColor.
  var ICONS = {
    chevronDown: '<path d="m6 9 6 6 6-6"/>',
    menu: '<path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/>',
    close: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
    instagram: '<rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><path d="M17.5 6.5h.01"/>',
    linkedin: '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>',
    line: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/><path d="M8 10v4h2"/><path d="M12.5 10v4"/><path d="M15 14v-4l2.5 4v-4"/>'
  };

  function icon(name, size, cls) {
    return '<svg class="icon' + (cls ? ' ' + cls : '') + '" width="' + size + '" height="' + size +
      '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
      ICONS[name] + '</svg>';
  }

  function esc(text) {
    return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Bracketed values such as [Phone] are placeholders still to be filled.
  function text(value) {
    return esc(value).replace(/\[([^\]]+)\]/g, '<span class="placeholder-text">[$1]</span>');
  }

  function normalize(path) {
    path = (path || '/').replace(/index\.html$/, '');
    return path.charAt(path.length - 1) === '/' ? path : path + '/';
  }

  var here = normalize(window.location.pathname);

  function isHere(href) {
    return normalize(href) === here;
  }

  function current(href) {
    return isHere(href) ? ' aria-current="page"' : '';
  }

  function groupIsHere(group) {
    return group.items.concat(group.projects || []).some(function (item) {
      return isHere(item.href);
    });
  }

  function link(item) {
    return '<li><a href="' + item.href + '"' + current(item.href) + '>' + esc(item.label) + '</a></li>';
  }

  function groupList(group, cls) {
    var html = '<ul class="' + cls + '">';
    group.items.forEach(function (item) {
      html += '<li><a href="' + item.href + '"' + current(item.href) + '>' + esc(item.label) + '</a>';
      if (group.projects && item.href === group.projectsUnder) {
        html += '<ul class="' + cls + '-sub" aria-label="Research projects">' + group.projects.map(link).join('') + '</ul>';
      }
      html += '</li>';
    });
    return html + '</ul>';
  }

  function langSwitch(suffix, cls) {
    var tipId = 'th-tip-' + suffix;
    return '<div class="lang-switch' + (cls ? ' ' + cls : '') + '" role="group" aria-label="Language">' +
      '<button type="button" class="lang-switch__btn" aria-disabled="true" aria-describedby="' + tipId + '">TH</button>' +
      '<span class="lang-switch__tip" role="tooltip" id="' + tipId + '">Thai version coming soon</span>' +
      '<button type="button" class="lang-switch__btn" aria-pressed="true">EN</button>' +
      '</div>';
  }

  /* ---------- Header ---------- */
  var overlay = document.body.hasAttribute('data-header-overlay');

  var desktopNav = NAV.map(function (group) {
    return '<li class="site-nav__item site-nav__item--dropdown">' +
      '<button type="button" class="site-nav__trigger' + (groupIsHere(group) ? ' is-current' : '') + '" aria-expanded="false" aria-controls="nav-' + group.id + '">' +
      esc(group.label) + icon('chevronDown', 16, 'site-nav__chevron') + '</button>' +
      '<div class="site-nav__dropdown" id="nav-' + group.id + '">' + groupList(group, 'site-nav__menu') + '</div>' +
      '</li>';
  }).join('');

  var mobileNav = NAV.map(function (group) {
    var open = groupIsHere(group);
    return '<li>' +
      '<button type="button" class="mobile-menu__group-btn" aria-expanded="' + open + '" aria-controls="mnav-' + group.id + '">' +
      esc(group.label) + icon('chevronDown', 24) + '</button>' +
      '<div class="mobile-menu__panel" id="mnav-' + group.id + '"' + (open ? '' : ' hidden') + '>' +
      groupList(group, 'mobile-menu__sub') +
      '</div>' +
      '</li>';
  }).join('');

  var headerHTML =
    '<a class="skip-link" href="#main">Skip to content</a>' +
    '<header class="site-header' + (overlay ? ' site-header--overlay is-transparent' : '') + '">' +
      '<div class="container site-header__inner">' +
        '<a class="site-header__logo" href="/"><img src="/assets/images/logo.svg" alt="MedLink Pathways" width="210" height="32"></a>' +
        '<nav class="site-nav" aria-label="Main">' +
          '<ul class="site-nav__list">' +
            desktopNav +
            '<li class="site-nav__item"><a class="site-nav__link" href="/get-involved/"' + current('/get-involved/') + '>Get Involved</a></li>' +
          '</ul>' +
        '</nav>' +
        langSwitch('desktop', 'site-header__lang') +
        '<a class="btn btn--primary site-header__donate" href="/donate/"' + current('/donate/') + '>Donate</a>' +
        '<button type="button" class="menu-toggle" aria-expanded="false" aria-controls="mobile-menu" aria-label="Open menu">' +
          icon('menu', 24, 'menu-toggle__open') + icon('close', 24, 'menu-toggle__close') +
        '</button>' +
      '</div>' +
      '<div class="mobile-menu" id="mobile-menu" hidden>' +
        '<nav aria-label="Main">' +
          '<ul class="mobile-menu__list">' +
            mobileNav +
            '<li><a class="mobile-menu__link" href="/get-involved/"' + current('/get-involved/') + '>Get Involved</a></li>' +
          '</ul>' +
        '</nav>' +
        '<div class="mobile-menu__footer">' +
          '<span class="mobile-menu__footer-label">Language</span>' +
          langSwitch('mobile') +
        '</div>' +
      '</div>' +
    '</header>';

  /* ---------- Footer ---------- */
  function footerColumn(id, title, items) {
    return '<nav class="site-footer__col" aria-labelledby="footer-' + id + '">' +
      '<h2 class="site-footer__heading" id="footer-' + id + '">' + esc(title) + '</h2>' +
      '<ul class="site-footer__links">' + items.map(link).join('') + '</ul>' +
      '</nav>';
  }

  var footerHTML =
    '<footer class="site-footer on-dark">' +
      '<div class="container">' +
        '<div class="site-footer__grid">' +
          '<div class="site-footer__brand">' +
            '<a class="site-footer__logo" href="/"><img src="/assets/images/logo.svg" alt="MedLink Pathways" width="210" height="32"></a>' +
            '<p class="site-footer__tagline">Empowering future doctors to care, connect, and create opportunities for communities.</p>' +
          '</div>' +
          footerColumn('who-we-are', 'Who We Are', WHO_WE_ARE) +
          footerColumn('what-we-do', 'What We Do', WHAT_WE_DO) +
          footerColumn('our-impact', 'Our Impact', OUR_IMPACT) +
          '<div class="site-footer__col">' +
            '<h2 class="site-footer__heading">Contact</h2>' +
            '<ul class="site-footer__contact">' +
              '<li>' + icon('mail', 20) + '<span>' + text(CONTACT.email) + '</span></li>' +
              '<li>' + icon('phone', 20) + '<span>' + text(CONTACT.phone) + '</span></li>' +
            '</ul>' +
            '<ul class="site-footer__social">' +
              CONTACT.social.map(function (s) {
                return '<li><a href="' + s.href + '" aria-label="MedLink Pathways on ' + s.label + '">' + icon(s.icon, 20) + '</a></li>';
              }).join('') +
            '</ul>' +
          '</div>' +
        '</div>' +
        '<div class="site-footer__bottom">' +
          '<p>Based in Bangkok, Thailand</p>' +
          '<p>&copy; 2026 MedLink Pathways</p>' +
        '</div>' +
      '</div>' +
    '</footer>';

  var headerSlot = document.getElementById('site-header');
  var footerSlot = document.getElementById('site-footer');
  if (headerSlot) headerSlot.innerHTML = headerHTML;
  if (footerSlot) footerSlot.innerHTML = footerHTML;
})();
