import { SiGithub, SiLinkedin, SiTelegram, SiX } from "react-icons/si";
import type { ContactIcon } from "@/data/site";
import { BroadcastIcon, MailIcon, PhoneIcon } from "./Icon";

const map = {
  email: MailIcon,
  phone: PhoneIcon,
  telegram: SiTelegram,
  broadcast: BroadcastIcon,
  github: SiGithub,
  linkedin: SiLinkedin,
  x: SiX,
} as const;

export function SocialIcon({
  icon,
  className,
}: {
  icon: ContactIcon;
  className?: string;
}) {
  const Glyph = map[icon];
  return <Glyph className={className} aria-hidden="true" />;
}
