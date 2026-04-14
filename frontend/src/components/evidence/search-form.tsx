"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import type { EvidenceRequest } from "@/lib/types";

interface SearchFormProps {
  onSubmit: (req: EvidenceRequest) => void;
  loading: boolean;
}

export function SearchForm({ onSubmit, loading }: SearchFormProps) {
  const [question, setQuestion] = useState("");
  const [species, setSpecies] = useState("");
  const [location, setLocation] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim()) return;
    onSubmit({ question, species, location });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="question" className="text-base font-medium">
          What conservation question do you need answered?
        </Label>
        <Textarea
          id="question"
          placeholder="e.g., What is the most effective method to restore degraded coral reefs?"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={3}
          className="resize-none text-base"
        />
      </div>

      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="text-muted-foreground"
        >
          {showFilters ? (
            <ChevronUp className="mr-1 h-4 w-4" />
          ) : (
            <ChevronDown className="mr-1 h-4 w-4" />
          )}
          Filters
        </Button>
      </div>

      {showFilters && (
        <div className="grid gap-4 sm:grid-cols-2 animate-in fade-in-0 slide-in-from-top-2 duration-200">
          <div className="space-y-2">
            <Label htmlFor="species">Species or taxonomic group</Label>
            <Input
              id="species"
              placeholder="e.g., Panthera tigris, mammals"
              value={species}
              onChange={(e) => setSpecies(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Geographic region</Label>
            <Input
              id="location"
              placeholder="e.g., Southeast Asia, Amazon"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        </div>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={loading || !question.trim()}
        className="w-full sm:w-auto"
      >
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Search className="mr-2 h-4 w-4" />
        )}
        {loading ? "Synthesising evidence..." : "Search Evidence"}
      </Button>
    </form>
  );
}
