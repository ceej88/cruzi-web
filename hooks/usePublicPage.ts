import { useEffect } from 'react';

/**
 * Adds the 'public-page' class to <html> to enable normal scrolling
 * on pages outside the app shell (blog, legal, etc.)
 */
export const usePublicPage = () => {
  useEffect(() => {
    document.documentElement.classList.add('public-page');
    // Scroll to top on mount
    window.scrollTo(0, 0);
    return () => {
      document.documentElement.classList.remove('public-page');
    };
  }, []);
};
