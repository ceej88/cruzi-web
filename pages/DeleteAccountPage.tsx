import React, { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const DeleteAccountPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("delete-user-account", {
        body: { email: email.trim(), confirm: true },
      });

      if (fnError) {
        setError(fnError.message || "Something went wrong. Please try again.");
      } else {
        setSuccess(true);
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="w-full py-5 px-6" style={{ backgroundColor: "#7c3aed" }}>
        <Link to="/" className="text-2xl font-black font-outfit text-white tracking-tight">
          Cruzi
        </Link>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-start justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {success ? (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold font-outfit text-foreground">
                Request Received
              </h1>
              <p className="text-base text-muted-foreground leading-relaxed">
                Your deletion request has been received. Your account will be deleted within 24 hours.
              </p>
              <Link
                to="/"
                className="inline-block text-sm font-medium underline underline-offset-4"
                style={{ color: "#7c3aed" }}
              >
                Back to home
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <h1 className="text-2xl font-bold font-outfit text-foreground">
                Delete Your Account
              </h1>
              <p className="text-base text-muted-foreground leading-relaxed">
                Deleting your account is permanent. All your data including lessons, progress, and payments will be removed and cannot be recovered.
              </p>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {loading ? "Submitting..." : "Request Account Deletion"}
              </Button>

              <Link
                to="/"
                className="inline-block text-sm font-medium underline underline-offset-4"
                style={{ color: "#7c3aed" }}
              >
                Back to home
              </Link>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};

export default DeleteAccountPage;
