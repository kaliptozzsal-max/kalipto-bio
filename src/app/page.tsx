import { Suspense } from "react";
import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { CurrentFocus } from "@/components/sections/CurrentFocus";
import { Hero } from "@/components/sections/Hero";
import { Projects } from "@/components/sections/Projects";
import { Skills } from "@/components/sections/Skills";
import { TechStack } from "@/components/sections/TechStack";

export default function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <Skills />
      <CurrentFocus />
      {/*
        Projects reaches out to the GitHub API. The Suspense boundary keeps a
        slow or rate-limited response from holding up the rest of the page —
        everything above and below streams immediately.
      */}
      <Suspense fallback={null}>
        <Projects />
      </Suspense>
      <TechStack />
      <Contact />
    </>
  );
}
