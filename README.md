# MedLink Pathways website (example build)

A complete static example of the MedLink Pathways site: 21 pages, the shared header and footer, and every interaction. It is plain HTML, CSS, and vanilla JavaScript, with no framework and no build step.

The only thing missing is photography. Every photo is a labeled placeholder slot (88 in total, listed in [PHOTO-SLOTS.md](PHOTO-SLOTS.md)). Text that is still to come is highlighted in pale yellow, so it is easy to find and fill.

## Run it locally

The site uses root-relative links (`/our-story/`), so it must be served from a local web server. Opening `index.html` straight from the file system will not work.

From this folder, run either:

```bash
npx serve .
```

```bash
python3 -m http.server 8000
```

On Windows, use `python -m http.server 8000` if `python3` is not found. Then open the address the command prints (for the Python server, http://localhost:8000).

Any static host works for deployment. On Netlify, `_redirects` is picked up automatically.

## Folder structure

```
/
├── index.html                    Homepage
├── our-story/index.html          One folder per URL, each with index.html
├── founders/ our-team/ consultants/ partners/
├── healthcare-access/ community-empowerment/ medical-exploration/
├── research-innovation/
├── projects/
│   ├── pulma/ telesync/ rememocare/ epivascan/ thermography/
├── our-impact/ timeline/ awards/ gallery/
├── get-involved/ donate/
├── assets/
│   ├── css/styles.css            The one stylesheet. Design tokens are on :root.
│   ├── js/layout.js              Header and footer markup, injected on every page
│   ├── js/main.js                Dropdowns, mobile menu, sticky header, smooth scroll,
│   │                             reveal on scroll, gallery filters and lightbox,
│   │                             form validation, copy button
│   └── images/logo.svg           Placeholder wordmark (replace with the real logo)
├── scripts/check-links.mjs       Link checker (see below)
├── _redirects                    Old URLs to new pages (Netlify format, 301)
├── robots.txt
├── sitemap.xml                   All 21 URLs on https://www.medlinkpathways.com
├── PHOTO-SLOTS.md                Every photo slot: ID, page, ratio, description
└── README.md
```

## Editing the header and footer

The header and footer are written once, in `/assets/js/layout.js`. Each page has empty `<div id="site-header"></div>` and `<div id="site-footer"></div>` elements that the script fills in. To add, rename, or reorder a menu item, edit the lists at the top of `layout.js` (`WHO_WE_ARE`, `WHAT_WE_DO`, `PROJECTS`, `OUR_IMPACT`). The current page is marked in the menu automatically from the URL.

The contact details in the footer (`[Organization email]`, `[Phone]`, and the social links) are in the `CONTACT` object in the same file.

## Replacing a photo slot

Every photo slot looks like this:

```html
<figure class="photo-slot" data-slot="home-who-we-are" style="--ratio: 4 / 3;">
  <div class="photo-slot__box" role="img" aria-label="Photo placeholder: the team on a Mae Chaem trip">
    <span class="photo-slot__label">PHOTO: the team on a Mae Chaem trip</span>
    <span class="photo-slot__meta">4:3 · home-who-we-are</span>
  </div>
  <figcaption class="photo-slot__caption"><span class="placeholder-text">[Caption: what, where, when]</span></figcaption>
</figure>
```

To add the real photo:

1. Find the slot ID in [PHOTO-SLOTS.md](PHOTO-SLOTS.md), or search the HTML for `data-slot="home-who-we-are"`.
2. Crop the photo to the slot's ratio and save it as `/assets/images/<slot-id>.webp`, for example `/assets/images/home-who-we-are.webp`. About 1600px wide is plenty for hero photos and 1200px for the rest.
3. Replace the whole `<div class="photo-slot__box">...</div>` with an `<img>`. Keep the `<figure>` and its `--ratio`:

```html
<figure class="photo-slot" data-slot="home-who-we-are" style="--ratio: 4 / 3;">
  <img src="/assets/images/home-who-we-are.webp" alt="MedLink members with villagers in Mae Chaem" width="1200" height="900" loading="lazy">
  <figcaption class="photo-slot__caption">Our second trip to Mae Chaem, December 2025</figcaption>
</figure>
```

4. Write the real caption in the `<figcaption>` (or delete the `<figcaption>` if the photo needs none).

The stylesheet gives the `<img>` the same ratio, corner radius, and cropping (`object-fit: cover`) as the placeholder, so nothing else in the layout changes.

Notes for special slots:

- **Hero backgrounds** (`photo-slot--bg`): replace the box with the `<img>` the same way. The 40% dark overlay sits on the `<figure>`, so it stays in place. Leave out `loading="lazy"` on hero photos.
- **Round portraits** (`photo-slot--avatar`, 96px): use a square photo. It is cropped to a circle automatically.
- **Gallery** (`/gallery/`): keep the `<button class="photo-slot__open">` inside each figure. It opens the lightbox, which shows whatever is in the slot, box or image.
- **Logo placeholders** (partners strip, Partners and Sponsors, award cards): see the second table in PHOTO-SLOTS.md.

## Text placeholders

Bracketed fields such as `[Name]` or `[Number of patients]` are wrapped in `<span class="placeholder-text">`, which shows them on a pale yellow background. `[CONTENT TO COME: ...]` blocks also have gray lines after them that show roughly how long the final text should be.

To fill one, replace the whole `<span class="placeholder-text">...</span>` (and, for content-to-come blocks, the surrounding `<span class="placeholder-block">`) with the real text. To find what is left, search the HTML for `placeholder-text`.

## Hidden until there is content

These parts are already built but hidden with the `hidden` attribute. A comment next to each one says what to do:

- **Alumni** on `/our-team/`: remove `hidden` once it has entries.
- **What Your Gift Covers** on `/donate/`: remove `hidden` once the figures are supplied.
- **Order** button on `/community-empowerment/` (Highland Products): remove `hidden` and set the link once an order page exists.

## Logo and share image

- Replace `/assets/images/logo.svg` with the real logo. The header and footer show it in white over dark backgrounds using a CSS filter. If the real logo needs its own white version, add it and point the footer and the transparent header at it in `layout.js`.
- Every page's Open Graph tags point at `/assets/images/share-default.jpg`, which does not exist yet. Add a 1200 x 630 image at that path.

## Contact form

The form on `/get-involved/#contact` is validated in the browser and then shows "Thanks for your message. We'll be in touch." Nothing is sent anywhere. To connect a form service, look for the `FORM SERVICE` comment in `/assets/js/main.js`.

## Checking links

```bash
node scripts/check-links.mjs
```

The script reads every HTML file, the header and footer links in `layout.js`, and the targets in `_redirects`. It reports any internal link that points to a missing page, a missing file, or a missing `#anchor`, and exits with an error code if it finds one. Run it after adding or renaming pages.

## Design tokens

Every color, font size, spacing value, and radius is a CSS custom property at the top of `/assets/css/styles.css`. Change a token there and it updates everywhere. The type scale switches from mobile to desktop sizes at 640px; the layout breakpoints are 640px, 960px, and 1200px.

## Accessibility notes

- One `h1` per page and no skipped heading levels. Where the spec calls for H3-sized group titles directly under the page title (Partners, Awards), the headings are `h2` elements styled at H3 size.
- The dropdowns, mobile menu, gallery filters, lightbox, and form all work from the keyboard. Escape closes the dropdowns, the mobile menu, and the lightbox.
- Smooth scrolling, transitions, and the fade-in on scroll are turned off when the visitor's system asks for reduced motion.
