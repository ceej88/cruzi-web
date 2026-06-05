import { AlertTriangle, Ban, BookOpen, Megaphone, ShieldAlert, UserX } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { OperationsPage, ReadOnlyNotice } from './_components/OperationsUI';

const isolatedTools = [
  {
    title: 'Account deletion and suspension',
    description: 'High-risk user lifecycle work should require a separate reviewed flow before it appears in daily admin.',
    icon: UserX,
  },
  {
    title: 'Onboarding reset',
    description: 'Can change how mobile users experience the app and should not live beside read-only operations data.',
    icon: ShieldAlert,
  },
  {
    title: 'Broadcast messaging',
    description: 'A single mistake can message real users. Keep this out of PR 1 until templates, permissions, and audit trails are reviewed.',
    icon: Megaphone,
  },
  {
    title: 'School suspension',
    description: 'Impacts multiple users and needs a dedicated safety review before admin exposure.',
    icon: Ban,
  },
  {
    title: 'Blog tooling',
    description: 'Content tools are not operational admin and should be managed separately from platform health.',
    icon: BookOpen,
  },
];

export default function AdminTools() {
  return (
    <OperationsPage title="Admin Tools" description="Isolated high-risk and non-operational tooling.">
      <ReadOnlyNotice>
        PR 1 does not expose destructive actions, broadcasts, backend mutations, or content publishing from the operations dashboard.
      </ReadOnlyNotice>

      <Card className="border-amber-500/35 bg-amber-500/5">
        <CardHeader>
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <CardTitle>Tools intentionally isolated</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            These areas may exist elsewhere in the old admin tree, but they are not part of the new daily operations navigation.
          </p>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {isolatedTools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Card key={tool.title}>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-muted p-2">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h2 className="font-semibold">{tool.title}</h2>
                      <Badge variant="outline">Disabled</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{tool.description}</p>
                  </div>
                </div>
                <Button variant="outline" disabled className="w-full justify-center">
                  Not available in read-only PR 1
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </OperationsPage>
  );
}
