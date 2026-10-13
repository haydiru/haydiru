// Renders assets/stats.svg from the GitHub REST API.
// Counts my commits in the last 12 months in every repository I can access:
// owned, collaborator, and organisation repositories, public and private.
// A commit is mine when it is linked to my login or authored with one of my emails.
// Private repository names are never written to the SVG, only counts.
//
// Usage:
//   STATS_TOKEN=<classic token with repo scope> STATS_EMAILS=a@x.com,b@y.com node scripts/stats.mjs [login]

import { writeFileSync } from "node:fs";

const token = process.env.STATS_TOKEN;
if (!token) throw new Error("STATS_TOKEN is not set");
const login = process.argv[2] || "haydiru";

const to = new Date();
const from = new Date(to.getTime() - 365 * 24 * 3600 * 1000);

async function api(path) {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" },
  });
  if (res.status === 409) return { data: [], next: null }; // empty repository
  if (!res.ok) throw new Error(`${res.status} ${path}`);
  const next = /<https:\/\/api\.github\.com([^>]+)>;\s*rel="next"/.exec(res.headers.get("link") || "");
  return { data: await res.json(), next: next ? next[1] : null };
}
async function all(path) {
  const out = [];
  for (let p = path; p; ) {
    const { data, next } = await api(p);
    out.push(...data);
    p = next;
  }
  return out;
}

const me = (await api(`/users/${login}`)).data;
const emails = new Set(
  [`${login}@users.noreply.github.com`, `${me.id}+${login}@users.noreply.github.com`, ...(process.env.STATS_EMAILS || "").split(",")]
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),
);
const isMine = (c) =>
  c.author?.login?.toLowerCase() === login.toLowerCase() || emails.has((c.commit.author.email || "").toLowerCase());

const repoList = (await all("/user/repos?affiliation=owner,collaborator,organization_member&per_page=100")).filter(
  (r) => !r.fork && new Date(r.pushed_at) >= from,
);

const weeks = new Array(52).fill(0);
const weekMs = 7 * 24 * 3600 * 1000;
const repos = [];
for (const r of repoList) {
  const commits = (await all(`/repos/${r.full_name}/commits?since=${from.toISOString()}&per_page=100`)).filter(isMine);
  if (!commits.length) continue;
  for (const c of commits) {
    const i = 51 - Math.floor((to - new Date(c.commit.author.date)) / weekMs);
    if (i >= 0 && i < 52) weeks[i]++;
  }
  const languages = (await api(`/repos/${r.full_name}/languages`)).data;
  repos.push({ count: commits.length, isPrivate: r.private, owner: r.owner.login, languages });
}

// Summary counts
const repoCount = repos.length;
const privateCount = repos.filter((r) => r.isPrivate).length;
const othersCount = repos.filter((r) => r.owner.toLowerCase() !== login.toLowerCase()).length;
const commits = repos.reduce((s, r) => s + r.count, 0);

// Languages, weighted by my commits: each repo's language mix times my commit count in it
const colors = {
  TypeScript: "#3178c6", JavaScript: "#f1e05a", Dart: "#00b4ab", PHP: "#4f5d95", "C#": "#178600", HTML: "#e34c26",
  CSS: "#563d7c", Python: "#3572a5", PLpgSQL: "#336790", Kotlin: "#a97bff", Swift: "#f05138", Shell: "#89e051",
  "C++": "#f34b7d", C: "#555555", Java: "#b07219", Go: "#00add8", Rust: "#dea584", Ruby: "#701516", Vue: "#41b883",
  SCSS: "#c6538c", Blade: "#f7523f", Hack: "#878787", TSQL: "#e38c00", Dockerfile: "#384d54", CMake: "#da3434",
};
const langs = new Map();
for (const { count, languages } of repos) {
  const total = Object.values(languages).reduce((s, v) => s + v, 0);
  if (!total) continue;
  for (const [name, size] of Object.entries(languages)) {
    const cur = langs.get(name) || { name, color: colors[name] || "#8b949e", w: 0 };
    cur.w += (size / total) * count;
    langs.set(name, cur);
  }
}
const langTotal = [...langs.values()].reduce((s, l) => s + l.w, 0) || 1;
const ranked = [...langs.values()].sort((a, b) => b.w - a.w).map((l) => ({ ...l, pct: (l.w / langTotal) * 100 }));
const top = ranked.slice(0, 6);
const restPct = ranked.slice(6).reduce((s, l) => s + l.pct, 0);
if (restPct >= 0.5) top.push({ name: "Other", color: "#8b949e", pct: restPct });

// Weekly activity
const maxWeek = Math.max(1, ...weeks);

