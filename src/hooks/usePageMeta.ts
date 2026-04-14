import { useEffect } from "react";

interface PageMeta {
  title: string;
  description: string;
  canonical?: string;
}

export function usePageMeta({ title, description, canonical }: PageMeta) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;

    let metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    const prevDesc = metaDesc?.content;
    if (metaDesc) {
      metaDesc.content = description;
    } else {
      metaDesc = document.createElement("meta");
      metaDesc.name = "description";
      metaDesc.content = description;
      document.head.appendChild(metaDesc);
    }

    let ogTitle = document.querySelector('meta[property="og:title"]') as HTMLMetaElement | null;
    if (ogTitle) ogTitle.content = title;

    let ogDesc = document.querySelector('meta[property="og:description"]') as HTMLMetaElement | null;
    if (ogDesc) ogDesc.content = description;

    let twitterTitle = document.querySelector('meta[name="twitter:title"]') as HTMLMetaElement | null;
    if (twitterTitle) twitterTitle.content = title;

    let twitterDesc = document.querySelector('meta[name="twitter:description"]') as HTMLMetaElement | null;
    if (twitterDesc) twitterDesc.content = description;

    let canonicalEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    const prevCanonical = canonicalEl?.href;
    let createdCanonical = false;
    if (canonical) {
      if (!canonicalEl) {
        canonicalEl = document.createElement("link");
        canonicalEl.rel = "canonical";
        document.head.appendChild(canonicalEl);
        createdCanonical = true;
      }
      canonicalEl.href = canonical;
    }

    return () => {
      document.title = prevTitle;
      if (metaDesc && prevDesc !== undefined) metaDesc.content = prevDesc;
      if (ogTitle) ogTitle.content = prevTitle;
      if (ogDesc && prevDesc !== undefined) ogDesc.content = prevDesc;
      if (twitterTitle) twitterTitle.content = prevTitle;
      if (twitterDesc && prevDesc !== undefined) twitterDesc.content = prevDesc;
      if (canonicalEl && createdCanonical) {
        canonicalEl.remove();
      } else if (canonicalEl && prevCanonical) {
        canonicalEl.href = prevCanonical;
      }
    };
  }, [title, description, canonical]);
}
