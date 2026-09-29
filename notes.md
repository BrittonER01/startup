# CS 260 Notes

This file represents what I have learned about web programming.

- [My startup](https://startup.cs260.click)
- [My simon](https://simon.cs260.click)

## Helpful links

- [Course instruction](https://github.com/webprogramming260)
- [Canvas](https://byu.instructure.com)
- [MDN](https://developer.mozilla.org)

## AWS

Public IP for website: 34.226.37.185
ssh commands for logging into server
- ssh -i DoNotCommit/MasterKey.pem ubuntu@34.226.37.185

Command for leaving server
* exit

## HTML

Interesting things I have learned about HTML

### What I Learned
- HTML provides structure and content only — no styling or interactivity at this stage. That comes later with CSS and JavaScript.
- Reviewed the `simon-html` starter repo to see basic elements in use: headings, paragraphs, buttons, links, inputs, and a `<canvas>` element for drawing.
- Used the VS Code Live Server extension to preview changes locally with automatic reload on save — much faster feedback loop than manually refreshing.
- Experimented with modifying the starter code to see how individual elements behave without any CSS applied.

### Deployment
- Deployed the static HTML files to my production EC2 environment using `deployFiles.sh`.
- The script:
  1. SSHes into the server and wipes the previous deployment folder for the service (`rm -rf` + `mkdir -p`).
  2. Uses `scp -r` to copy all project files into that freshly-emptied folder.
  3. Relies on Caddy (already configured) to serve the folder under a subdomain, e.g. `simon.vitallog.click`.
- Had to run `sudo chmod +x deployFiles.sh` once to make the script executable before it would run.
- Confirmed the deployment by visiting `https://simon.vitallog.click` in the browser.

### Gotchas / Things to Remember
- Deploy scripts must be run from a POSIX-compliant shell (Git Bash works; PowerShell/CMD do not).
- The `-k` flag needs the correct path to my `.pem` key file, and `-h` is my domain, not the subdomain.
- Each service (`simon`, `startup`, etc.) gets deployed to its own subdomain automatically based on the `-s` flag — no manual Caddy edits needed for this step since that mapping was set up earlier.


## CSS

### Fonts
 
- `font-family` is a prioritized list; end with a generic family (`serif`, `sans-serif`, `monospace`) as a fallback.
- Families: **serif** (formal), **sans-serif** (clean UI), **fixed/monospace** (code, tables), **symbol** (icons, emojis).
- Use few fonts (2-3) and avoid hard-to-read or overused ones.
```css
/* Self-hosted */
@font-face { font-family: 'Quicksand'; src: url('quicksand.ttf'); }
 
/* Google Fonts (display=swap shows fallback text until the font loads) */
@import url('https://fonts.googleapis.com/css2?family=Quicksand&display=swap');
 
body { font-family: 'Quicksand', Arial, sans-serif; }
```
 
### Animation
 
An animation needs `animation-*` properties on the element plus an `@keyframes` rule; the browser fills in the frames between.
 
```css
p {
  animation-name: demo;             /* matches @keyframes name */
  animation-duration: 3s;           /* required */
  animation-iteration-count: infinite;
}
@keyframes demo {
  from { font-size: 0vh; }
  95%  { font-size: 33vh; }         /* larger than final = bounce */
  to   { font-size: 30vh; }
}
```
 
- `animation-fill-mode: forwards` keeps the final state after a finite animation.
- Prefer animating `transform` and `opacity` for smoothness.
### Debugging CSS
 
- Right-click → **Inspect** to open DevTools. The **Styles** pane shows applied rules; the **box model** diagram shows content, padding, border, and margin.
- Edits in DevTools are temporary; copy fixes into your CSS file.
- Set `margin: 0` to remove default body margin (it can push content off-screen).
- `text-align` centers text *within* a box; `justify-content` positions flex items. A flex `p` needs `justify-content: center` to center horizontally.
### Responsive Design
 
| `display` | Behavior |
|---|---|
| `none` | Not rendered |
| `block` | Fills parent width, new line |
| `inline` | Only as wide as content; ignores width/height |
| `flex` / `grid` | Lays out children (set on the parent) |
 
```html
<!-- Required in <head> so phones report their real width -->
<meta name="viewport" content="width=device-width,initial-scale=1" />
```
 
```css
/* Media queries apply CSS only under certain conditions */
@media (max-width: 600px) { aside { display: none; } }
@media (orientation: portrait) { main { flex-direction: column; } }
```
 
- Design mobile-first; use width-based queries.
- `float` is only for wrapping text around an element, not for layout.
### Grid (two dimensions)
 
```css
.container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  grid-auto-rows: 300px;
  gap: 1em;
}
```
 
- `minmax(300px, 1fr)`: columns at least 300px, sharing leftover space.
- `auto-fill` adds as many columns as fit, so it's responsive without media queries.
## Flexbox (one dimension)
 
```css
body   { display: flex; flex-direction: column; margin: 0; height: 100vh; }
header { flex: 0 80px; }   /* fixed */
main   { flex: 1; display: flex; }   /* takes remaining space */
section:nth-child(1) { flex: 1; }    /* 1:3 ratio = 25% / 75% */
section:nth-child(2) { flex: 3; }
```
 
- `flex: <grow> <shrink> <basis>`; `flex: 1` splits space by ratio.
- **Main axis** = flow direction (`justify-content`); **cross axis** = perpendicular (`align-items`).
- Elements can be both flex items and flex containers (nesting).
- **Flex** for rows/columns and app frames; **grid** for galleries and page layouts. They combine well.
### Frameworks: Bootstrap vs Tailwind
 
| | Bootstrap | Tailwind |
|---|---|---|
| Approach | Pre-built components (`btn btn-primary`) | Utility classes in HTML (`px-4 rounded`) |
| Look | Recognizable default look | Blank slate, full control |
| Size | Whole stylesheet shipped | Build step outputs only used classes |
| Learning curve | Easy start | Steeper (need CSS knowledge) |
| JS | Bundle needed for interactive parts | CSS only |
 
**Tailwind essentials**
- A build tool (e.g. Vite) scans your files and generates CSS from the classes it finds, so class names must appear as literal text (`bg-${color}-500` fails).
- Variants apply classes conditionally: `hover:bg-blue-700`, `md:p-8` (768px and up; mobile-first), `dark:`.
- Wrap repeated markup in components (e.g. React) so class lists live in one place.
```html
<button class="bg-blue-400 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition-colors">
  Get Started
</button>
```
 
**Bootstrap essentials**
- Link the CSS in `<head>`; add the JS bundle at the end of `<body>` only for interactive components.
- Use the latest version links, or install via npm (`npm install bootstrap@5.3.3`).

## React

Interesting things I have learned about React

## General Notes
I love web programming!
