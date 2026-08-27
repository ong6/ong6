// Rewrites the CURRENTLY block in README.md from the latest commits on my pinned repos.
// Run by .github/workflows/update-readme.yml on a schedule.

const LOGIN = "ong6";
const START = "<!-- CURRENTLY:START -->";
const END = "<!-- CURRENTLY:END -->";

const query = `
  query($login: String!) {
    user(login: $login) {
      pinnedItems(first: 6, types: REPOSITORY) {
        nodes {
          ... on Repository {
            name
            url
            description
            primaryLanguage { name }
            defaultBranchRef {
              target {
                ... on Commit {
                  history(first: 1) {
                    nodes { messageHeadline committedDate url }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

const res = await fetch("https://api.github.com/graphql", {
	method: "POST",
	headers: {
		Authorization: `bearer ${process.env.GITHUB_TOKEN}`,
		"Content-Type": "application/json",
	},
	body: JSON.stringify({ query, variables: { login: LOGIN } }),
});

if (!res.ok) throw new Error(`GitHub API ${res.status}: ${await res.text()}`);
const body = await res.json();
if (body.errors) throw new Error(JSON.stringify(body.errors));

const repos = body.data.user.pinnedItems.nodes.filter((r) => r && r.name !== LOGIN);

const relative = (iso) => {
	const days = Math.floor((Date.now() - new Date(iso)) / 86400000);
	if (days <= 0) return "today";
	if (days === 1) return "yesterday";
	if (days < 30) return `${days} days ago`;
	const months = Math.round(days / 30);
	return months === 1 ? "last month" : `${months} months ago`;
};

const rows = repos.map((r) => {
	const commit = r.defaultBranchRef?.target?.history?.nodes?.[0];
	const lang = r.primaryLanguage?.name ?? "—";
	const last = commit
		? `[${commit.messageHeadline}](${commit.url}) · ${relative(commit.committedDate)}`
		: "—";
	return `| [${r.name}](${r.url}) | ${lang} | ${last} |`;
});

const block = [
	START,
	"",
	"| Repository | Language | Last commit |",
	"|---|---|---|",
	...rows,
	"",
	`<sub>Generated from my pinned repositories and their latest commits by a GitHub Action I run when the pins change. Source: [\`scripts/update-readme.mjs\`](https://github.com/${LOGIN}/${LOGIN}/blob/master/scripts/update-readme.mjs).</sub>`,
	"",
	END,
].join("\n");

const fs = await import("node:fs/promises");
const readme = await fs.readFile("README.md", "utf8");
const start = readme.indexOf(START);
const end = readme.indexOf(END);
if (start === -1 || end === -1) throw new Error("CURRENTLY markers not found in README.md");

const next = readme.slice(0, start) + block + readme.slice(end + END.length);
if (next === readme) {
	console.log("No change.");
} else {
	await fs.writeFile("README.md", next);
	console.log(`Updated ${rows.length} rows.`);
}
