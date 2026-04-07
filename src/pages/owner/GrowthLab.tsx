import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import {
  Rocket, MapPin, Megaphone, Copy, Loader2, Sparkles, Star,
  Clock, Users, Mic, ClipboardCheck, BarChart3, GraduationCap,
  Shield, Share2, Mail, MessageCircle, CheckCircle, Save,
  ExternalLink,
} from 'lucide-react';

const CRUZI_DIFFERENTIATORS = [
  { icon: Clock, title: 'Lesson planning in under 2 minutes', desc: 'Voice Scribe turns spoken notes into structured DVSA-aligned lesson plans automatically.' },
  { icon: Users, title: 'Parent progress dashboard', desc: 'Parents see skills covered, areas to practise, and upcoming focus — no chasing messages.' },
  { icon: MapPin, title: 'Recorded test routes', desc: 'Turn-by-turn directions students can practise independently between lessons.' },
  { icon: Mic, title: 'Voice Scribe — hands-free notes', desc: 'Speak after each lesson. Cruzi transcribes into session logs, skill updates, and plans.' },
  { icon: ClipboardCheck, title: 'Mock test scoring', desc: 'DVSA-aligned marking — minors, serious, dangerous. Students track improvement over time.' },
  { icon: GraduationCap, title: 'Content Studio', desc: 'Shareable achievement badges and progress cards to celebrate student milestones.' },
  { icon: BarChart3, title: 'MTD-compliant financial tracking', desc: 'Income, expenses, mileage, and quarterly tax summaries aligned with HMRC requirements.' },
  { icon: Shield, title: 'Student connection hub', desc: 'Students join with a 4-digit PIN. Secure, simple, professional onboarding.' },
];

const LOCAL_SEO_TEMPLATES = [
  'Best Driving Test Routes in {town}',
  '{town} Test Centre Pass Rates & Tips',
  'How to Find a Driving Instructor in {town}',
  'Top Rated Driving Instructors in {town}',
  'Why Driving Instructors in {town} Are Switching to Cruzi',
];

const FEATURE_OPTIONS = [
  'Lesson Planning & Voice Scribe',
  'Parent Progress Dashboard',
  'Test Routes & Navigation',
  'Mock Test Scoring',
  'Content Studio & Badges',
  'Financial Tracking & Tax',
  'Student Connection Hub',
  'Cruzi Mentor AI',
];

const SOCIAL_TOPICS = [
  'Why instructors switch to Cruzi',
  'Student engagement tips',
  'Parent involvement matters',
  'Feature spotlight',
  'Instructor wellbeing & admin reduction',
];

/* ─── Helpers ─── */

const copyText = (text: string) => {
  navigator.clipboard.writeText(text);
  toast({ title: 'Copied to clipboard' });
};

const CopyBtn: React.FC<{ text: string; label?: string }> = ({ text, label }) => (
  <Button variant="ghost" size="sm" onClick={() => copyText(text)} className="gap-1.5 h-7 text-xs shrink-0">
    <Copy className="h-3 w-3" /> {label || 'Copy'}
  </Button>
);

const Section: React.FC<{ label: string; text: string; mono?: boolean }> = ({ label, text, mono }) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between">
      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
      <CopyBtn text={text} />
    </div>
    <div className={`bg-muted/50 rounded-lg p-3 text-sm leading-relaxed border ${mono ? 'font-mono text-xs whitespace-pre-wrap' : ''}`}>
      {text}
    </div>
  </div>
);

const CharCount: React.FC<{ text: string; max?: number }> = ({ text, max }) => (
  <span className={`text-[10px] ml-1 ${max && text.length > max ? 'text-destructive' : 'text-muted-foreground'}`}>
    {text.length}{max ? `/${max}` : ''} chars
  </span>
);

/* ─── Formatted Result Renderers ─── */

