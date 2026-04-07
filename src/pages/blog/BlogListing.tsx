import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { usePublicPage } from '@/hooks/usePublicPage';
import { ArrowRight, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  published_at: string | null;
  author: string | null;
  cover_image_url: string | null;
}

const estimateReadTime = (html: string): number => {
  const text = html.replace(/<[^>]*>/g, '');
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.round(words / 220));
};

const BlogListing: React.FC = () => {
  useDocumentTitle('Cruzi Blog — Driving Instructor Tips & Resources');
  usePublicPage();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const meta = document.querySelector('meta[name="description"]');
    const desc = 'Advice, guides and insights for UK driving instructors and learner drivers from the Cruzi team.';
    if (meta) meta.setAttribute('content', desc);
    else {
      const tag = document.createElement('meta');
      tag.name = 'description';
      tag.content = desc;
      document.head.appendChild(tag);
    }
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      const { data } = await (supabase as any)
        .from('blog_posts')
        .select('id, title, slug, excerpt, content, published_at, author, cover_image_url')
        .eq('status', 'published')
        .order('published_at', { ascending: false });
      setPosts((data as BlogPost[]) || []);
      setLoading(false);
    };
    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary/5 border-b border-border">
        <div className="container mx-auto px-6 py-20 text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-8 text-muted-foreground hover:text-primary transition-colors font-medium">
            ← Back to Cruzi
          </Link>
          <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight mb-4">
            Cruzi Blog
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tips, guides and insights for UK driving instructors and learner drivers.
          </p>
        </div>
      </div>

      {/* Posts */}
      <div className="container mx-auto px-6 py-16">
        {loading ? (
          <div className="text-center text-muted-foreground py-20">Loading posts…</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-muted-foreground mb-4">No posts yet — check back soon!</p>
            <Link to="/" className="text-primary font-bold hover:underline">← Return home</Link>
          </div>
        ) : (
          <div className="grid gap-8 max-w-3xl mx-auto">
            {posts.map((post) => (
              <Link
                key={post.id}
                to={`/blog/${post.slug}`}
                className="group block bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all"
              >
                {post.cover_image_url && (
                  <img src={post.cover_image_url} alt={post.title} className="w-full h-48 object-cover" loading="lazy" />
                )}
                <div className="p-8">
                <h2 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors mb-3">
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p className="text-muted-foreground leading-relaxed mb-4">{post.excerpt}</p>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      {post.published_at && format(new Date(post.published_at), 'dd MMM yyyy')}
                    </span>
                    {post.author && <span>· {post.author}</span>}
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {estimateReadTime(post.content)} min read
                    </span>
                  </div>
                  <span className="text-primary font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                    Read more <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogListing;
