import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CheckCircle, Loader2, AlertTriangle } from "lucide-react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

/* ───── types ───── */
interface InstructorInfo {
  profile_id: string;
  user_id: string;
  full_name: string;
  enquiry_welcome_title: string | null;
  enquiry_welcome_message: string | null;
  coverage_area: string | null;
  avatar_url: string | null;
}

/* ───── constants ───── */
const RADIO_FIELDS = [
  { key: "licence_type", label: "Do you have a driving licence?", options: ["Provisional", "Full"] },
  { key: "theory_passed", label: "Have you passed your theory test?", options: ["Yes", "No", "Not yet booked"] },
  { key: "previous_lessons", label: "Have you had driving lessons before?", options: ["No", "Yes"] },
  { key: "previous_instructor", label: "Have you had lessons with a different instructor before?", options: ["No", "Yes"] },
  { key: "test_booked", label: "Do you already have a driving test booked?", options: ["No", "Yes"] },
  { key: "lessons_per_week", label: "How many lessons per week are you hoping to have?", options: ["1", "2", "3 or more"] },
  { key: "parents_practice", label: "Do your parents or another adult practise driving with you between lessons?", options: ["Yes", "No", "Not applicable"] },
  { key: "reliability", label: "How likely are you to need to reschedule a lesson?", options: ["Rarely", "Sometimes", "Quite often"] },
] as const;

/* ───── sub-components ───── */
const CruziWordmark = ({ size = "md" }: { size?: "sm" | "md" }) => (
  <span className={`font-black font-outfit tracking-tight text-primary ${size === "sm" ? "text-xl" : "text-2xl"}`}>
    Cruzi
  </span>
);

const RadioField = ({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (v: string) => void;
}) => (
  <div className="space-y-2">
    <Label className="text-sm font-medium text-foreground">{label}</Label>
    <RadioGroup value={value} onValueChange={onChange} className="flex flex-wrap gap-3">
      {options.map((opt) => (
        <label
          key={opt}
          className={`flex items-center gap-2 cursor-pointer rounded-xl border px-4 py-2.5 text-sm transition-all ${
            value === opt
              ? "border-primary bg-primary/5 text-primary font-medium"
              : "border-border bg-card text-foreground hover:border-primary/40"
          }`}
        >
          <RadioGroupItem value={opt} className="sr-only" />
          <span
            className={`h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
              value === opt ? "border-primary" : "border-muted-foreground/40"
            }`}
          >
            {value === opt && <span className="h-2 w-2 rounded-full bg-primary" />}
          </span>
          {opt}
        </label>
      ))}
    </RadioGroup>
  </div>
);

const PageHeader = () => (
  <header className="bg-card border-b border-border px-4 py-3">
    <div className="max-w-xl mx-auto flex items-center justify-between">
      <CruziWordmark size="sm" />
      <span className="text-xs text-muted-foreground">Powered by Cruzi</span>
    </div>
  </header>
);

const PageFooter = ({ instructorName }: { instructorName?: string | null }) => (
  <footer className="border-t border-border bg-card px-4 py-6">
    <div className="max-w-xl mx-auto text-center space-y-3">
      {instructorName && (
        <p className="text-xs text-muted-foreground">
          Your details will only be shared with {instructorName}.
        </p>
      )}
      <CruziWordmark size="sm" />
      <p className="text-xs text-muted-foreground">
        © Cruzi 2025 ·{" "}
        <a href="https://cruzi.co.uk/privacy" className="underline hover:text-foreground">Privacy Policy</a>
        {" · "}
        <a href="https://cruzi.co.uk/terms" className="underline hover:text-foreground">Terms of Service</a>
      </p>
    </div>
  </footer>
);

const ThankYouScreen = ({ firstName }: { firstName: string }) => (
  <div className="fixed inset-0 bg-background flex flex-col z-50">
    <PageHeader />
    <div className="flex-1 overflow-y-auto overscroll-contain flex flex-col items-center justify-center px-4 py-12 text-center" style={{ WebkitOverflowScrolling: 'touch' }}>
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <CheckCircle className="h-10 w-10 text-primary" />
      </div>
      <h1 className="text-2xl font-bold font-outfit text-foreground mb-2">Enquiry sent!</h1>
      <p className="text-muted-foreground max-w-sm mb-4">
        {firstName} will review your details and get back to you shortly.
      </p>
      <p className="text-sm text-muted-foreground max-w-sm">
        Once accepted, your instructor will send you a link to get started with the Cruzi app.
      </p>
      <div className="mt-10 space-y-1">
        <CruziWordmark size="sm" />
        <p className="text-xs text-muted-foreground">The smart way to learn to drive</p>
      </div>
    </div>
  </div>
);

