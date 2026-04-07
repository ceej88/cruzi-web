import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Plus, Edit, Trash2, ArrowLeft, CalendarIcon, Eye, Sparkles, Search, FileText, Share2, Loader2, Copy, Check, Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  meta_description: string | null;
  excerpt: string | null;
  author: string | null;
  published_at: string | null;
  status: string;
  created_at: string;
  cover_image_url: string | null;
  keywords: string[] | null;
}

const slugify = (text: string) =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const BlogAdmin: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'edit'>('list');
  const [editingPost, setEditingPost] = useState<Partial<BlogPost> | null>(null);
  const [saving, setSaving] = useState(false);

  // AI state
  const [aiLoading, setAiLoading] = useState(false);
  const [generateTopic, setGenerateTopic] = useState('');
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [showSeoDialog, setShowSeoDialog] = useState(false);
  const [seoSuggestions, setSeoSuggestions] = useState<{ improved_title?: string; improved_meta_description?: string; suggestions?: string[] } | null>(null);
  const [showRepurposeDialog, setShowRepurposeDialog] = useState(false);
  const [socialContent, setSocialContent] = useState<{ instagram?: string; tiktok?: string; linkedin?: string } | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const fetchPosts = async () => {
    const { data } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });
    setPosts((data as BlogPost[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleNew = () => {
    setEditingPost({ title: '', slug: '', content: '', excerpt: '', meta_description: '', author: 'Cruzi Team', status: 'draft', cover_image_url: null, keywords: [] });
    setView('edit');
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost({ ...post });
    setView('edit');
  };

  const handleDelete = async (id: string) => {
    await supabase.from('blog_posts').delete().eq('id', id);
    toast({ title: 'Post deleted' });
    fetchPosts();
  };

  const handleSave = async () => {
    if (!editingPost?.title || !editingPost?.slug || !editingPost?.content) {
      toast({ title: 'Title, slug, and content are required', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const payload = {
      title: editingPost.title,
      slug: editingPost.slug,
      content: editingPost.content,
      excerpt: editingPost.excerpt || null,
      meta_description: editingPost.meta_description || null,
      author: editingPost.author || 'Cruzi Team',
      status: editingPost.status || 'draft',
      published_at: editingPost.published_at || null,
      updated_at: new Date().toISOString(),
      cover_image_url: editingPost.cover_image_url || null,
      keywords: editingPost.keywords || [],
    };

    if (editingPost.id) {
      await supabase.from('blog_posts').update(payload).eq('id', editingPost.id);
    } else {
      await supabase.from('blog_posts').insert(payload);
    }
    toast({ title: editingPost.id ? 'Post updated' : 'Post created' });
    setSaving(false);
    setView('list');
    fetchPosts();
  };

  const handlePublish = () => {
    if (!editingPost) return;
    setEditingPost({ ...editingPost, status: 'published', published_at: new Date().toISOString() });
    toast({ title: 'Status set to published — click Save to confirm' });
  };

  const updateField = (field: string, value: string | null) => {
    if (!editingPost) return;
    const updates: Partial<BlogPost> = { [field]: value };
    if (field === 'title' && (!editingPost.id || editingPost.slug === slugify(editingPost.title || ''))) {
      updates.slug = slugify(value || '');
    }
    setEditingPost({ ...editingPost, ...updates });
  };

  // AI Functions
  const callBlogAI = async (mode: string, extra: Record<string, string> = {}) => {
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('blog-ai', {
        body: { mode, ...extra },
      });
      if (error) throw error;
      if (data?.error) {
        toast({ title: 'AI Error', description: data.error, variant: 'destructive' });
        return null;
      }
      return data;
    } catch (e: any) {
      toast({ title: 'AI Error', description: e.message || 'Something went wrong', variant: 'destructive' });
      return null;
    } finally {
      setAiLoading(false);
    }
  };

  const handleAIGenerate = async () => {
    if (!generateTopic.trim()) return;
    const result = await callBlogAI('generate', { topic: generateTopic });
    if (result) {
      setEditingPost({
        title: result.title || generateTopic,
        slug: result.slug || slugify(result.title || generateTopic),
        content: result.content || '',
        excerpt: result.excerpt || '',
        meta_description: result.meta_description || '',
        author: 'Cruzi Team',
        status: 'draft',
        cover_image_url: null,
        keywords: result.keywords || [],
      });
      setShowGenerateDialog(false);
      setGenerateTopic('');
      setView('edit');
      toast({ title: 'Post generated! Review and edit before publishing.' });
    }
  };

  const handleAIExcerptMeta = async () => {
    if (!editingPost?.content || !editingPost?.title) {
      toast({ title: 'Write content first', variant: 'destructive' });
      return;
    }
    const result = await callBlogAI('excerpt_meta', { title: editingPost.title, content: editingPost.content });
    if (result) {
      setEditingPost({
        ...editingPost,
        excerpt: result.excerpt || editingPost.excerpt,
        meta_description: result.meta_description || editingPost.meta_description,
      });
      toast({ title: 'Excerpt & meta description generated!' });
    }
  };

  const handleAISEO = async () => {
    if (!editingPost?.content || !editingPost?.title) {
      toast({ title: 'Write content first', variant: 'destructive' });
      return;
    }
    const result = await callBlogAI('seo_optimise', {
      title: editingPost.title,
      content: editingPost.content,
      meta_description: editingPost.meta_description || '',
    });
    if (result) {
      setSeoSuggestions(result);
      setShowSeoDialog(true);
    }
  };

  const applySeoSuggestions = () => {
    if (!seoSuggestions || !editingPost) return;
    setEditingPost({
      ...editingPost,
      title: seoSuggestions.improved_title || editingPost.title,
      meta_description: seoSuggestions.improved_meta_description || editingPost.meta_description,
    });
    setShowSeoDialog(false);
    toast({ title: 'SEO improvements applied!' });
  };

  const handleAIRepurpose = async () => {
    if (!editingPost?.content || !editingPost?.title) {
      toast({ title: 'Write content first', variant: 'destructive' });
      return;
    }
    const result = await callBlogAI('repurpose', { title: editingPost.title, content: editingPost.content });
    if (result) {
      setSocialContent(result);
      setShowRepurposeDialog(true);
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Edit View
  if (view === 'edit' && editingPost) {
    const metaLen = (editingPost.meta_description || '').length;
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => setView('list')} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to posts
          </Button>
          {/* AI toolbar */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleAIExcerptMeta} disabled={aiLoading} className="gap-1.5 text-xs">
              {aiLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <FileText className="h-3 w-3" />}
              Auto Excerpt
            </Button>
            <Button variant="outline" size="sm" onClick={handleAISEO} disabled={aiLoading} className="gap-1.5 text-xs">
              {aiLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Search className="h-3 w-3" />}
              SEO Check
            </Button>
            <Button variant="outline" size="sm" onClick={handleAIRepurpose} disabled={aiLoading} className="gap-1.5 text-xs">
              {aiLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Share2 className="h-3 w-3" />}
              Repurpose
            </Button>
          </div>
        </div>
        <h2 className="text-2xl font-black">{editingPost.id ? 'Edit Post' : 'New Post'}</h2>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-bold text-muted-foreground mb-1 block">Title</label>
            <Input value={editingPost.title || ''} onChange={(e) => updateField('title', e.target.value)} placeholder="Post title" />
          </div>
          <div>
            <label className="text-sm font-bold text-muted-foreground mb-1 block">Slug</label>
            <Input value={editingPost.slug || ''} onChange={(e) => updateField('slug', e.target.value)} placeholder="post-url-slug" />
          </div>
          <div>
            <label className="text-sm font-bold text-muted-foreground mb-1 block">Excerpt</label>
            <Textarea value={editingPost.excerpt || ''} onChange={(e) => updateField('excerpt', e.target.value)} placeholder="Short summary for listing page" rows={3} />
          </div>
          <div>
            <label className="text-sm font-bold text-muted-foreground mb-1 block">Content (HTML)</label>
            <Textarea value={editingPost.content || ''} onChange={(e) => updateField('content', e.target.value)} placeholder="<h2>Introduction</h2><p>Your blog post content...</p>" rows={15} className="font-mono text-sm" />
          </div>
          <div>
            <label className="text-sm font-bold text-muted-foreground mb-1 block">
              Meta Description <span className={cn("text-xs", metaLen > 155 ? "text-destructive" : "text-muted-foreground")}>({metaLen}/155)</span>
            </label>
            <Input value={editingPost.meta_description || ''} onChange={(e) => updateField('meta_description', e.target.value)} placeholder="SEO description" maxLength={200} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-bold text-muted-foreground mb-1 block">Author</label>
              <Input value={editingPost.author || ''} onChange={(e) => updateField('author', e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-bold text-muted-foreground mb-1 block">Status</label>
              <Select value={editingPost.status || 'draft'} onValueChange={(v) => setEditingPost({ ...editingPost, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label className="text-sm font-bold text-muted-foreground mb-1 block">Published Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !editingPost.published_at && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {editingPost.published_at ? format(new Date(editingPost.published_at), 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={editingPost.published_at ? new Date(editingPost.published_at) : undefined}
                  onSelect={(d) => setEditingPost({ ...editingPost, published_at: d?.toISOString() || null })}
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Cover Image Upload */}
          <div>
            <label className="text-sm font-bold text-muted-foreground mb-1 block">Cover Image</label>
            {editingPost.cover_image_url ? (
              <div className="relative inline-block">
                <img src={editingPost.cover_image_url} alt="Cover preview" className="rounded-lg max-h-40 object-cover border border-border" />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-7 w-7"
                  onClick={() => setEditingPost({ ...editingPost, cover_image_url: null })}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 p-6 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                <Upload className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Click to upload a cover image</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const ext = file.name.split('.').pop();
                    const path = `covers/${Date.now()}.${ext}`;
                    const { error } = await supabase.storage.from('blog-images').upload(path, file);
                    if (error) {
                      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
                      return;
                    }
                    const { data: urlData } = supabase.storage.from('blog-images').getPublicUrl(path);
                    setEditingPost({ ...editingPost, cover_image_url: urlData.publicUrl });
                    toast({ title: 'Image uploaded!' });
                  }}
                />
              </label>
            )}
          </div>

          {/* Keywords */}
          <div>
            <label className="text-sm font-bold text-muted-foreground mb-1 block">Keywords (comma-separated)</label>
            <Input
              value={(editingPost.keywords || []).join(', ')}
              onChange={(e) => {
                const kw = e.target.value.split(',').map(k => k.trim()).filter(Boolean);
                setEditingPost({ ...editingPost, keywords: kw });
              }}
              placeholder="driving test tips, UK learner driver, ADI resources"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground font-bold">
            {saving ? 'Saving…' : 'Save'}
          </Button>
          {editingPost.status !== 'published' && (
            <Button variant="outline" onClick={handlePublish} className="font-bold">
              Publish Now
            </Button>
          )}
          {editingPost.id && editingPost.status === 'published' && (
            <a href={`/blog/${editingPost.slug}`} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" className="gap-2"><Eye className="h-4 w-4" /> View</Button>
            </a>
          )}
        </div>

        {/* SEO Dialog */}
        <Dialog open={showSeoDialog} onOpenChange={setShowSeoDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><Search className="h-5 w-5 text-primary" /> SEO Analysis</DialogTitle>
            </DialogHeader>
            {seoSuggestions && (
              <div className="space-y-4">
                {seoSuggestions.improved_title && (
                  <div>
                    <p className="text-sm font-bold text-muted-foreground mb-1">Improved Title</p>
                    <p className="p-3 bg-muted rounded-lg text-sm">{seoSuggestions.improved_title}</p>
                  </div>
                )}
                {seoSuggestions.improved_meta_description && (
                  <div>
                    <p className="text-sm font-bold text-muted-foreground mb-1">Improved Meta Description</p>
                    <p className="p-3 bg-muted rounded-lg text-sm">{seoSuggestions.improved_meta_description}</p>
                  </div>
                )}
                {seoSuggestions.suggestions && seoSuggestions.suggestions.length > 0 && (
                  <div>
                    <p className="text-sm font-bold text-muted-foreground mb-2">Suggestions</p>
                    <ul className="space-y-2">
                      {seoSuggestions.suggestions.map((s, i) => (
                        <li key={i} className="text-sm p-2 bg-muted rounded-lg flex items-start gap-2">
                          <span className="text-primary font-bold shrink-0">{i + 1}.</span> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <Button onClick={applySeoSuggestions} className="w-full bg-primary text-primary-foreground font-bold">
                  Apply Title & Meta Improvements
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Repurpose Dialog */}
        <Dialog open={showRepurposeDialog} onOpenChange={setShowRepurposeDialog}>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><Share2 className="h-5 w-5 text-primary" /> Social Content</DialogTitle>
            </DialogHeader>
            {socialContent && (
              <div className="space-y-4">
                {(['instagram', 'tiktok', 'linkedin'] as const).map((platform) => {
                  const content = socialContent[platform];
                  if (!content) return null;
                  return (
                    <div key={platform}>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-bold text-muted-foreground capitalize">{platform}</p>
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(content, platform)} className="gap-1 text-xs h-7">
                          {copiedField === platform ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                          {copiedField === platform ? 'Copied' : 'Copy'}
                        </Button>
                      </div>
                      <pre className="p-3 bg-muted rounded-lg text-sm whitespace-pre-wrap font-sans">{content}</pre>
                    </div>
                  );
                })}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // List View
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black">Blog Posts</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowGenerateDialog(true)} className="gap-2 font-bold">
            <Sparkles className="h-4 w-4" /> AI Generate
          </Button>
          <Button onClick={handleNew} className="bg-primary text-primary-foreground font-bold gap-2">
            <Plus className="h-4 w-4" /> New Post
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : posts.length === 0 ? (
        <p className="text-muted-foreground py-8 text-center">No blog posts yet. Create your first one!</p>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div key={post.id} className="flex items-center justify-between p-4 bg-card border border-border rounded-xl">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-foreground truncate">{post.title}</span>
                  <Badge variant={post.status === 'published' ? 'default' : 'secondary'} className="text-xs shrink-0">
                    {post.status}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  {post.published_at ? format(new Date(post.published_at), 'dd MMM yyyy') : 'Not published'}
                </span>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Button variant="ghost" size="icon" onClick={() => handleEdit(post)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete "{post.title}"?</AlertDialogTitle>
                      <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(post.id)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AI Generate Dialog */}
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /> AI Blog Generator</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-bold text-muted-foreground mb-1 block">Topic or title</label>
              <Input
                value={generateTopic}
                onChange={(e) => setGenerateTopic(e.target.value)}
                placeholder="e.g. Why learners fail their first test"
                onKeyDown={(e) => e.key === 'Enter' && handleAIGenerate()}
              />
            </div>
            <p className="text-xs text-muted-foreground">AI will write a full blog post with HTML content, SEO meta, and excerpt — ready to review and publish.</p>
            <Button onClick={handleAIGenerate} disabled={aiLoading || !generateTopic.trim()} className="w-full bg-primary text-primary-foreground font-bold gap-2">
              {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {aiLoading ? 'Generating…' : 'Generate Post'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BlogAdmin;
