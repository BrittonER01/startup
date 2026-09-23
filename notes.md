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

## React

Interesting things I have learned about React

## General Notes
I love web programming!