const LandingResult: React.FC<{ data: any; onSaveDraft: (title: string, content: string, meta: string) => void }> = ({ data, onSaveDraft }) => {
  if (!data) return null;
  const d = typeof data === 'string' ? tryParse(data) : data;
  if (!d) return <FallbackResult raw={data} />;

  const fullContent = [
    d.hero_headline && `<h1>${d.hero_headline}</h1>`,
    d.hero_subheadline && `<p>${d.hero_subheadline}</p>`,
    ...(d.value_props || []).map((v: any) => `<h2>${v.title}</h2><p>${v.description}</p>`),
    d.cta_text && `<p><strong>${d.cta_text}</strong></p>`,
  ].filter(Boolean).join('\n');

  return (
    <div className="mt-4 space-y-4">
      {d.hero_headline && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Hero Headline</p>
            <CopyBtn text={d.hero_headline} />
          </div>
          <h2 className="text-xl font-black text-foreground bg-muted/50 rounded-lg p-3 border">{d.hero_headline}</h2>
        </div>
      )}

      {d.hero_subheadline && <Section label="Subheadline" text={d.hero_subheadline} />}

      {d.value_props?.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Value Propositions</p>
          <div className="space-y-2">
            {d.value_props.map((v: any, i: number) => (
              <div key={i} className="bg-muted/50 rounded-lg p-3 border flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-bold">{v.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{v.description}</p>
                </div>
                <CopyBtn text={`${v.title}: ${v.description}`} />
              </div>
            ))}
          </div>
        </div>
      )}

      {d.cta_text && <Section label="Call to Action" text={d.cta_text} />}

      {d.local_keywords?.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">SEO Keywords</p>
            <CopyBtn text={d.local_keywords.join(', ')} />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {d.local_keywords.map((kw: string, i: number) => (
              <span key={i} className="bg-primary/10 text-primary text-xs font-medium px-2.5 py-1 rounded-full">{kw}</span>
            ))}
          </div>
        </div>
      )}

      {d.meta_description && <Section label="Meta Description" text={d.meta_description} />}

      <Button
        onClick={() => onSaveDraft(d.hero_headline || 'Untitled', fullContent, d.meta_description || '')}
        className="rounded-xl gap-2 w-full"
        variant="outline"
      >
        <Save className="h-4 w-4" /> Save as Blog Draft
      </Button>
    </div>
  );
};

const SocialResult: React.FC<{ data: any }> = ({ data }) => {
  if (!data) return null;
  const d = typeof data === 'string' ? tryParse(data) : data;
  if (!d) return <FallbackResult raw={data} />;

  const platforms = [
    { key: 'instagram', label: 'Instagram', max: 2200, color: 'bg-pink-500/10 text-pink-600' },
    { key: 'linkedin', label: 'LinkedIn', max: 3000, color: 'bg-blue-500/10 text-blue-600' },
    { key: 'facebook', label: 'Facebook', max: undefined, color: 'bg-indigo-500/10 text-indigo-600' },
    { key: 'tiktok', label: 'TikTok Script', max: undefined, color: 'bg-foreground/10 text-foreground' },
    { key: 'whatsapp', label: 'WhatsApp', max: 500, color: 'bg-green-500/10 text-green-600' },
  ];

  return (
    <div className="mt-4 space-y-3">
      {platforms.map(p => d[p.key] ? (
        <div key={p.key} className="rounded-xl border overflow-hidden">
          <div className={`px-3 py-2 flex items-center justify-between ${p.color}`}>
            <span className="text-xs font-bold uppercase tracking-wider">{p.label} <CharCount text={d[p.key]} max={p.max} /></span>
            <CopyBtn text={d[p.key]} />
          </div>
          <div className="p-3 text-sm leading-relaxed whitespace-pre-wrap">{d[p.key]}</div>
        </div>
      ) : null)}
    </div>
  );
};

const FeatureResult: React.FC<{ data: any; onSaveDraft: (title: string, content: string, meta: string) => void }> = ({ data, onSaveDraft }) => {
  if (!data) return null;
  const d = typeof data === 'string' ? tryParse(data) : data;
  if (!d) return <FallbackResult raw={data} />;

  return (
    <div className="mt-4 space-y-4">
      {d.headline && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Headline</p>
            <CopyBtn text={d.headline} />
          </div>
          <h3 className="text-lg font-black text-foreground bg-muted/50 rounded-lg p-3 border">{d.headline}</h3>
        </div>
      )}
      {d.social_post && <Section label="Social Post" text={d.social_post} />}
      {d.email_snippet && <Section label="Email Snippet" text={d.email_snippet} />}
      {d.landing_copy && <Section label="Landing Page Copy" text={d.landing_copy} />}
      <Button
        onClick={() => onSaveDraft(
          d.headline || 'Feature Highlight',
          `<h1>${d.headline || ''}</h1><p>${d.landing_copy || d.social_post || ''}</p>`,
          ''
        )}
        className="rounded-xl gap-2 w-full" variant="outline"
      >
        <Save className="h-4 w-4" /> Save as Blog Draft
      </Button>
    </div>
  );
};

