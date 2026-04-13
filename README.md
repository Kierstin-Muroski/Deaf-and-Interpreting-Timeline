# Sign Language Interpreting & Deaf History Timeline

This is a simple static website designed for GitHub Pages.

## What to edit

Your timeline data lives here:

- `data/timeline_master.csv`

The website reads that file automatically.

## The easiest workflow

1. Open the repository on GitHub.
2. Click `data/timeline_master.csv`.
3. Click the pencil icon to edit the file in the browser.
4. Add or revise rows.
5. Commit the change.
6. Refresh the site after GitHub Pages republishes.

## Recommended editing workflow

If you prefer working in Google Sheets:

1. Keep your research in Google Sheets.
2. Export the master tab as CSV.
3. Replace `data/timeline_master.csv` in GitHub.
4. Commit the change.

## Publish with GitHub Pages

1. Create a new GitHub repository.
2. Upload all files from this folder.
3. Open the repository `Settings`.
4. Click `Pages` in the sidebar.
5. Under `Build and deployment`, set:
   - **Source:** `Deploy from a branch`
   - **Branch:** `main`
   - **Folder:** `/ (root)`
6. Save.
7. Wait for GitHub Pages to publish your site.

## Suggested repository name

Use something simple, like:

- `interpreting-history-timeline`
- `deaf-interpreting-timeline`

## Structure

- `index.html` — the site
- `style.css` — styling
- `app.js` — filtering/search logic
- `data/timeline_master.csv` — your editable data

## Tips

- Keep `Start_Year` filled in for every row.
- Keep `Verification_Status` honest.
- Use `Public_Timeline_Priority` to control what gets highlighted first when filtering.
- Add image URLs later if you want to extend the site.

## Easy future upgrades

Later, you can add:

- images
- a map view
- a leadership-only page
- a compare view by organization
- a dedicated laws-and-policy filter
