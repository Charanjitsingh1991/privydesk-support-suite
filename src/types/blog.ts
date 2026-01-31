export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  featured_image: string;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string[] | null;
  status: 'draft' | 'published' | 'archived';
  published_at: string;
  created_at: string;
  updated_at: string;
  read_time: number;
  views: number;
  tags: string[] | null;
}