// Render
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const n = (v) => v.toLocaleString("en-US");
const plural = (v, one, many) => `${n(v)} ${v === 1 ? one : many}`;

const lines = [
  `${plural(commits, "commit", "commits")} in the last 12 months`,
  `across ${plural(repoCount, "repository", "repositories")}, ${n(privateCount)} of them private`,
  `and ${n(othersCount)} owned by other people or teams.`,
];

const chartX = 56, chartW = 504, chartBase = 300, chartH = 92;
const step = chartW / weeks.length;
const bars = weeks
  .map((v, i) => {
    const h = v === 0 ? 1 : Math.max(2, (v / maxWeek) * chartH);
    const cls = v === 0 ? "rule-fill" : "accent";
    return `<rect class="${cls}" x="${(chartX + i * step).toFixed(1)}" y="${(chartBase - h).toFixed(1)}" width="${Math.max(2, step - 3).toFixed(1)}" height="${h.toFixed(1)}"/>`;
  })
  .join("\n  ");

const barX = 640, barW = 516;
let acc = 0;
const segments = top
  .map((l) => {
    const w = (l.pct / 100) * barW;
    const r = `<rect x="${(barX + acc).toFixed(1)}" y="92" width="${Math.max(0, w - 2).toFixed(1)}" height="10" fill="${l.color}"/>`;
    acc += w;
    return r;
  })
  .join("\n  ");
const rows = top
  .map((l, i) => {
    const y = 140 + i * 30;
    return `<rect x="640" y="${y - 9}" width="8" height="8" fill="${l.color}"/>
  <text class="sans fg" x="658" y="${y}" font-size="15">${esc(l.name)}</text>
  <text class="mono muted" x="1156" y="${y}" font-size="13" text-anchor="end">${l.pct.toFixed(1)}%</text>
  <line class="rule" x1="640" y1="${y + 11}" x2="1156" y2="${y + 11}"/>`;
  })
  .join("\n  ");

const updated = to.toISOString().slice(0, 10);

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 380" width="1200" height="380" role="img" aria-label="GitHub activity for ${esc(login)} over the last 12 months">
  <style>
    :root { --bg:#ffffff; --fg:#1f2328; --muted:#59636e; --line:#d1d9e0; --accent:#0969da; }
    @media (prefers-color-scheme: dark) {
      :root { --bg:#0d1117; --fg:#e6edf3; --muted:#9198a1; --line:#3d444d; --accent:#4493f8; }
    }
    .bg { fill: var(--bg); stroke: var(--line); }
    .sans { font-family: -apple-system, "Segoe UI", Helvetica, Arial, sans-serif; }
    .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
    .fg { fill: var(--fg); }
    .muted { fill: var(--muted); }
    .accent { fill: var(--accent); }
    .rule-fill { fill: var(--line); }
    .rule { stroke: var(--line); stroke-width: 1; }
  </style>

  <rect class="bg" x="0.5" y="0.5" width="1199" height="379" rx="8"/>
  <line class="rule" x1="600" y1="1" x2="600" y2="330"/>

  <rect class="accent" x="56" y="50" width="8" height="8"/>
  <text class="mono muted" x="74" y="58" font-size="12" letter-spacing="1">FIG.2  LAST 12 MONTHS, EVERY REPOSITORY I WORK IN</text>

  <text class="sans fg" x="56" y="104" font-size="20">${esc(lines[0])}</text>
  <text class="sans fg" x="56" y="132" font-size="20">${esc(lines[1])}</text>
  <text class="sans muted" x="56" y="160" font-size="20">${esc(lines[2])}</text>

  ${bars}
  <line class="rule" x1="${chartX}" y1="${chartBase + 0.5}" x2="${chartX + chartW}" y2="${chartBase + 0.5}"/>
  <text class="mono muted" x="${chartX}" y="${chartBase + 22}" font-size="11">52 weeks ago</text>
  <text class="mono muted" x="${chartX + chartW}" y="${chartBase + 22}" font-size="11" text-anchor="end">this week</text>

  <text class="mono muted" x="640" y="58" font-size="12" letter-spacing="1">LANGUAGES, WEIGHTED BY MY COMMITS</text>
  ${segments}
  ${rows}

  <text class="mono muted" x="56" y="356" font-size="11">updated ${updated} · regenerated daily by .github/workflows/stats.yml · private repositories are counted, never named</text>
</svg>
`;

writeFileSync(new URL("../assets/stats.svg", import.meta.url), svg);
console.log(`stats.svg: ${commits} commits, ${repoCount} repos (${privateCount} private, ${othersCount} others), ${top.length} languages`);
