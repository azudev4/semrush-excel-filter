export interface Commit {
  sha: string;
  commit: {
    author: {
      name: string;
      date: string;
    };
    message: string;
  };
  html_url: string;
  author: {
    avatar_url: string;
    login: string;
    html_url: string;
  } | null;
}

export interface FormattedCommit {
  id: string;
  message: string;
  date: string;
  author: string;
  authorUrl: string;
  avatarUrl: string;
  commitUrl: string;
}

export async function fetchGithubCommits(
  owner: string = 'azudev4',
  repo: string = 'semrush-excel-filter',
  limit: number = 10
): Promise<FormattedCommit[]> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits?per_page=${limit}`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
        },
        next: { revalidate: 3600 } // Revalidate cache every hour
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const commits: Commit[] = await response.json();

    return commits.map(commit => ({
      id: commit.sha,
      message: commit.commit.message,
      date: commit.commit.author.date,
      author: commit.commit.author.name,
      authorUrl: commit.author?.html_url || '#',
      avatarUrl: commit.author?.avatar_url || 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
      commitUrl: commit.html_url
    }));
  } catch (error) {
    console.error("Error fetching GitHub commits:", error);
    return [];
  }
} 