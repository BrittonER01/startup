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

Command for deploying files to server:
```
./deployFiles.sh -k ~/CS260/DoNotCommit/MasterKey.pem -h vitallog.click -s startup
```

Command for deploying React:
```
./deployReact.sh -k ~/CS260/DoNotCommit/MasterKey.pem -h vitallog.click -s startup
```

Command for deploying Service:
```
./deployService.sh -k ~/CS260/DoNotCommit/MasterKey.pem -h vitallog.click -s simon/startup
```

### Deployment command

```bash
./deployService.sh -k ~/CS260/DoNotCommit/MasterKey.pem -h vitallog.click -s startup
```

## Running Server Locally Steps
In service dir run 
```bash
npm install
node index.js
```
In another teminal in proj root directory run\
```bash
npm install
npm run dev
```

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

- React rerenders components when state setters such as `setEntries` or `setUser` update state; directly changing a normal variable does not trigger a rerender.
- Form controls are controlled by giving them a `value` and an `onChange` callback. Forms should call `event.preventDefault()` before client-side handling to avoid a browser page reload.
- `useEffect` is appropriate for synchronizing with browser storage and timers. Effects that start a timer must return a cleanup function so stale intervals do not keep running after navigation.
- `localStorage` stores strings, so object/array data must be JSON-serialized and parsed. It is per browser/origin, can be cleared by the user, and is not a database or secure secret store.
- `useMemo` is used on the Dashboard to derive category totals from current state. Derived totals should not be separately stored when they can be calculated from entries.
- Vite expects the HTML entry point at the project root and the React JavaScript entry at `src/main.jsx`. Component imports should include exact file paths and extensions where used.
- Browser dev tools are useful for catching import errors, inspecting localStorage, checking interval activity, and debugging component event handlers.

## Backend Service Support
Implemented a Node.js and Express backend for the health
and fitness startup application.

### Backend Functionality
- Created an Express server running on port 4000.
- Added authentication endpoints for registration, login,
  and logout.
- Implemented BCrypt password hashing.
- Added UUID authentication tokens stored in HTTP-only cookies.
- Created authentication middleware for protected endpoints.
- Added application endpoints for saving, retrieving,
  and deleting favorite nutritional facts.

### Frontend Integration
- Configured Vite to proxy API requests to port 4000.
- Connected React login and registration forms to Express.
- Added frontend fetch requests for protected endpoints.
- Retained third-party nutritional information API integration.

### NCBI E-utilities
- PubMed provides access to scientific literature through the NCBI E-utilities API.
- ESearch searches PubMed for articles matching a specified query.
- ESummary retrieves publication metadata using PubMed article IDs.
- The `retmode=json` parameter requests JSON-formatted responses.
- URLSearchParams makes it easier to construct API request URLs.

### Fetch and Asynchronous JavaScript
- Fetch allows React to communicate with external APIs.
- Async/await makes asynchronous API requests easier to manage.
- Response.ok can be used to check whether an HTTP request succeeded.
- JSON responses are converted into JavaScript objects using response.json().
- Multiple API requests can be chained together to retrieve related information.

### VitalLog Implementation
- Replaced the mocked research feed with live PubMed search results.
- Added search functionality for nutrition, exercise, and sleep research.
- Displayed article titles, authors, journals, and publication dates.
- Added direct links to the original PubMed records.
- Added loading and error states to improve the user experience.

## Backend Application Endpoints

- Express provides application-specific API endpoints.
- GET retrieves information from the backend.
- POST sends new data to the backend.
- DELETE removes existing data.
- Authentication middleware protects application endpoints.
- UUID generates unique identifiers for health entries.
- Backend filtering associates each entry with its authenticated user.
- Fetch allows React to interact with the backend using HTTP requests.

## Friends Backend Integration

- Implemented authenticated endpoints for retrieving friends.
- POST requests create new friend records.
- PATCH requests update friend request status.
- DELETE requests remove friend records.
- React uses fetch to communicate with the Express API.
- Friend records are associated with the authenticated username.
- The friends interface now retrieves and updates data through
  the backend instead of localStorage.

### Backend endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/create` | Register a user |
| POST | `/api/auth/login` | Authenticate a user |
| DELETE | `/api/auth/logout` | Log out |
| GET | `/api/profile` | Retrieve authenticated profile |
| GET | `/api/entries` | Retrieve health entries |
| POST | `/api/entries` | Save a health entry |
| DELETE | `/api/entries/:id` | Delete a health entry |
| GET | `/api/friends` | Retrieve friends |
| POST | `/api/friends` | Add a friend |
| PATCH | `/api/friends/:id` | Accept a friend request |
| DELETE | `/api/friends/:id` | Remove a friend |

### Implementation notes

- Frontend and backend have separate NPM configurations.
- Vite proxies local API requests to the Express server on port 4000.
- Authentication tokens are stored in HTTP-only cookies.
- Passwords are hashed using BCrypt with a salt cost of 10.
- User, friend, and health-entry data currently use temporary in-memory storage and will be moved to persistent database storage in the database deliverable.
- The Friends activity feed remains simulated; real-time WebSocket functionality is reserved for the WebSocket deliverable.

### Deployment

- Replaced the previous deployment script with `deployService.sh` from the Simon Service repository.
- Configured Express to serve the compiled React frontend.
- Built the production frontend successfully using Vite.
- Deployed using the required startup service parameter.

## Health Dashboard Backend Integration

- Created GET, POST, and DELETE endpoints for health entries.
- Health entries are associated with the authenticated username.
- The backend generates UUIDs for new health entries.
- React retrieves health records using fetch.
- The dashboard updates its state after successful backend requests.
- Protected endpoints reject requests without valid authentication.

