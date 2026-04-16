import { z } from 'zod';

export const GalleryPostSchema = z.object({
  title: z.string().min(3, 'Başlık en az 3 karakter olmalıdır').max(100, 'Başlık çok uzun'),
  description: z.string().max(1000, 'Açıklama çok uzun').optional().nullable(),
  codeSnippet: z.string().min(1, 'Kod alanı boş bırakılamaz').max(20000, 'Kod çok uzun'),
  imageUrls: z.array(z.string().url('Geçerli bir URL giriniz')).max(5, 'En fazla 5 görsel yüklenebilir').default([]),
  category: z.enum(['Economy', 'Admin', 'Minigame', 'Chat', 'Security', 'Other']).default('Other'),
  tags: z.array(z.string()).max(5, 'En fazla 5 etiket eklenebilir').default([]),
});

export type GalleryPostInput = z.infer<typeof GalleryPostSchema>;

export const GalleryCommentSchema = z.object({
  content: z.string().min(2, 'Yorum en az 2 karakter olmalıdır').max(500, 'Yorum çok uzun'),
  parentId: z.string().uuid('Geçerli bir ID giriniz').optional().nullable(),
});

export type GalleryCommentInput = z.infer<typeof GalleryCommentSchema>;

export const GalleryFilterSchema = z.object({
  limit: z.number().int().positive().default(50).optional(),
  filter: z.string().optional(),
  category: z.string().optional(),
  userId: z.string().optional().nullable(),
});

export type GalleryFilterOptions = z.infer<typeof GalleryFilterSchema>;