const NotFoundScreen = () => (
  <div className="fixed inset-0 bg-background flex flex-col z-50">
    <PageHeader />
    <div className="flex-1 overflow-y-auto overscroll-contain flex flex-col items-center justify-center px-4 text-center" style={{ WebkitOverflowScrolling: 'touch' }}>
      <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
      <h1 className="text-2xl font-bold font-outfit text-foreground mb-2">This page is not available</h1>
      <p className="text-muted-foreground max-w-md">
        The enquiry page you're looking for doesn't exist or has been disabled. Please check the link and try again.
      </p>
    </div>
  </div>
);

/* ───── main page ───── */
const EnquiryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [instructor, setInstructor] = useState<InstructorInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});

  useDocumentTitle(
    instructor ? `Enquire — ${instructor.full_name} | Cruzi` : "Enquire | Cruzi"
  );

  useEffect(() => {
    const fetchProfile = async () => {
      if (!slug) { setNotFound(true); setLoading(false); return; }
      const { data, error } = await supabase
        .rpc("get_public_enquiry_profile", { target_slug: slug });
      if (error || !data || (Array.isArray(data) && data.length === 0)) setNotFound(true);
      else {
        const row = Array.isArray(data) ? data[0] : data;
        setInstructor(row as InstructorInfo);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [slug]);

  const updateField = (key: string, value: string) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instructor?.user_id || !formData.name?.trim() || !termsAccepted) return;
    setSubmitting(true);

    let aiScore: number | null = null;
    let aiCategory: string | null = null;
    let aiSummary: string | null = null;

    // Attempt AI scoring (non-blocking on failure)
    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const res = await globalThis.fetch(
        `https://${projectId}.supabase.co/functions/v1/cruzi-ai`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "enquiry-score", enquiryAnswers: formData }),
        }
      );
      if (res.ok) {
        const json = await res.json();
        aiScore = json.score ?? null;
        aiCategory = json.category ?? null;
        aiSummary = json.summary ?? null;
      }
    } catch {
      // AI scoring is best-effort
    }

    try {
      const { error } = await supabase.from("instructor_enquiries").insert({
        instructor_id: instructor.user_id,
        name: formData.name.trim(),
        email: formData.email?.trim() || null,
        phone: formData.phone?.trim() || null,
        postcode: formData.postcode?.trim() || null,
        licence_type: formData.licence_type || null,
        theory_passed: formData.theory_passed || null,
        previous_lessons: formData.previous_lessons || null,
        previous_hours: formData.previous_hours?.trim() || null,
        previous_instructor: formData.previous_instructor?.trim() || null,
        test_booked: formData.test_booked || null,
        test_date: formData.test_date?.trim() || null,
        lessons_per_week: formData.lessons_per_week || null,
        parents_practice: formData.parents_practice || null,
        medical_conditions: formData.medical_conditions?.trim() || null,
        reliability: formData.reliability || null,
        message: formData.message?.trim() || null,
        ai_score: aiScore,
        ai_category: aiCategory,
        ai_summary: aiSummary,
        status: "new",
      });
      if (error) throw error;
      setSubmitted(true);
    } catch (err) {
      console.error("Failed to submit enquiry:", err);
    } finally {
      setSubmitting(false);
    }
  };

  /* ── render gates ── */
  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound) return <NotFoundScreen />;

  if (submitted) {
    const firstName = instructor?.full_name?.split(" ")[0] || "Your instructor";
    return <ThankYouScreen firstName={firstName} />;
  }

  return (
    <div className="fixed inset-0 bg-background flex flex-col z-50">
      <PageHeader />
      <div className="flex-1 overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>

      {/* Hero */}
      <section className="bg-card px-4 py-10 text-center">
        <div className="max-w-xl mx-auto">
          {instructor?.avatar_url && (
            <img
              src={instructor.avatar_url}
              alt={instructor.full_name || "Instructor"}
              className="w-28 h-28 rounded-full mx-auto mb-4 border-4 border-primary/20 object-cover shadow-md"
            />
          )}
          <h2 className="text-lg font-semibold font-outfit text-foreground">
            {instructor?.full_name}
          </h2>
          {instructor?.coverage_area && (
            <p className="text-sm text-muted-foreground mt-1">
              Covering {instructor.coverage_area}
            </p>
          )}
          <div className="mt-6">
            <h1 className="text-2xl md:text-3xl font-bold font-outfit text-foreground inline-block">
              {instructor?.enquiry_welcome_title || `Learn to drive with ${instructor?.full_name}`}
              <span className="block h-1 w-16 bg-primary rounded-full mx-auto mt-2" />
            </h1>
          </div>
          {instructor?.enquiry_welcome_message && (
            <p className="text-muted-foreground text-sm md:text-base mt-4 max-w-md mx-auto leading-relaxed">
              {instructor.enquiry_welcome_message}
            </p>
          )}
        </div>
      </section>

      {/* Form */}
      <section className="flex-1 px-4 py-8">
        <div className="max-w-xl mx-auto">
          <div className="bg-card rounded-2xl shadow-lg p-6 md:p-8">
            <h3 className="text-xl font-bold font-outfit text-foreground mb-6">
              Tell us about yourself
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Text inputs */}
              {[
                { key: "name", label: "Full name *", type: "text", required: true },
                { key: "email", label: "Email address", type: "email" },
                { key: "phone", label: "Phone number", type: "tel" },
                { key: "postcode", label: "Postcode", type: "text" },
              ].map((f) => (
                <div key={f.key}>
                  <Label htmlFor={f.key} className="text-sm font-medium text-foreground">{f.label}</Label>
                  <Input
                    id={f.key}
                    type={f.type}
                    required={f.required}
                    value={formData[f.key] || ""}
                    onChange={(e) => updateField(f.key, e.target.value)}
                    className="mt-1"
                  />
                </div>
              ))}

              {/* Radio fields */}
              {RADIO_FIELDS.map((field) => (
                <div key={field.key}>
                  <RadioField
                    label={field.label}
                    value={formData[field.key] || ""}
                    options={field.options}
                    onChange={(v) => updateField(field.key, v)}
                  />

                  {/* Conditional: previous hours */}
                  {field.key === "previous_lessons" && formData.previous_lessons === "Yes" && (
                    <div className="mt-3 ml-1">
                      <Label htmlFor="previous_hours" className="text-sm font-medium text-foreground">
                        Approximately how many hours?
                      </Label>
                      <Input
                        id="previous_hours"
                        type="text"
                        value={formData.previous_hours || ""}
                        onChange={(e) => updateField("previous_hours", e.target.value)}
                        className="mt-1"
                        placeholder="e.g. 20 hours"
                      />
                    </div>
                  )}

                  {/* Conditional: test date + warning */}
                  {field.key === "test_booked" && formData.test_booked === "Yes" && (
                    <div className="mt-3 ml-1 space-y-3">
                      <div>
                        <Label htmlFor="test_date" className="text-sm font-medium text-foreground">
                          Approximate test date
                        </Label>
                        <Input
                          id="test_date"
                          type="date"
                          value={formData.test_date || ""}
                          onChange={(e) => updateField("test_date", e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div className="flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2.5 text-xs text-amber-800">
                        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />
                        <span>Note: having a test booked before starting lessons may affect availability.</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Medical */}
              <div>
                <Label htmlFor="medical_conditions" className="text-sm font-medium text-foreground">
                  Any medical conditions your instructor should be aware of?
                </Label>
                <Textarea
                  id="medical_conditions"
                  value={formData.medical_conditions || ""}
                  onChange={(e) => updateField("medical_conditions", e.target.value)}
                  className="mt-1"
                  rows={2}
                  placeholder="Optional"
                />
              </div>

              {/* Message */}
              <div>
                <Label htmlFor="message" className="text-sm font-medium text-foreground">
                  A message for your instructor
                </Label>
                <Textarea
                  id="message"
                  value={formData.message || ""}
                  onChange={(e) => updateField("message", e.target.value)}
                  className="mt-1"
                  rows={3}
                  placeholder="Optional"
                />
              </div>

              {/* Terms */}
              <label className="flex items-start gap-3 cursor-pointer">
                <Checkbox
                  checked={termsAccepted}
                  onCheckedChange={(v) => setTermsAccepted(v === true)}
                  className="mt-0.5"
                />
                <span className="text-sm text-foreground leading-snug">
                  I have read and agree to the instructor's terms of engagement
                </span>
              </label>

              {/* Submit */}
              <Button
                type="submit"
                disabled={submitting || !formData.name?.trim() || !termsAccepted}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-xl text-base"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Sending...
                  </>
                ) : (
                  "Send My Enquiry"
                )}
              </Button>
            </form>
          </div>
        </div>
      </section>

      <PageFooter instructorName={instructor?.full_name} />
      </div>
    </div>
  );
};

export default EnquiryPage;