const TestimonialResult: React.FC<{ data: any }> = ({ data }) => {
  if (!data) return null;
  const d = typeof data === 'string' ? tryParse(data) : data;
  if (!d) return <FallbackResult raw={data} />;

  return (
    <div className="mt-4 space-y-4">
      {d.subject_line && <Section label="Subject Line" text={d.subject_line} />}
      {d.email_body && <Section label="Email Body" text={d.email_body} mono />}
      {d.follow_up_note && <Section label="Follow-up Reminder" text={d.follow_up_note} />}
    </div>
  );
};

const ReferralResult: React.FC<{ data: any }> = ({ data }) => {
  if (!data) return null;
  const d = typeof data === 'string' ? tryParse(data) : data;
  if (!d) return <FallbackResult raw={data} />;

  return (
    <div className="mt-4 space-y-4">
      {d.email_subject && <Section label="Email Subject" text={d.email_subject} />}
      {d.email_body && <Section label="Email Body" text={d.email_body} mono />}
      {d.whatsapp_message && <Section label="WhatsApp Message" text={d.whatsapp_message} />}
      {d.social_post && <Section label="Social Post" text={d.social_post} />}
    </div>
  );
};

const GmbResult: React.FC<{ data: any }> = ({ data }) => {
  if (!data) return null;
  const d = typeof data === 'string' ? tryParse(data) : data;
  if (!d) return <FallbackResult raw={data} />;

  return (
    <div className="mt-4 space-y-4">
      {d.gmb_post && <Section label="GMB Post" text={d.gmb_post} />}
      {d.suggested_cta_button && (
        <div className="flex items-center gap-2">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">CTA Button:</p>
          <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">{d.suggested_cta_button}</span>
        </div>
      )}
    </div>
  );
};

const FallbackResult: React.FC<{ raw: any }> = ({ raw }) => {
  const text = typeof raw === 'string' ? raw : JSON.stringify(raw, null, 2);
  return (
    <div className="mt-4 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Result</p>
        <CopyBtn text={text} />
      </div>
      <pre className="bg-muted/50 rounded-xl p-4 text-xs whitespace-pre-wrap max-h-96 overflow-y-auto border">{text}</pre>
    </div>
  );
};

function tryParse(val: any): any | null {
  if (typeof val !== 'string') return val;
  try { return JSON.parse(val); } catch { return null; }
}

/* ─── Main Component ─── */

