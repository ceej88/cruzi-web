import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { usePublicPage } from '@/hooks/usePublicPage';
import { ArrowLeft, Calendar, User, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import ShareBar from '@/components/blog/ShareBar';

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  meta_description: string | null;
  excerpt: string | null;
  author: string | null;
  published_at: string | null;
  cover_image_url: string | null;
  keywords: string[] | null;
}

const estimateReadTime = (html: string): number => {
  const text = html.replace(/<[^>]*>/g, '');
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.round(words / 220));
};

const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useDocumentTitle(post?.title ? `${post.title} — Cruzi Blog` : 'Cruzi Blog');
  usePublicPage();

  const readTime = useMemo(() => (post ? estimateReadTime(post.content) : 0), [post]);
  const shareUrl = post ? `https://cruzi.co.uk/blog/${post.slug}` : '';

  // Dynamic meta tags
  useEffect(() => {
    if (!post) return;

    const setMeta = (name: string, content: string, property?: boolean) => {
      const attr = property ? 'property' : 'name';
      let tag = document.querySelector(`meta[${attr}="${name}"]`);
      if (tag) {
        tag.setAttribute('content', content);
      } else {
        tag = document.createElement('meta');
        tag.setAttribute(attr, name);
        tag.setAttribute('content', content);
        document.head.appendChild(tag);
      }
    };

    if (post.meta_description) {
      setMeta('description', post.meta_description);
      setMeta('og:description', post.meta_description, true);
    }
    setMeta('og:title', post.title, true);
    setMeta('og:type', 'article', true);
    setMeta('og:url', shareUrl, true);
    const ogImage = post.cover_image_url || 'https://cruzi.co.uk/og-social-share.png';
    setMeta('twitter:card', 'summary_large_image');
    setMeta('og:image', ogImage, true);
    setMeta('og:image:width', '1200', true);
    setMeta('og:image:height', '630', true);
    setMeta('twitter:title', post.title);
    setMeta('twitter:image', ogImage);
    if (post.keywords && post.keywords.length > 0) {
      setMeta('keywords', post.keywords.join(', '));
    }
    if (post.meta_description) setMeta('twitter:description', post.meta_description);

    // Article structured data
    const ld = document.createElement('script');
    ld.type = 'application/ld+json';
    ld.id = 'blog-post-ld';
    ld.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.meta_description || post.excerpt || '',
      datePublished: post.published_at,
      author: { '@type': 'Person', name: post.author || 'Cruzi' },
      publisher: { '@type': 'Organization', name: 'Cruzi', url: 'https://cruzi.co.uk' },
      url: shareUrl,
    });
    document.head.appendChild(ld);

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = shareUrl;

    return () => {
      if (canonical) canonical.remove();
      const ldEl = document.getElementById('blog-post-ld');
      if (ldEl) ldEl.remove();
    };
  }, [post, shareUrl]);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) { setNotFound(true); setLoading(false); return; }
      const { data } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle();
      if (!data) setNotFound(true);
      else setPost(data as Post);
      setLoading(false);
    };
    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-black text-foreground">Post Not Found</h1>
          <p className="text-muted-foreground">This blog post doesn't exist or has been removed.</p>
          <Link to="/blog" className="text-primary font-bold hover:underline">← Back to Blog</Link>
        </div>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12 max-w-3xl">
        {/* Back link */}
        <Link to="/blog" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-medium mb-10">
          <ArrowLeft className="h-4 w-4" /> Back to Blog
        </Link>

        {/* Hero Image */}
        {post.cover_image_url && (
          <img src={post.cover_image_url} alt={post.title} className="w-full rounded-2xl mb-8 max-h-[400px] object-cover" />
        )}

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight mb-6">
          {post.title}
        </h1>

        {/* Meta Row */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
          {post.author && (
            <span className="flex items-center gap-1.5">
              <User className="h-4 w-4" /> {post.author}
            </span>
          )}
          {post.published_at && (
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" /> {format(new Date(post.published_at), 'dd MMMM yyyy')}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" /> {readTime} min read
          </span>
        </div>

        {/* Share Bar (top) */}
        <div className="mb-10 pb-8 border-b border-border">
          <ShareBar title={post.title} url={shareUrl} description={post.meta_description || post.excerpt || undefined} />
        </div>

        {/* Content */}
        <article
          className="prose prose-lg prose-slate dark:prose-invert max-w-none mb-12
            prose-headings:font-bold prose-headings:text-foreground
            prose-p:text-muted-foreground prose-p:leading-relaxed
            prose-a:text-primary prose-a:font-semibold
            prose-strong:text-foreground
            prose-li:text-muted-foreground
            prose-img:rounded-2xl"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Share Bar (bottom) */}
        <div className="py-8 border-t border-border mb-12">
          <p className="text-sm font-bold text-foreground mb-3">Enjoyed this article? Share it with your network.</p>
          <ShareBar title={post.title} url={shareUrl} description={post.meta_description || post.excerpt || undefined} />
        </div>

        {/* CTA */}
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Try Cruzi free for 30 days
          </h2>
          <p className="text-muted-foreground mb-6">No card needed. Built for UK driving instructors.</p>
          <Link to="/">
            <Button className="bg-primary text-primary-foreground font-bold px-8 py-3 rounded-xl">
              Get Started Free
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BlogPost;
