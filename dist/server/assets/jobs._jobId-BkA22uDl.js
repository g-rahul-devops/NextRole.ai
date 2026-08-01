import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
//#region src/routes/_authenticated/jobs.$jobId.tsx
var $$splitComponentImporter = () => import("./jobs._jobId-BPJBnuu6.js");
var Route = createFileRoute("/_authenticated/jobs/$jobId")({
	head: () => ({ meta: [
		{ title: "Job detail — PipelineMatch" },
		{
			name: "description",
			content: "Match breakdown, visa signal and AI cover letter for this role."
		},
		{
			property: "og:title",
			content: "Job detail — PipelineMatch"
		},
		{
			property: "og:description",
			content: "See why this DevOps role scored the way it did."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
