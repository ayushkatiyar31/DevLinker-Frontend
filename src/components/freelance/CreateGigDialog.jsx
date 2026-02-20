import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, X, Upload, Link as LinkIcon, DollarSign, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { createGig } from "@/services/freelanceService";

const categories = [
  "Web Dev", "App Dev", "AI/ML", "UI/UX", "DevOps", "DSA", "Blockchain", "Data Science", "Other"
];

const suggestedSkills = [
  "React", "TypeScript", "Node.js", "Python", "Figma", "AWS", "Docker", 
  "Kubernetes", "Solidity", "Flutter", "React Native", "Vue.js", "Angular",
  "PostgreSQL", "MongoDB", "GraphQL", "TensorFlow", "PyTorch"
];

export function CreateGigDialog({ trigger, onCreated }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    fullDescription: "",
    skills: [],
    budgetType: "fixed",
    budgetMin: "",
    budgetMax: "",
    duration: "",
    deadline: "",
    visibility: "public",
    contactPreference: "platform",
  });
  const [skillInput, setSkillInput] = useState("");

  const addSkill = (skill) => {
    if (skill && !formData.skills.includes(skill)) {
      setFormData({ ...formData, skills: [...formData.skills, skill] });
    }
    setSkillInput("");
  };

  const removeSkill = (skill) => {
    setFormData({ ...formData, skills: formData.skills.filter((s) => s !== skill) });
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.category || !formData.description) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createGig({
        ...formData,
        budgetMin: formData.budgetMin === "" ? 0 : Number(formData.budgetMin),
        budgetMax: formData.budgetMax === "" ? 0 : Number(formData.budgetMax),
        deadline: formData.deadline || null,
      });

      toast({
        title: "Gig Posted!",
        description: "Your gig has been published successfully.",
      });

      setOpen(false);
      setStep(1);
      setFormData({
        title: "",
        category: "",
        description: "",
        fullDescription: "",
        skills: [],
        budgetType: "fixed",
        budgetMin: "",
        budgetMax: "",
        duration: "",
        deadline: "",
        visibility: "public",
        contactPreference: "platform",
      });

      onCreated?.();
    } catch (e) {
      toast({
        title: "Failed to post gig",
        description: e?.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gradient-primary text-primary-foreground">
            <Plus className="w-4 h-4 mr-2" />
            Post New Gig
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Gig</DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step >= s
                    ? "gradient-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {s}
              </div>
              {s < 3 && (
                <div
                  className={`w-16 h-1 mx-2 rounded ${
                    step > s ? "gradient-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div className="space-y-2">
              <Label htmlFor="title">Gig Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Build a Modern E-commerce Dashboard"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(v) => setFormData({ ...formData, category: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Short Description *</Label>
              <Textarea
                id="description"
                placeholder="Brief overview of your project (displayed in listings)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullDescription">Detailed Description</Label>
              <Textarea
                id="fullDescription"
                placeholder="Provide detailed requirements, tech stack, deliverables... (Markdown supported)"
                value={formData.fullDescription}
                onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
                rows={6}
              />
            </div>

            <Button onClick={() => setStep(2)} className="w-full">
              Continue
            </Button>
          </div>
        )}

        {/* Step 2: Skills & Budget */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div className="space-y-2">
              <Label>Required Skills</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a skill..."
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addSkill(skillInput)}
                />
                <Button variant="outline" onClick={() => addSkill(skillInput)}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="gap-1">
                    {skill}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => removeSkill(skill)} />
                  </Badge>
                ))}
              </div>
              <div className="mt-3">
                <p className="text-xs text-muted-foreground mb-2">Suggested:</p>
                <div className="flex flex-wrap gap-1">
                  {suggestedSkills.filter((s) => !formData.skills.includes(s)).slice(0, 8).map((skill) => (
                    <Badge
                      key={skill}
                      variant="outline"
                      className="cursor-pointer hover:bg-accent transition-colors text-xs"
                      onClick={() => addSkill(skill)}
                    >
                      + {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Budget Type</Label>
              <RadioGroup
                value={formData.budgetType}
                onValueChange={(v) => setFormData({ ...formData, budgetType: v })}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="fixed" id="fixed" />
                  <Label htmlFor="fixed" className="cursor-pointer">Fixed Price</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="hourly" id="hourly" />
                  <Label htmlFor="hourly" className="cursor-pointer">Hourly Rate</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budgetMin">
                  Min Budget {formData.budgetType === "hourly" && "($/hr)"}
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="budgetMin"
                    type="number"
                    placeholder="1000"
                    value={formData.budgetMin}
                    onChange={(e) => setFormData({ ...formData, budgetMin: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="budgetMax">
                  Max Budget {formData.budgetType === "hourly" && "($/hr)"}
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="budgetMax"
                    type="number"
                    placeholder="5000"
                    value={formData.budgetMax}
                    onChange={(e) => setFormData({ ...formData, budgetMax: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Expected Duration</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="duration"
                    placeholder="e.g., 2-3 weeks"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                Back
              </Button>
              <Button onClick={() => setStep(3)} className="flex-1">
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Settings & Review */}
        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <div className="space-y-3">
              <Label>Visibility</Label>
              <RadioGroup
                value={formData.visibility}
                onValueChange={(v) => setFormData({ ...formData, visibility: v })}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="public" id="public" />
                  <div>
                    <Label htmlFor="public" className="cursor-pointer font-medium">Public</Label>
                    <p className="text-xs text-muted-foreground">Anyone can see this gig</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="community" id="community" />
                  <div>
                    <Label htmlFor="community" className="cursor-pointer font-medium">Community Only</Label>
                    <p className="text-xs text-muted-foreground">Only verified members can see</p>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label>Contact Preference</Label>
              <RadioGroup
                value={formData.contactPreference}
                onValueChange={(v) => setFormData({ ...formData, contactPreference: v })}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="platform" id="platform" />
                  <Label htmlFor="platform" className="cursor-pointer">Platform Chat</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="email" id="email" />
                  <Label htmlFor="email" className="cursor-pointer">Email</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Review Summary */}
            <div className="p-4 rounded-xl bg-muted/50 space-y-3">
              <h4 className="font-semibold">Review Your Gig</h4>
              <div className="space-y-2 text-sm">
                <p><span className="text-muted-foreground">Title:</span> {formData.title || "Not set"}</p>
                <p><span className="text-muted-foreground">Category:</span> {formData.category || "Not set"}</p>
                <p><span className="text-muted-foreground">Budget:</span> ${formData.budgetMin || "0"} - ${formData.budgetMax || "0"} {formData.budgetType === "hourly" && "/hr"}</p>
                <p><span className="text-muted-foreground">Duration:</span> {formData.duration || "Not set"}</p>
                <div className="flex flex-wrap gap-1 items-center">
                  <span className="text-muted-foreground">Skills:</span>
                  {formData.skills.length > 0 ? formData.skills.map((s) => (
                    <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                  )) : "None"}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                Back
              </Button>
              <Button onClick={handleSubmit} className="flex-1 gradient-primary text-primary-foreground">
                Publish Gig
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
