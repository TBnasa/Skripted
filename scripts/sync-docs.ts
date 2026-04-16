import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import crypto from 'crypto';
import fetch from 'node-fetch';

// Environment variables should be set in GitHub Action secrets
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
});

interface RepoDoc {
  owner: string;
  repo: string;
  path: string;
}

const TARGET_REPOS: RepoDoc[] = [
  { owner: 'SkriptLang', repo: 'Skript', path: 'docs' },
  { owner: 'ShaneBee', repo: 'SkBee', path: 'docs' },
  { owner: 'SkriptLang', repo: 'skript-docs', path: 'docs' }
];

async function getFilesRecursively(owner: string, repo: string, path: string): Promise<any[]> {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `token ${process.env.GITHUB_TOKEN}`
    }
  });

  if (!response.ok) {
    console.error(`Error fetching ${url}: ${response.statusText}`);
    return [];
  }

  const items = (await response.json()) as any[];
  let files: any[] = [];

  for (const item of items) {
    if (item.type === 'file' && item.name.endsWith('.md')) {
      files.push(item);
    } else if (item.type === 'dir') {
      const subFiles = await getFilesRecursively(owner, repo, item.path);
      files = [...files, ...subFiles];
    }
  }

  return files;
}

async function syncDocs() {
  console.log('--- Starting Skript Documentation Sync ---');

  for (const target of TARGET_REPOS) {
    console.log(`Processing repo: ${target.owner}/${target.repo}...`);
    const files = await getFilesRecursively(target.owner, target.repo, target.path);
    console.log(`Found ${files.length} markdown files.`);

    for (const file of files) {
      try {
        const fileResponse = await fetch(file.download_url);
        const content = await fileResponse.text();
        const path = `${target.owner}/${target.repo}/${file.path}`;

        // Calculate checksum
        const checksum = crypto.createHash('sha256').update(content).digest('hex');

        // Check if modified
        const { data: existing } = await supabase
          .from('skript_docs')
          .select('checksum')
          .eq('file_path', path)
          .single();

        if (existing && existing.checksum === checksum) {
          console.log(`- SKIPPED: ${path} (No changes)`);
          continue;
        }

        console.log(`- UPSERTING: ${path}...`);

        // Generate embedding
        const embeddingRes = await openai.embeddings.create({
          model: 'text-embedding-3-small',
          input: content.substring(0, 8000) // Truncate if too large for embedding
        });

        const embedding = embeddingRes.data[0].embedding;

        // Upsert to Supabase
        const { error } = await supabase.from('skript_docs').upsert({
          file_path: path,
          content,
          checksum,
          embedding,
          updated_at: new Date().toISOString()
        });

        if (error) {
          console.error(`  Error upserting ${path}:`, error.message);
        } else {
          console.log(`  Successfully synced ${path}`);
        }
      } catch (err) {
        console.error(`  Critical error processing ${file.path}:`, err);
      }
    }
  }

  console.log('--- Sync Completed ---');
}

syncDocs().catch(console.error);
