export type SkillIcon = "shield" | "brain" | "code" | "cloud" | "pulse";

export type SkillCategory = {
  title: string;
  icon: SkillIcon;
  /** Tailwind gradient stops for the card's accent wash. */
  accent: string;
  items: readonly string[];
};

/**
 * Technologies grouped by area.
 *
 * Deliberately unranked: no percentages, no proficiency bars, no ordering that
 * implies a skill level. These are the areas and tools worked with, nothing more.
 */
export const skillCategories: readonly SkillCategory[] = [
  {
    title: "Cybersecurity",
    icon: "shield",
    accent: "from-electric-500/20 via-electric-400/8 to-transparent",
    items: [
      "Web Security",
      "API Security",
      "Bug Bounty Research",
      "Vulnerability Assessment",
      "Penetration Testing",
      "Security Automation",
    ],
  },
  {
    title: "Artificial Intelligence",
    icon: "brain",
    accent: "from-cyber-violet/20 via-cyber-violet/8 to-transparent",
    items: [
      "OpenAI API",
      "Local LLMs",
      "AI Agents",
      "Prompt Engineering",
      "Retrieval-Augmented Generation (RAG)",
      "AI Automation",
    ],
  },
  {
    title: "Development",
    icon: "code",
    accent: "from-cyber-cyan/20 via-cyber-cyan/8 to-transparent",
    items: [
      "Python",
      "JavaScript",
      "TypeScript",
      "Node.js",
      "FastAPI",
      "Next.js",
      "React",
    ],
  },
  {
    title: "Cloud & DevOps",
    icon: "cloud",
    accent: "from-electric-400/20 via-electric-300/8 to-transparent",
    items: [
      "Docker",
      "Linux",
      "VPS Deployment",
      "Nginx",
      "GitHub Actions",
      "PostgreSQL",
      "Redis",
    ],
  },
  {
    title: "Medical Engineering",
    icon: "pulse",
    accent: "from-emerald-400/20 via-emerald-400/8 to-transparent",
    items: [
      "Clinical Engineering",
      "Medical Device Maintenance",
      "Equipment Management",
      "Biomedical Systems",
      "Preventive Maintenance",
    ],
  },
] as const;
