import type { IconType } from "react-icons";
import {
  SiDocker,
  SiFastapi,
  SiGit,
  SiJavascript,
  SiLinux,
  SiNextdotjs,
  SiOpenai,
  SiPostgresql,
  SiPython,
  SiReact,
  SiRedis,
  SiTypescript,
} from "react-icons/si";

export type TechItem = {
  name: string;
  Icon: IconType;
  /** Brand colour used for the hover glow */
  color: string;
};

export const techStack: readonly TechItem[] = [
  { name: "Python", Icon: SiPython, color: "#3776AB" },
  { name: "JavaScript", Icon: SiJavascript, color: "#F7DF1E" },
  { name: "TypeScript", Icon: SiTypescript, color: "#3178C6" },
  { name: "React", Icon: SiReact, color: "#61DAFB" },
  { name: "Next.js", Icon: SiNextdotjs, color: "#FFFFFF" },
  { name: "FastAPI", Icon: SiFastapi, color: "#009688" },
  { name: "Docker", Icon: SiDocker, color: "#2496ED" },
  { name: "PostgreSQL", Icon: SiPostgresql, color: "#4169E1" },
  { name: "Redis", Icon: SiRedis, color: "#FF4438" },
  { name: "Git", Icon: SiGit, color: "#F05032" },
  { name: "Linux", Icon: SiLinux, color: "#FCC624" },
  { name: "OpenAI", Icon: SiOpenai, color: "#10A37F" },
] as const;
