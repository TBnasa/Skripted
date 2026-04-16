import { clerkClient } from '@clerk/nextjs/server';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { Octokit } from 'octokit';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const client = await clerkClient();
    const response = await client.users.getUserOauthAccessToken(userId, 'oauth_github');
    const token = response.data[0]?.token;

    if (!token) {
      return NextResponse.json({ error: 'GitHub token not found. Please relogin with GitHub.' }, { status: 404 });
    }

    const octokit = new Octokit({ auth: token });
    const { data: repos } = await octokit.rest.repos.listForAuthenticatedUser({
      sort: 'updated',
      per_page: 100,
    });

    return NextResponse.json({ repos });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { repo, path, message, content, sha } = await req.json();
    const client = await clerkClient();
    const response = await client.users.getUserOauthAccessToken(userId, 'oauth_github');
    const token = response.data[0]?.token;

    if (!token) return NextResponse.json({ error: 'GitHub token not found' }, { status: 404 });

    const octokit = new Octokit({ auth: token });
    const [owner, repoName] = repo.split('/');

    const { data } = await octokit.rest.repos.createOrUpdateFileContents({
      owner,
      repo: repoName,
      path,
      message,
      content: Buffer.from(content).toString('base64'),
      sha: sha || undefined,
    });

    return NextResponse.json({ url: data.commit.html_url });
  } catch (error: any) {
    if (error.status === 404) {
      return NextResponse.json({ error: 'Repository permissions missing or repo not found. Please check GitHub scopes.' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
