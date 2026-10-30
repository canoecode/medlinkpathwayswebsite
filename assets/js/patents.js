/* Draw the first page of each linked PDF as a thumbnail (pdf.js): Patents and Our Impact pages. */
(function () {
  'use strict';
  function start() {
    var lib = window.pdfjsLib;
    if (!lib) return;
    lib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    var docs = {};
    function load(url) {
      if (!docs[url]) docs[url] = lib.getDocument(url).promise;
      return docs[url];
    }
    function draw(a) {
      var canvas = a.querySelector('canvas');
      load(a.getAttribute('data-pdf')).then(function (pdf) {
        return pdf.getPage(parseInt(a.getAttribute('data-page'), 10));
      }).then(function (page) {
        var rotation = (page.rotate + (parseInt(a.getAttribute('data-rotate'), 10) || 0)) % 360;
        var base = page.getViewport({ scale: 1, rotation: rotation });
        var scale = 420 / base.width;
        var vp = page.getViewport({ scale: scale, rotation: rotation });
        canvas.width = vp.width;
        canvas.height = vp.height;
        return page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise;
      }).then(function () {
        a.classList.add('is-ready');
      }).catch(function () {});
    }
    var links = Array.prototype.slice.call(document.querySelectorAll('.doc-thumb'));
    if (!('IntersectionObserver' in window)) { links.forEach(draw); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { io.unobserve(e.target); draw(e.target); }
      });
    }, { rootMargin: '300px' });
    links.forEach(function (a) { io.observe(a); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
