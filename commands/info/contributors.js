const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { execSync } = require('node:child_process');
const { EMBED_COLOR, GITHUB_REPO } = require('../../config/constants');

function githubHeaders() {
  return {
    'User-Agent': 'vanilla-discord-bot',
    ...(process.env.GITHUB_TOKEN && { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }),
  };
}

async function getLoginsBySha() {
  const logins = new Map();
  let page = 1;

  while (true) {
    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/commits?per_page=100&page=${page}`,
      { headers: githubHeaders() },
    );

    if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);

    const commits = await res.json();
    if (!commits.length) break;

    for (const c of commits) {
      if (c.author?.login) logins.set(c.sha, c.author.login);
    }

    if (commits.length < 100) break;
    page++;
  }

  return logins;
}

function getGitStatsBySha() {
  const output = execSync('git log --numstat --format="COMMIT:%H"', {
    encoding: 'utf8',
    cwd: process.cwd(),
  });

  const commits = new Map();
  let current = null;

  for (const line of output.split('\n')) {
    if (line.startsWith('COMMIT:')) {
      current = { additions: 0, deletions: 0 };
      commits.set(line.slice(7).trim(), current);
    } else if (current && /^\d/.test(line)) {
      const [add, del] = line.split('\t');
      current.additions += parseInt(add) || 0;
      current.deletions += parseInt(del) || 0;
    }
  }

  return commits;
}

function formatNumber(n) {
  return n.toLocaleString('en-US');
}

const MEDALS = ['🥇', '🥈', '🥉'];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('contributors')
    .setDescription('Mostra la lista dei contributor del bot'),

  async execute(interaction) {
    await interaction.deferReply();

    const [loginsBySha, statsBySha] = await Promise.all([
      getLoginsBySha(),
      getGitStatsBySha(),
    ]);

    // Join GitHub logins with local git stats using commit SHA — the only common key
    // between the two independent data sources
    const contributors = new Map();
    for (const [sha, login] of loginsBySha) {
      let entry = contributors.get(login);
      if (!entry) {
        entry = { commits: 0, additions: 0, deletions: 0 };
        contributors.set(login, entry);
      }
      entry.commits++;
      const gitStats = statsBySha.get(sha);
      if (gitStats) {
        entry.additions += gitStats.additions;
        entry.deletions += gitStats.deletions;
      }
    }

    const sorted = [...contributors.entries()]
      .map(([username, stats]) => ({ username, ...stats }))
      .sort((a, b) => b.commits - a.commits);

    const lines = sorted.map((c, i) => {
      const medal = MEDALS[i] ?? `**${i + 1}.**`;
      return `${medal} **${c.username}**\n┗ ${c.commits} commits · \`+${formatNumber(c.additions)}\` \`-${formatNumber(c.deletions)}\``;
    });

    const embed = new EmbedBuilder()
      .setColor(EMBED_COLOR)
      .setTitle('👥 Contributors')
      .setDescription(`─────────────────────\n\n${lines.join('\n\n')}\n\n[Vuoi contribuire? Il progetto è open source!](https://github.com/${GITHUB_REPO})`);

    await interaction.editReply({ embeds: [embed] });
  },
};
