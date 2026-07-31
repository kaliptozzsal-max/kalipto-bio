import type { SkillIcon } from "./skills";

export type FocusArea = {
  id: string;
  title: string;
  /** What is actively being learned and built in this area, in plain terms. */
  body: string;
  icon: SkillIcon;
  accent: string;
  /** Technologies currently in use here. */
  tools: readonly string[];
};

/**
 * What I'm working on and learning right now.
 *
 * This section replaces a project showcase on purpose. It describes current
 * direction and practice rather than claiming finished work, shipped products or
 * outcomes. Keep it that way — update it as the focus genuinely shifts.
 */
export const focusAreas: readonly FocusArea[] = [
  {
    id: "security",
    title: "Web & API Security",
    body: "Learning to read an application the way an attacker would: how authentication, authorisation and input handling break, and how to describe a finding clearly enough to be acted on. Most of my time here goes into practice targets and reading write-ups.",
    icon: "shield",
    accent: "from-electric-500/20 via-electric-400/8 to-transparent",
    tools: [
      "Web Security",
      "API Security",
      "Vulnerability Assessment",
      "Penetration Testing",
    ],
  },
  {
    id: "ai",
    title: "AI Engineering",
    body: "Building small, useful things with language models — retrieval over my own documents, prompts that hold up when inputs vary, and agents that call tools instead of guessing. Running open-weight models locally to understand the tradeoffs against hosted APIs.",
    icon: "brain",
    accent: "from-cyber-violet/20 via-cyber-violet/8 to-transparent",
    tools: [
      "OpenAI API",
      "Local LLMs",
      "RAG",
      "Prompt Engineering",
      "AI Agents",
    ],
  },
  {
    id: "automation",
    title: "Automation",
    body: "Replacing work I have done twice by hand with something repeatable. Mostly Python scripts growing into scheduled jobs, plus GitHub Actions for the build, test and deploy path.",
    icon: "code",
    accent: "from-cyber-cyan/20 via-cyber-cyan/8 to-transparent",
    tools: ["Python", "GitHub Actions", "Security Automation", "AI Automation"],
  },
  {
    id: "engineering",
    title: "Full Stack Development",
    body: "Getting better at building a whole thing end to end: a typed API, a schema that fits the problem, and an interface that stays fast and accessible on a real phone. Currently focused on Next.js with TypeScript, and FastAPI on the server side.",
    icon: "code",
    accent: "from-electric-400/20 via-electric-300/8 to-transparent",
    tools: ["TypeScript", "Next.js", "React", "FastAPI", "Node.js"],
  },
  {
    id: "infrastructure",
    title: "Infrastructure & Deployment",
    body: "Learning to run what I build. Containerising services, putting Nginx in front of them, deploying to a VPS, and understanding what PostgreSQL and Redis are each actually good at.",
    icon: "cloud",
    accent: "from-electric-500/20 via-cyber-cyan/8 to-transparent",
    tools: ["Docker", "Linux", "Nginx", "VPS Deployment", "PostgreSQL", "Redis"],
  },
  {
    id: "clinical",
    title: "Clinical Engineering",
    body: "The area where careful process matters most. Working with medical equipment — maintenance, equipment management and biomedical systems — and looking for the places where software could reduce manual, error-prone steps.",
    icon: "pulse",
    accent: "from-emerald-400/20 via-emerald-400/8 to-transparent",
    tools: [
      "Clinical Engineering",
      "Medical Device Maintenance",
      "Equipment Management",
      "Preventive Maintenance",
    ],
  },
] as const;
