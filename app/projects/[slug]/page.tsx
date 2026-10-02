import { notFound } from "next/navigation";
import { allWork } from "@/data/projects";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProjectDetailClient } from "./ProjectDetailClient";
import { ScudemDetail } from "./ScudemDetail";

export function generateStaticParams() {
  return allWork.map((p) => ({ slug: p.slug }));
}

export default function ProjectDetail({
  params,
}: {
  params: { slug: string };
}) {
  const project = allWork.find((p) => p.slug === params.slug);
  if (!project) notFound();

  const currentIndex = allWork.findIndex((p) => p.slug === params.slug);
  const nextProject = allWork[(currentIndex + 1) % allWork.length];

  return (
    <main className="bg-base">
      <Navbar />
      {project.slug === "scudem" ? (
        <ScudemDetail project={project} nextProject={nextProject} />
      ) : (
        <ProjectDetailClient project={project} nextProject={nextProject} />
      )}
      <Footer />
    </main>
  );
}
