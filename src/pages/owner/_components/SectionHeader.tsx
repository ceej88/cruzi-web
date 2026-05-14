import { Link } from 'react-router-dom';

interface Props {
  title: string;
  action?: { label: string; to: string };
  hint?: string;
}

export function SectionHeader({ title, action, hint }: Props) {
  const slug = title.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex items-end justify-between mb-3 gap-3">
      <div className="min-w-0">
        <h2 className="text-base lg:text-lg font-semibold" data-testid={`section-${slug}`}>
          {title}
        </h2>
        {hint && <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>}
      </div>
      {action && (
        <Link
          to={action.to}
          className="text-xs text-primary hover:underline shrink-0"
          data-testid={`link-section-action-${slug}`}
        >
          {action.label} →
        </Link>
      )}
    </div>
  );
}
