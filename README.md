# Materia Dashboard

A personal editorial dashboard for *Materia: A bestiary of made things.*

Your data syncs across all your devices via Supabase (free cloud database).
Hosted for free on GitHub Pages — no monthly costs, no expiring trials.

---

## Setup: GitHub Pages + Supabase (15 minutes total)

You need two free accounts: **GitHub** (hosts the site) and **Supabase** (syncs your data).

### Step 1: Set up Supabase (your database — 5 minutes)

1. Go to [supabase.com](https://supabase.com) and click **Start your project** — sign in with GitHub
2. Click **New project**
   - Name it `materia`
   - Choose a database password (save it somewhere, but you won't need it day-to-day)
   - Pick the region closest to you
   - Click **Create new project** (takes about a minute)
3. Once it's ready, click **SQL Editor** in the left sidebar
4. Paste this and click **Run**:

```sql
CREATE TABLE materia_state (
  id TEXT PRIMARY KEY DEFAULT 'default',
  data JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO materia_state (id, data) VALUES ('default', '{}');

ALTER TABLE materia_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access" ON materia_state
  FOR ALL USING (true) WITH CHECK (true);
```

5. You should see "Success."
6. Go to **Settings → API** in the left sidebar. Copy these two values (you'll need them in Step 3):
   - **Project URL** — looks like `https://abc123xyz.supabase.co`
   - **anon public** key — a long string under "Project API keys"

### Step 2: Push to GitHub

1. Go to [github.com](https://github.com) and sign in (or sign up — free)
2. Click **+** in the top right → **New repository**
3. Name it `materia-dashboard`, keep it **Private**, click **Create repository**
4. Open **Terminal** on your computer and run these commands one at a time:

```bash
cd ~/path/to/Newsletter/materia-dashboard
```

(Tip: type `cd ` then drag the `materia-dashboard` folder onto Terminal to auto-fill the path.)

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/materia-dashboard.git
git push -u origin main
```

Replace `YOUR-USERNAME` with your actual GitHub username.

### Step 3: Add your Supabase secrets

Your Supabase credentials need to be stored as GitHub secrets so the build can use them without exposing them publicly.

1. On GitHub, go to your `materia-dashboard` repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add these two:

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | Your Project URL from Step 1.6 |
| `VITE_SUPABASE_ANON_KEY` | Your anon public key from Step 1.6 |

### Step 4: Enable GitHub Pages

1. In your repository, go to **Settings** → **Pages** (in the left sidebar)
2. Under **Build and deployment**, set **Source** to **GitHub Actions**
3. That's it — the workflow file already included in this project handles the rest

The first deploy happens automatically after you push and set this up. In about a minute, your site will be live at:

```
https://YOUR-USERNAME.github.io/materia-dashboard/
```

Bookmark that URL. That's your dashboard, from any device.

---

## Updating the dashboard later

Whenever you make changes, push to GitHub and it auto-deploys:

```bash
cd ~/path/to/Newsletter/materia-dashboard
git add .
git commit -m "Update dashboard"
git push
```

The live site updates in about a minute.

---

## Running locally (optional)

If you want to run the dashboard on your own machine during development:

1. Install [Node.js](https://nodejs.org) (LTS version)
2. Create a `.env` file in the `materia-dashboard` folder:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

3. Run:

```bash
npm install
npm run dev
```

4. Open `http://localhost:5173` — your data syncs with the same cloud database.

---

## Important: repo name and base path

The Vite config (`vite.config.js`) has `base: '/materia-dashboard/'` to match the default repo name. If you name your GitHub repo something different, update the `base` value to match:

```js
base: '/your-repo-name/',
```

If you ever set up a custom domain, change it to `'/'`.

---

## How data sync works

- Every change is saved to your browser instantly (so it feels fast)
- After 1.5 seconds of inactivity, changes sync to the cloud
- Opening the dashboard on another device pulls the latest data from the cloud
- The sidebar shows a sync indicator: gold cloud = synced, spinning = syncing
- If you're offline, changes save locally and sync next time you connect

## Files

- `src/Dashboard.jsx` — the main dashboard component (all essays, UI, and state)
- `src/sync.js` — cloud sync logic (Supabase connection)
- `supabase-setup.sql` — run once in Supabase to create your table
- `.env.example` — template for local environment variables
- `.github/workflows/deploy.yml` — auto-deploys to GitHub Pages on every push
