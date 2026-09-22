# EuroLeague Standings 2026/27

A lightweight static website for building a predicted final regular season table for the 2026/27 EuroLeague season. Visitors can drag teams into order, keep their standings saved in the browser, and download a polished PNG image.

## Run Locally

Open `index.html` in a browser. No install, login, backend, database, or build step is required.

If your browser blocks local file features, use a tiny static server from this folder instead:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Files

- `index.html` - page markup and script/style loading
- `css/style.css` - responsive design, ranking zones, and export-image styling
- `js/teams.js` - 2026/27 team data
- `js/app.js` - drag-and-drop, local saving, reset, randomize, and PNG export
- `js/vendor/` - local copies of SortableJS and html2canvas
- `assets/logos/` - localized team logo PNG files

## Updating Teams Later

Edit `js/teams.js`.

Each team needs:

```js
{
  id: "stable-id",
  name: "Official Team Name",
  shortName: "Short Name",
  country: "Country",
  logo: "assets/logos/team-logo.png"
}
```

Keep each `id` unique. The default ranking order is the order in this file.

## Replacing A Logo

1. Add the new logo file to `assets/logos/`.
2. Keep the image square-ish if possible, with the logo centered and enough padding.
3. Update the matching `logo` path in `js/teams.js`.
4. Open the site and press the download icon in the upper-right corner to confirm the logo appears in the exported PNG.

## Data And Logo Sources

The 2026/27 team list was checked against Euroleague Basketball's official media-center release for the 2026/27 schedule, which confirms 20 teams, a 38-round regular season, six direct playoff teams, and four Play-In teams.

The local logo files were extracted from Euroleague Basketball's official `EL_26_27 teams logos` package in the EuroLeague Hub. Every logo in `assets/logos/` uses that official package as its source.

## Publish On GitHub Pages

1. Create a GitHub repository, for example `euroleague-prediction`.
2. Upload this whole folder to the repository.
3. In GitHub, open the repository settings.
4. Go to `Pages`.
5. Under `Build and deployment`, choose `Deploy from a branch`.
6. Choose the `main` branch and the root folder `/`.
7. Save.
8. GitHub will publish the site at a URL like:

```text
https://your-username.github.io/euroleague-prediction/
```

Because all paths are relative, the site works from a GitHub Pages subdirectory.
