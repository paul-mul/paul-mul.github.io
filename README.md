# Paul Muller Academic Website

Static academic CV site generated from the current Google Sites content at:

https://sites.google.com/view/researchpaulmuller

## Files

- `index.html` contains the page content and all publication/news links.
- `styles.css` contains the visual design.
- `script.js` handles the mobile navigation menu.

## GitHub Pages

You can host this in either of these ways:

- User site: create a repository named `YOUR-GITHUB-USERNAME.github.io`. The site will live at `https://YOUR-GITHUB-USERNAME.github.io`.
- Project site: create any repository name, for example `academic-website`. The site will live at `https://YOUR-GITHUB-USERNAME.github.io/academic-website`.

For a personal academic homepage, the user site is usually the cleanest option.

## Replacing the Photo Placeholder

Add a photo at `assets/profile.jpg`, then replace the placeholder block in `index.html` with:

```html
<img src="assets/profile.jpg" alt="Paul Muller" class="profile-photo">
```

Then add this to `styles.css`:

```css
.profile-photo {
  aspect-ratio: 4 / 5;
  display: block;
  object-fit: cover;
  width: 100%;
}
```
