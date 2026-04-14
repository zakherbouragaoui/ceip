import Link from "next/link";
import { Leaf, Search, Bell, BarChart3, BookOpen, Shield, ArrowRight } from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Evidence-Based Answers",
    description:
      "Ask any conservation question and get synthesized guidance from 17,000+ peer-reviewed papers.",
  },
  {
    icon: BookOpen,
    title: "4,000+ Interventions",
    description:
      "Access the full Conservation Evidence database with effectiveness ratings and study counts.",
  },
  {
    icon: Bell,
    title: "Live Alerts",
    description:
      "Set up projects and receive alerts when new research matching your work is published.",
  },
  {
    icon: BarChart3,
    title: "56,000 Species",
    description:
      "Browse IUCN Red List species with conservation status and linked interventions.",
  },
  {
    icon: Shield,
    title: "Cited & Validated",
    description:
      "Every answer includes numbered citations, confidence scores, and evidence gap analysis.",
  },
  {
    icon: Leaf,
    title: "Weekly Updates",
    description:
      "An autonomous agent scans new publications every week, keeping the database current.",
  },
];

const steps = [
  {
    num: "01",
    title: "Ask a Question",
    description: "Describe your conservation challenge in natural language.",
  },
  {
    num: "02",
    title: "AI Synthesises Evidence",
    description: "Our RAG pipeline retrieves and analyzes relevant research.",
  },
  {
    num: "03",
    title: "Get Cited Guidance",
    description: "Receive actionable recommendations backed by specific papers.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Nav */}
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Leaf className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold tracking-tight">CEIP</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-24 text-center">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm text-muted-foreground">
            <Leaf className="h-3.5 w-3.5 text-primary" />
            AI-Powered Conservation Intelligence
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Evidence-based guidance for{" "}
            <span className="text-primary">conservation</span> practitioners
          </h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            CEIP combines 17,000+ research papers, 4,000+ proven interventions,
            and 56,000 species records with AI synthesis to give you cited,
            actionable conservation guidance.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Start for free <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-md border px-6 py-3 text-sm font-medium hover:bg-accent transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-muted/30 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-2xl font-semibold tracking-tight sm:text-3xl">
            Everything you need for evidence-based conservation
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
            A single platform that brings together research, data, and AI to
            support your conservation decisions.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border bg-card p-6 hover:shadow-md transition-shadow"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-2xl font-semibold tracking-tight sm:text-3xl">
            How it works
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {steps.map((s) => (
              <div key={s.num} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                  {s.num}
                </div>
                <h3 className="font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {s.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-primary/5 py-16">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h2 className="text-2xl font-semibold tracking-tight">
            Ready to make evidence-based decisions?
          </h2>
          <p className="mt-3 text-muted-foreground">
            Join CEIP and get instant access to the world&apos;s conservation
            evidence, synthesized by AI.
          </p>
          <Link
            href="/register"
            className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Get Started <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="mx-auto max-w-6xl px-4 flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Leaf className="h-4 w-4 text-primary" />
            <span>CEIP</span>
          </div>
          <p>Conservation Evidence Intelligence Platform</p>
        </div>
      </footer>
    </div>
  );
}
