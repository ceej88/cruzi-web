import { useEffect, useRef } from "react";

export function useDocumentTitle(title: string) {
  const prevTitle = useRef(document.title);

  useEffect(() => {
    const previous = prevTitle.current;
    document.title = title;
    return () => {
      document.title = previous;
    };
  }, [title]);
}
