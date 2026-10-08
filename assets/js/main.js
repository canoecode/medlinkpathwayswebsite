/*
 * MedLink Pathways: site behavior.
 *
 * Runs after layout.js (both scripts use defer, so the order is kept).
 * Sections: header state, dropdowns, mobile menu, smooth scroll, reveal on
 * scroll, TH/EN switch, gallery filters and lightbox, contact form, copy button.
 */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var canHover = window.matchMedia('(hover: hover) and (pointer: fine)');
  var desktop = window.matchMedia('(min-width: 960px)');

  function toArray(list) {
    return Array.prototype.slice.call(list);
  }

  function isVisible(el) {
    return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
  }

  function onMediaChange(mq, fn) {
    if (mq.addEventListener) mq.addEventListener('change', fn);
    else if (mq.addListener) mq.addListener(fn);
  }

  /* ---------- 1. Sticky header: transparent over the homepage hero ---------- */
  var header = doc.querySelector('.site-header');
  var isOverlay = !!(header && header.classList.contains('site-header--overlay'));
  var menuOpen = false;

  function updateHeader() {
    if (!header) return;
    var scrolled = window.scrollY > 8;
    header.classList.toggle('is-scrolled', scrolled);
    header.classList.toggle('is-transparent', isOverlay && !scrolled && !menuOpen);
  }

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  /* ---------- 2. Desktop dropdowns ---------- */
  var dropdownItems = toArray(doc.querySelectorAll('.site-nav__item--dropdown'));
  var openItem = null;

  function dropdownLinks(item) {
    return toArray(item.querySelectorAll('.site-nav__dropdown a'));
  }

  function setDropdown(item, open, how) {
    var trigger = item.querySelector('.site-nav__trigger');
    if (open && openItem && openItem !== item) setDropdown(openItem, false);
    item.classList.toggle('is-open', open);
    trigger.setAttribute('aria-expanded', String(open));
    item.setAttribute('data-opened-by', open ? how || 'click' : '');
    if (open) openItem = item;
    else if (openItem === item) openItem = null;
  }

  dropdownItems.forEach(function (item) {
    var trigger = item.querySelector('.site-nav__trigger');
    var closeTimer = null;

    trigger.addEventListener('click', function () {
      var isOpen = item.classList.contains('is-open');
      // A click after a hover-open keeps the menu open instead of closing it.
      if (isOpen && item.getAttribute('data-opened-by') === 'hover') {
        item.setAttribute('data-opened-by', 'click');
        return;
      }
      setDropdown(item, !isOpen, 'click');
    });

    item.addEventListener('mouseenter', function () {
      if (!canHover.matches) return;
      clearTimeout(closeTimer);
      if (!item.classList.contains('is-open')) setDropdown(item, true, 'hover');
    });

    item.addEventListener('mouseleave', function () {
      if (!canHover.matches || item.getAttribute('data-opened-by') !== 'hover') return;
      closeTimer = setTimeout(function () {
        setDropdown(item, false);
      }, 150);
    });

    item.addEventListener('keydown', function (event) {
      var links = dropdownLinks(item);
      var index = links.indexOf(doc.activeElement);
      var onTrigger = doc.activeElement === trigger;
      var next = null;

      switch (event.key) {
        case 'Escape':
          if (item.classList.contains('is-open')) {
            event.preventDefault();
            setDropdown(item, false);
            trigger.focus();
          }
          return;
        case 'ArrowDown':
          if (onTrigger) {
            setDropdown(item, true, 'key');
            next = links[0];
          } else if (index > -1) {
            next = links[(index + 1) % links.length];
          }
          break;
        case 'ArrowUp':
          if (onTrigger) {
            setDropdown(item, true, 'key');
            next = links[links.length - 1];
          } else if (index > -1) {
            next = links[(index - 1 + links.length) % links.length];
          }
          break;
        case 'Home':
          if (index > -1) next = links[0];
          break;
        case 'End':
          if (index > -1) next = links[links.length - 1];
          break;
        default:
          return;
      }

      if (next) {
        event.preventDefault();
        next.focus();
      }
    });

    // Close when keyboard focus leaves the item.
    item.addEventListener('focusout', function (event) {
      if (event.relatedTarget && !item.contains(event.relatedTarget)) setDropdown(item, false);
    });
  });

  doc.addEventListener('click', function (event) {
    if (openItem && !openItem.contains(event.target)) setDropdown(openItem, false);
  });

  /* ---------- 3. Mobile menu ---------- */
  var menuToggle = doc.querySelector('.menu-toggle');
  var mobileMenu = doc.getElementById('mobile-menu');

  function headerFocusables() {
    return toArray(header.querySelectorAll('a[href], button:not([disabled])')).filter(isVisible);
  }

  function setMenu(open, returnFocus) {
    if (!menuToggle || !mobileMenu) return;
    menuOpen = open;
    mobileMenu.hidden = !open;
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    root.classList.toggle('is-locked', open);
    header.classList.toggle('is-menu-open', open);
    updateHeader();
    if (!open && returnFocus) menuToggle.focus();
  }

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', function () {
      setMenu(!menuOpen);
    });

    toArray(mobileMenu.querySelectorAll('.mobile-menu__group-btn')).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var panel = doc.getElementById(btn.getAttribute('aria-controls'));
        var expanded = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!expanded));
        panel.hidden = expanded;
      });
    });

    doc.addEventListener('keydown', function (event) {
      if (!menuOpen) return;
      if (event.key === 'Escape') {
        setMenu(false, true);
        return;
      }
      // Keep keyboard focus inside the header while the menu is open.
      if (event.key === 'Tab') {
        var items = headerFocusables();
        var first = items[0];
        var last = items[items.length - 1];
        if (event.shiftKey && doc.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && doc.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });

    onMediaChange(desktop, function (mq) {
      if (mq.matches && menuOpen) setMenu(false);
      if (!mq.matches && openItem) setDropdown(openItem, false);
    });
  }

  /* ---------- 4. Smooth scroll for same-page anchors ---------- */
  doc.addEventListener('click', function (event) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    var anchor = event.target.closest ? event.target.closest('a[href*="#"]') : null;
    if (!anchor) return;
    var url = new URL(anchor.getAttribute('href'), window.location.href);
    if (url.pathname !== window.location.pathname || !url.hash || url.hash === '#') return;
    var target = doc.getElementById(decodeURIComponent(url.hash.slice(1)));
    if (!target) return;

    event.preventDefault();
    if (menuOpen) setMenu(false);
    target.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'start' });
    if (window.history && window.history.pushState) window.history.pushState(null, '', url.hash);
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });

  /* ---------- 5. Fade sections up on first scroll into view ---------- */
  var revealEls = toArray(doc.querySelectorAll('[data-reveal]'));

  if ('IntersectionObserver' in window && !reduceMotion.matches) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -40px 0px', threshold: 0 });
    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  /* ---------- 6. TH/EN switch: TH is not available yet ---------- */
  toArray(doc.querySelectorAll('.lang-switch__btn[aria-disabled="true"]')).forEach(function (btn) {
    var timer = null;
    btn.addEventListener('click', function (event) {
      event.preventDefault();
      btn.classList.add('show-tip');
      clearTimeout(timer);
      timer = setTimeout(function () {
        btn.classList.remove('show-tip');
      }, 2000);
    });
  });

  /* ---------- 7. Gallery filters and lightbox ---------- */
  var gallery = doc.querySelector('[data-gallery]');

  if (gallery) {
    var galleryItems = toArray(gallery.querySelectorAll('.gallery__item'));
    var filterState = { program: 'all', year: 'all' };
    var statusEl = doc.querySelector('[data-gallery-status]');
    var emptyEl = doc.querySelector('[data-gallery-empty]');

    var applyFilters = function () {
      var shown = 0;
      galleryItems.forEach(function (item) {
        var match = (filterState.program === 'all' || item.getAttribute('data-program') === filterState.program) &&
          (filterState.year === 'all' || item.getAttribute('data-year') === filterState.year);
        item.hidden = !match;
        if (match) shown += 1;
      });
      if (statusEl) statusEl.textContent = 'Showing ' + shown + ' of ' + galleryItems.length + ' photos';
      if (emptyEl) emptyEl.hidden = shown > 0;
    };

    toArray(doc.querySelectorAll('[data-filter]')).forEach(function (pill) {
      pill.addEventListener('click', function () {
        var key = pill.getAttribute('data-filter');
        filterState[key] = pill.getAttribute('data-value');
        toArray(doc.querySelectorAll('[data-filter="' + key + '"]')).forEach(function (other) {
          other.setAttribute('aria-pressed', String(other === pill));
        });
        applyFilters();
      });
    });

    applyFilters();

    var lightbox = doc.getElementById('lightbox');
    var lbFigure = lightbox.querySelector('.lightbox__figure');
    var lbMedia = lightbox.querySelector('.lightbox__media');
    var lbCaption = lightbox.querySelector('.lightbox__caption');
    var lbCounter = lightbox.querySelector('.lightbox__counter');
    var lbIndex = 0;
    var opener = null;

    var visibleItems = function () {
      return galleryItems.filter(function (item) {
        return !item.hidden;
      });
    };

    var showItem = function (index) {
      var list = visibleItems();
      if (!list.length) return;
      lbIndex = (index + list.length) % list.length;
      var figure = list[lbIndex].querySelector('.photo-slot');
      var media = figure.querySelector('.photo-slot__box, img');
      var caption = figure.querySelector('figcaption');
      lbMedia.innerHTML = '';
      lbMedia.appendChild(media.cloneNode(true));
      lbFigure.style.setProperty('--ratio', figure.style.getPropertyValue('--ratio') || '4 / 3');
      lbCaption.innerHTML = caption ? caption.innerHTML : '';
      lbCounter.textContent = (lbIndex + 1) + ' of ' + list.length;
    };

    var openLightbox = function (item, button) {
      opener = button;
      showItem(visibleItems().indexOf(item));
      if (typeof lightbox.showModal === 'function') lightbox.showModal();
      else lightbox.setAttribute('open', '');
      root.classList.add('is-locked');
      lightbox.querySelector('.lightbox__close').focus();
    };

    var closeLightbox = function () {
      if (typeof lightbox.close === 'function' && lightbox.open) {
        lightbox.close();
      } else {
        lightbox.removeAttribute('open');
        onLightboxClosed();
      }
    };

    var onLightboxClosed = function () {
      root.classList.remove('is-locked');
      if (opener) opener.focus();
    };

    lightbox.addEventListener('close', onLightboxClosed);

    gallery.addEventListener('click', function (event) {
      var button = event.target.closest('.photo-slot__open');
      if (button) openLightbox(button.closest('.gallery__item'), button);
    });

    lightbox.querySelector('.lightbox__close').addEventListener('click', closeLightbox);
    lightbox.querySelector('.lightbox__btn--prev').addEventListener('click', function () {
      showItem(lbIndex - 1);
    });
    lightbox.querySelector('.lightbox__btn--next').addEventListener('click', function () {
      showItem(lbIndex + 1);
    });

    // Backdrop click: anywhere outside the photo, caption, and buttons.
    lightbox.addEventListener('click', function (event) {
      if (event.target === lightbox || event.target.classList.contains('lightbox__stage')) closeLightbox();
    });

    lightbox.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        showItem(lbIndex + 1);
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        showItem(lbIndex - 1);
      } else if (event.key === 'Escape' && typeof lightbox.showModal !== 'function') {
        closeLightbox();
      }
    });
  }

  /* ---------- 8. Contact form (no backend) ---------- */
  var form = doc.getElementById('contact-form');

  if (form) {
    var success = doc.getElementById('contact-success');
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    var submitted = false;

    var rules = {
      name: function (value) {
        return value ? '' : 'Please enter your name.';
      },
      email: function (value) {
        if (!value) return 'Please enter your email address.';
        return emailPattern.test(value) ? '' : 'Please enter a valid email address, like name@example.com.';
      },
      message: function (value) {
        return value ? '' : 'Please enter a message.';
      }
    };

    var validateField = function (field) {
      var rule = rules[field.name];
      if (!rule) return true;
      var message = rule(field.value.trim());
      var error = doc.getElementById(field.id + '-error');
      field.setAttribute('aria-invalid', message ? 'true' : 'false');
      if (error) {
        error.querySelector('.field__error-text').textContent = message;
        error.hidden = !message;
      }
      return !message;
    };

    toArray(form.querySelectorAll('input, textarea')).forEach(function (field) {
      field.addEventListener('input', function () {
        if (submitted) validateField(field);
      });
      field.addEventListener('blur', function () {
        if (submitted) validateField(field);
      });
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      submitted = true;
      var firstInvalid = null;
      toArray(form.querySelectorAll('input, textarea')).forEach(function (field) {
        if (!validateField(field) && !firstInvalid) firstInvalid = field;
      });
      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }

      // FORM SERVICE: connect a form service here (for example Formspree,
      // Netlify Forms, or your own endpoint). Send new FormData(form) with
      // fetch(), then show the success message once the request succeeds.
      // Until then nothing is sent anywhere.

      form.hidden = true;
      success.hidden = false;
      success.focus();
    });
  }

  /* ---------- 9. Copy to clipboard (Donate) ---------- */
  toArray(doc.querySelectorAll('[data-copy-target]')).forEach(function (button) {
    var label = button.querySelector('.btn__label') || button;
    var status = doc.getElementById(button.getAttribute('data-copy-status'));
    var timer = null;

    var fallbackCopy = function (value) {
      var area = doc.createElement('textarea');
      area.value = value;
      area.setAttribute('readonly', '');
      area.style.position = 'absolute';
      area.style.left = '-9999px';
      doc.body.appendChild(area);
      area.select();
      var ok = false;
      try {
        ok = doc.execCommand('copy');
      } catch (err) {
        ok = false;
      }
      doc.body.removeChild(area);
      return ok ? Promise.resolve() : Promise.reject(new Error('Copy failed'));
    };

    button.addEventListener('click', function () {
      var source = doc.getElementById(button.getAttribute('data-copy-target'));
      var value = source ? source.textContent.trim() : '';
      // Try the Clipboard API first, then the older execCommand route.
      var copy = navigator.clipboard && window.isSecureContext
        ? navigator.clipboard.writeText(value).catch(function () {
          return fallbackCopy(value);
        })
        : fallbackCopy(value);
      copy.then(function () {
        label.textContent = 'Copied';
        if (status) status.textContent = 'Account number copied';
      }, function () {
        if (status) status.textContent = 'Copy failed. Select the number to copy it.';
      }).then(function () {
        clearTimeout(timer);
        timer = setTimeout(function () {
          label.textContent = 'Copy';
          if (status) status.textContent = '';
        }, 2000);
      });
    });
  });
})();