## Friends Backend Integration

- Created authenticated endpoints for retrieving and managing friends.
- POST creates a friend request.
- PATCH updates a friend request to an accepted status.
- DELETE removes a friend.
- Friend records are associated with the authenticated account.
- The Friends page retrieves its data from Express rather than localStorage.

## Production Deployment

- Vite generates the production frontend using `npm run build`.
- The deployment script copies the frontend build into `build/public`.
- Backend JavaScript and package configuration are copied into the deployment package.
- Express serves the production frontend through `express.static('public')`.
- The deployment script installs backend dependencies on the AWS server.
- The PM2 process is restarted using the startup service name.

## Express Backend Refactoring

### Express Router

- Express Router allows related API endpoints to be organized into separate JavaScript files rather than placing every endpoint in `index.js`.
- Created separate route modules for authentication, health entries, friends, favorites, and PubMed research.
- Each route module creates a router using `express.Router()` and exports it using `module.exports = router`.
- The main Express application imports and mounts these routers using `app.use()`.
- Routes are relative to their mounting path. For example, mounting the entries router at `/api/entries` means `router.get('/')` handles requests to `GET /api/entries`.
- Separating routes improves code organization and makes future changes easier to manage.

### CommonJS Modules

- Node.js supports CommonJS modules, which use `require()` to import functionality and `module.exports` to export it.
- `module.exports = router` allows another file to import an Express Router.
- Shared functions can also be exported as properties of an object.

For example:

```javascript
module.exports = {
  verifyAuth,
  findUser,
};
```

Another file can import these functions using:

```javascript
const { verifyAuth, findUser } = require('../middleware/auth');
```

- When refactoring the Research route, I initially forgot to include `module.exports = router`. This caused Express to throw `TypeError: argument handler must be a function` because `app.use()` received an object instead of a router function.
- Adding the missing export resolved the issue.

### Shared Authentication Middleware

- Middleware functions execute during the request-response cycle before the final route handler.
- Moved authentication functionality into `service/middleware/auth.js`.
- The `verifyAuth` middleware checks the authentication token stored in an HTTP-only cookie.
- If the token matches a registered user, the middleware attaches the user to `req.user` and calls `next()`.
- If authentication fails, the middleware returns HTTP 401.
- Sharing middleware allows different route modules to protect endpoints without duplicating authentication logic.

### Shared In-Memory Storage

- Created `service/data/store.js` to hold temporary arrays for users, health entries, friends, and favorites.
- Each route module imports the arrays it needs from the shared storage module.
- Node.js caches CommonJS modules after loading them, so different route modules can reference the same arrays.
- Changes made to an array in one route are visible to other routes using the same array.
- This storage only persists while the Node.js process is running. Restarting the backend clears the data.
- Persistent storage will be implemented using MongoDB during the database deliverable.

### Backend PubMed Integration

- Moved PubMed E-utilities requests from the React frontend into the Express backend.
- React now sends requests to `GET /api/research?term=...`.
- The Express endpoint performs ESearch to retrieve PubMed IDs and ESummary to retrieve publication metadata.
- Express formats the article information into JSON before returning it to React.
- This separates external API communication from frontend presentation logic.
- Optional API credentials can remain on the backend rather than being exposed in frontend JavaScript.

### Server-Side Validation

- Added validation to ensure that users can only add friends whose usernames exist in the application.
- The backend returns HTTP 404 when the requested friend does not exist.
- Added category-specific health-entry limits: 24 hours of sleep, 1,440 minutes of exercise, and 10,000 kcal of nutrition.
- The backend returns HTTP 400 when submitted health-entry data is invalid.
- Server-side validation is important because frontend validation can be bypassed by sending requests directly to the API.

### PM2 and Production Environment Variables

- PM2 is a Node.js process manager that keeps the backend running after the terminal session closes.
- The deployment script installs backend dependencies and restarts the application through PM2.
- Updated the deployment command to:

```bash
NODE_ENV=production pm2 restart ${service} --update-env
```

- `NODE_ENV=production` sets the Node.js environment to production.
- `--update-env` tells PM2 to update the running process with the environment variables supplied during the restart.
- VitalLog uses `process.env.NODE_ENV === 'production'` to enable the `Secure` attribute on authentication cookies.
- Updated the deployment script to copy the entire `service` directory structure so that nested route, middleware, and storage files are included in production.

## DB & Authentication Deliverable Notes

- **MongoDB Connection & Collections (`service/database.js`):** Learned how to connect an Express backend to MongoDB Atlas using `MongoClient` and keep credentials out of version control by storing them in `dbConfig.json` (listed in `.gitignore`) and copying them during deployment via `deployService.sh`.
- **Async Refactoring:** Replacing in-memory JavaScript arrays with MongoDB queries required converting route handlers and auth helpers (`startSession`, `endSession`, `verifyAuth`) to `async`/`await` functions and checking `deletedCount` on `deleteOne` operations.
- **Password Hashing & Session Tokens:** Used `bcryptjs` to hash passwords before inserting user documents into the `user` collection, and stored UUID session tokens on the user record paired with `httpOnly` cookies (`secure: process.env.NODE_ENV === 'production'`) so authentication works both on `http://localhost` during VS Code debugging and over HTTPS in production.
- **Debugging & Verification:** Used VS Code's JavaScript Debug Terminal and browser DevTools (Network & Application tabs) to inspect `/api/auth` cookies and verify that user entries, favorites, and friends persist in MongoDB across Node server restarts.

## General Notes
I love web programming!
