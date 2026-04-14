"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Loader2 } from "lucide-react";
import type { ConservationProject } from "@/lib/types";

const speciesOptions = [
  "mammals", "birds", "reptiles", "fish",
  "invertebrates", "plants", "fungi", "general",
];

const interventionOptions = [
  "habitat_restoration", "species_reintro", "protected_area",
  "invasive_control", "captive_breeding", "community_mgmt",
  "policy", "monitoring", "other",
];

interface ProjectFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Partial<ConservationProject>) => void;
  initial?: ConservationProject;
  loading?: boolean;
}

export function ProjectForm({
  open,
  onOpenChange,
  onSubmit,
  initial,
  loading,
}: ProjectFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [species, setSpecies] = useState<string[]>(
    initial?.species_groups ? initial.species_groups.split(",") : []
  );
  const [interventions, setInterventions] = useState<string[]>(
    initial?.intervention_types ? initial.intervention_types.split(",") : []
  );
  const [geography, setGeography] = useState(initial?.geography ?? "");
  const [alertFreq, setAlertFreq] = useState(
    initial?.alert_frequency ?? "weekly"
  );

  function toggleTag(list: string[], item: string, setter: (v: string[]) => void) {
    setter(
      list.includes(item) ? list.filter((x) => x !== item) : [...list, item]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      name,
      description,
      species_groups: species.join(","),
      intervention_types: interventions.join(","),
      geography,
      alert_frequency: alertFreq,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initial ? "Edit Project" : "New Project"}
          </DialogTitle>
          <DialogDescription>
            {initial
              ? "Update your conservation project details."
              : "Set up a conservation project to receive tailored alerts."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Tiger Recovery Programme"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="desc">Description</Label>
            <Textarea
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of your project goals..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Species groups</Label>
            <div className="flex flex-wrap gap-2">
              {speciesOptions.map((s) => (
                <Badge
                  key={s}
                  variant={species.includes(s) ? "default" : "outline"}
                  className="cursor-pointer capitalize"
                  onClick={() => toggleTag(species, s, setSpecies)}
                >
                  {s}
                  {species.includes(s) && <X className="ml-1 h-3 w-3" />}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Intervention types</Label>
            <div className="flex flex-wrap gap-2">
              {interventionOptions.map((iv) => (
                <Badge
                  key={iv}
                  variant={interventions.includes(iv) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() =>
                    toggleTag(interventions, iv, setInterventions)
                  }
                >
                  {iv.replace(/_/g, " ")}
                  {interventions.includes(iv) && (
                    <X className="ml-1 h-3 w-3" />
                  )}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="geo">Geography</Label>
            <Input
              id="geo"
              value={geography}
              onChange={(e) => setGeography(e.target.value)}
              placeholder="e.g., Southeast Asia"
            />
          </div>

          <div className="space-y-2">
            <Label>Alert frequency</Label>
            <Select value={alertFreq} onValueChange={(v) => { if (v) setAlertFreq(v); }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !name.trim()}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {initial ? "Save changes" : "Create project"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
