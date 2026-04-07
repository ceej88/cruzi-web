import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface LegalSectionProps {
  id: string;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const LegalSection: React.FC<LegalSectionProps> = ({
  id,
  title,
  children,
  defaultOpen = false,
}) => {
  return (
    <Accordion
      type="single"
      collapsible
      defaultValue={defaultOpen ? id : undefined}
      className="mb-4"
    >
      <AccordionItem value={id} className="border rounded-xl px-6 bg-card">
        <AccordionTrigger className="text-lg font-bold hover:no-underline">
          {title}
        </AccordionTrigger>
        <AccordionContent className="text-muted-foreground leading-relaxed">
          {children}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default LegalSection;