const GrowthLab: React.FC = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  const [seoTown, setSeoTown] = useState('');
  const [selectedFeature, setSelectedFeature] = useState('');
  const [socialTopic, setSocialTopic] = useState('');
  const [gmbTopic, setGmbTopic] = useState('');
  const [testimonialName, setTestimonialName] = useState('');
  const [testimonialDays, setTestimonialDays] = useState('');
  const [landingTown, setLandingTown] = useState('');

  const callBlogAI = async (mode: string, extraParams: Record<string, string>, resultKey: string) => {
    setLoading(resultKey);
    try {
      const { data, error } = await supabase.functions.invoke('blog-ai', {
        body: { mode, ...extraParams },
      });
      if (error) throw error;
      setResults(prev => ({ ...prev, [resultKey]: data }));
      toast({ title: 'Content generated', description: 'Your content is ready below.' });
    } catch (e: any) {
      toast({ title: 'Generation failed', description: e.message || 'Something went wrong', variant: 'destructive' });
    } finally {
      setLoading(null);
    }
  };

  const saveBlogDraft = async (title: string, content: string, metaDescription: string) => {
    setSaving(true);
    try {
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const { error } = await (supabase as any).from('blog_posts').insert({
        title,
        slug: `${slug}-${Date.now()}`,
        content,
        meta_description: metaDescription || null,
        excerpt: metaDescription || null,
        status: 'draft',
        author: 'Cruzi',
      });
      if (error) throw error;
      toast({ title: 'Saved as draft', description: 'Go to Blog Admin to review and publish.' });
    } catch (e: any) {
      toast({ title: 'Save failed', description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const generateLocalSEOBatch = async () => {
    if (!seoTown.trim()) return;
    setLoading('seo_batch');
    try {
      const topics = LOCAL_SEO_TEMPLATES.map(t => t.replace('{town}', seoTown.trim()));
      const drafts: any[] = [];
      for (const topic of topics) {
        const { data, error } = await supabase.functions.invoke('blog-ai', {
          body: { mode: 'generate', topic },
        });
        if (error) throw error;
        drafts.push(data);
      }
      setResults(prev => ({ ...prev, seo_batch: drafts }));
      toast({ title: `${topics.length} blog drafts generated for ${seoTown}` });
    } catch (e: any) {
      toast({ title: 'Batch generation failed', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(null);
    }
  };

  const saveAllSeoDrafts = async (drafts: any[]) => {
    setSaving(true);
    try {
      const inserts = drafts.map(d => ({
        title: d.title || 'Untitled SEO Post',
        slug: (d.slug || `seo-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`),
        content: d.content || '',
        meta_description: d.meta_description || null,
        excerpt: d.excerpt || null,
        status: 'draft' as const,
        author: 'Cruzi',
      }));
      const { error } = await (supabase as any).from('blog_posts').insert(inserts);
      if (error) throw error;
      toast({ title: `${inserts.length} drafts saved`, description: 'Go to Blog Admin to review and publish.' });
    } catch (e: any) {
      toast({ title: 'Batch save failed', description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="content" className="w-full">
        <TabsList className="w-full overflow-x-auto flex justify-start h-auto flex-wrap gap-1 bg-transparent p-0">
          {[
            { value: 'content', label: 'Content', icon: Sparkles },
            { value: 'social', label: 'Social', icon: Share2 },
            { value: 'local_seo', label: 'Local SEO', icon: MapPin },
            { value: 'referral', label: 'Referral', icon: Mail },
            { value: 'differentiators', label: 'USPs', icon: Star },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg text-xs px-3 py-2 gap-1.5"
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Content Generators */}
        <TabsContent value="content" className="space-y-4 mt-4">
          {/* Landing Page Copy */}
          <Card className="rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Landing Page Copy Generator</CardTitle>
              <CardDescription>Enter a town/city — get a full localised landing page draft in Cruzi's voice.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input placeholder="e.g. Chester, Wrexham, Liverpool" value={landingTown} onChange={e => setLandingTown(e.target.value)} />
              <Button
                onClick={() => callBlogAI('landing_page_copy', { town: landingTown }, 'landing')}
                disabled={!landingTown.trim() || loading === 'landing'}
                className="rounded-xl"
              >
                {loading === 'landing' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                Generate Landing Copy
              </Button>
              <LandingResult data={results.landing} onSaveDraft={saveBlogDraft} />
            </CardContent>
          </Card>

          {/* Feature Highlight */}
          <Card className="rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Feature Highlight Generator</CardTitle>
              <CardDescription>Pick a Cruzi feature — get shareable copy for social, email, or landing pages.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select value={selectedFeature} onValueChange={setSelectedFeature}>
                <SelectTrigger><SelectValue placeholder="Select a feature" /></SelectTrigger>
                <SelectContent>
                  {FEATURE_OPTIONS.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button
                onClick={() => callBlogAI('feature_highlight', { feature: selectedFeature }, 'feature')}
                disabled={!selectedFeature || loading === 'feature'}
                className="rounded-xl"
              >
                {loading === 'feature' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                Generate Feature Copy
              </Button>
              <FeatureResult data={results.feature} onSaveDraft={saveBlogDraft} />
            </CardContent>
          </Card>

          {/* Testimonial Request */}
          <Card className="rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><Star className="h-4 w-4 text-primary" /> Testimonial Request Generator</CardTitle>
              <CardDescription>Generate a personalised review request email in Cruzi's supportive tone.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Instructor name" value={testimonialName} onChange={e => setTestimonialName(e.target.value)} />
                <Input placeholder="Days active (e.g. 45)" value={testimonialDays} onChange={e => setTestimonialDays(e.target.value)} />
              </div>
              <Button
                onClick={() => callBlogAI('testimonial_request', { instructor_name: testimonialName, days_active: testimonialDays }, 'testimonial')}
                disabled={!testimonialName.trim() || loading === 'testimonial'}
                className="rounded-xl"
              >
                {loading === 'testimonial' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Mail className="h-4 w-4 mr-2" />}
                Generate Request Email
              </Button>
              <TestimonialResult data={results.testimonial} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Content Hub */}
        <TabsContent value="social" className="space-y-4 mt-4">
          <Card className="rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><Megaphone className="h-4 w-4 text-primary" /> Quick Post Generator</CardTitle>
              <CardDescription>Pick a topic — get ready-to-post content for every platform.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select value={socialTopic} onValueChange={setSocialTopic}>
                <SelectTrigger><SelectValue placeholder="Choose a topic" /></SelectTrigger>
                <SelectContent>
                  {SOCIAL_TOPICS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button
                onClick={() => callBlogAI('social_quick', { topic: socialTopic }, 'social')}
                disabled={!socialTopic || loading === 'social'}
                className="rounded-xl"
              >
                {loading === 'social' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Share2 className="h-4 w-4 mr-2" />}
                Generate Social Posts
              </Button>
              <SocialResult data={results.social} />
            </CardContent>
          </Card>

          <Card className="rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Google Business Profile Post</CardTitle>
              <CardDescription>Generate a short, local, keyword-rich GMB update.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea placeholder="Enter a topic or paste a blog post title..." value={gmbTopic} onChange={e => setGmbTopic(e.target.value)} rows={3} />
              <Button
                onClick={() => callBlogAI('gmb_post', { topic: gmbTopic }, 'gmb')}
                disabled={!gmbTopic.trim() || loading === 'gmb'}
                className="rounded-xl"
              >
                {loading === 'gmb' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <MapPin className="h-4 w-4 mr-2" />}
                Generate GMB Post
              </Button>
              <GmbResult data={results.gmb} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Local SEO */}
        <TabsContent value="local_seo" className="space-y-4 mt-4">
          <Card className="rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Local SEO Blog Batch</CardTitle>
              <CardDescription>Enter a town name — generates 5 SEO-targeted blog post drafts automatically.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input placeholder="Town/city name (e.g. Chester)" value={seoTown} onChange={e => setSeoTown(e.target.value)} />
              <div className="bg-muted/50 rounded-xl p-4 space-y-1.5">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Will generate:</p>
                {LOCAL_SEO_TEMPLATES.map(t => (
                  <p key={t} className="text-sm flex items-center gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-primary shrink-0" />
                    {t.replace('{town}', seoTown || '[Town]')}
                  </p>
                ))}
              </div>
              <Button
                onClick={generateLocalSEOBatch}
                disabled={!seoTown.trim() || loading === 'seo_batch'}
                className="rounded-xl w-full"
              >
                {loading === 'seo_batch' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Rocket className="h-4 w-4 mr-2" />}
                Generate All 5 Drafts
              </Button>

              {/* SEO Batch Results */}
              {Array.isArray(results.seo_batch) && results.seo_batch.length > 0 && (
                <div className="mt-4 space-y-3">
                  {results.seo_batch.map((draft: any, i: number) => (
                    <div key={i} className="rounded-xl border p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-bold">{draft.title || `Draft ${i + 1}`}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{draft.excerpt || draft.meta_description || ''}</p>
                        </div>
                        <CopyBtn text={draft.content || JSON.stringify(draft, null, 2)} />
                      </div>
                      {draft.slug && (
                        <p className="text-[10px] text-muted-foreground font-mono">/{draft.slug}</p>
                      )}
                    </div>
                  ))}
                  <Button
                    onClick={() => saveAllSeoDrafts(results.seo_batch)}
                    disabled={saving}
                    className="rounded-xl gap-2 w-full"
                    variant="outline"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save All {results.seo_batch.length} as Blog Drafts
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Referral */}
        <TabsContent value="referral" className="space-y-4 mt-4">
          <Card className="rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> Instructor Referral Copy</CardTitle>
              <CardDescription>Generate referral invitation copy — email, WhatsApp, and social.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() => callBlogAI('referral_copy', {}, 'referral')}
                disabled={loading === 'referral'}
                className="rounded-xl"
              >
                {loading === 'referral' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <MessageCircle className="h-4 w-4 mr-2" />}
                Generate Referral Copy
              </Button>
              <ReferralResult data={results.referral} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Differentiators */}
        <TabsContent value="differentiators" className="space-y-4 mt-4">
          <Card className="rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><Star className="h-4 w-4 text-primary" /> Cruzi Unique Selling Points</CardTitle>
              <CardDescription>Copy-paste these into any content. Real features, not fluff.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-3">
                {CRUZI_DIFFERENTIATORS.map((d) => (
                  <button
                    key={d.title}
                    onClick={() => copyText(`${d.title}: ${d.desc}`)}
                    className="text-left p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <d.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold">{d.title}</p>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{d.desc}</p>
                        <p className="text-[10px] text-primary font-semibold mt-2 opacity-0 group-hover:opacity-100 transition-opacity">Click to copy</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GrowthLab;
