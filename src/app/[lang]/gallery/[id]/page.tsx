import { Metadata } from 'next';
import { GalleryService } from '@/services/server/gallery.server';
import GalleryPostContent from '@/components/GalleryPostContent';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { Code } from 'lucide-react';
import { notFound } from 'next/navigation';

export const runtime = 'nodejs';

async function getPost(id: string) {
  try {
    return await GalleryService.getPostById(id);
  } catch (error) {
    return null;
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  const post = await getPost(id);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: `${post.title} — Skript Gallery`,
    description: post.description || `Check out this Skript by ${post.author_name} on Skripted Gallery.`,
    openGraph: {
      title: post.title,
      description: post.description || `A Minecraft Skript shared via Skripted Engine.`,
      images: post.image_urls?.[0] ? [{ url: post.image_urls[0] }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description || `Check out this Skript on Skripted Gallery.`,
      images: post.image_urls?.[0] ? [post.image_urls[0]] : [],
    },
  };
}

export default async function GalleryPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getPost(id);

  if (!post) {
    notFound();
  }

  return <GalleryPostContent post={post} />;
}
