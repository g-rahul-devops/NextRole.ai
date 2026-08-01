import { t as supabase } from "./client-DCjuFEfc.js";
import { t as Route$9 } from "./jobs._jobId-BkA22uDl.js";
import { useEffect } from "react";
import { HeadContent, Link, Outlet, Scripts, createFileRoute, createRootRouteWithContext, createRouter, lazyRouteComponent, redirect, useRouter } from "@tanstack/react-router";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
//#region src/styles.css?url
var styles_default = "/assets/styles-D_ctEzwd.css";
//#endregion
//#region src/components/ui/sonner.tsx
function Toaster(props) {
	return /* @__PURE__ */ jsx("div", {
		"data-testid": "toaster",
		...props
	});
}
//#endregion
//#region src/routes/__root.tsx
function NotFoundComponent() {
	return /* @__PURE__ */ jsx("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ jsxs("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ jsx("h1", {
					className: "text-7xl font-bold text-foreground",
					children: "404"
				}),
				/* @__PURE__ */ jsx("h2", {
					className: "mt-4 text-xl font-semibold text-foreground",
					children: "Page not found"
				}),
				/* @__PURE__ */ jsx("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "The page you're looking for doesn't exist or has been moved."
				}),
				/* @__PURE__ */ jsx("div", {
					className: "mt-6",
					children: /* @__PURE__ */ jsx(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Go home"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	useEffect(() => {}, [error]);
	return /* @__PURE__ */ jsx("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ jsxs("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ jsx("h1", {
					className: "text-xl font-semibold tracking-tight text-foreground",
					children: "This page didn't load"
				}),
				/* @__PURE__ */ jsx("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Something went wrong on our end. You can try refreshing or head back home."
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ jsx("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Try again"
					}), /* @__PURE__ */ jsx("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
						children: "Go home"
					})]
				})
			]
		})
	});
}
var Route$8 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "PipelineMatch — AI DevOps Job Matching" },
			{
				name: "description",
				content: "AI agent that finds Azure, GCP and SRE roles across job portals, scores them against your resume and tracks your applications."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			}
		],
		links: [
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Outfit:wght@300;400;500;600;700&display=swap"
			},
			{
				rel: "icon",
				href: "/favicon.ico",
				type: "image/x-icon"
			}
		]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ jsxs("html", {
		lang: "en",
		className: "dark",
		children: [/* @__PURE__ */ jsx("head", { children: /* @__PURE__ */ jsx(HeadContent, {}) }), /* @__PURE__ */ jsxs("body", { children: [children, /* @__PURE__ */ jsx(Scripts, {})] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$8.useRouteContext();
	const router = useRouter();
	useEffect(() => {
		const { data } = supabase.auth.onAuthStateChange((event) => {
			if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
			router.invalidate();
			if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
		});
		return () => data.subscription.unsubscribe();
	}, [router, queryClient]);
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Outlet, {}), /* @__PURE__ */ jsx(Toaster, {
		richColors: true,
		position: "top-right"
	})] });
}
//#endregion
//#region src/routes/index.tsx
var $$splitComponentImporter$7 = () => import("./routes-CqQk-eUG.js");
var Route$7 = createFileRoute("/")({
	head: () => ({ meta: [
		{ title: "PipelineMatch — AI DevOps & SRE Job Matching Agent" },
		{
			name: "description",
			content: "An AI agent that pulls DevOps, SRE and cloud roles from job portals, flags visa sponsorship, and ranks every posting against your resume."
		},
		{
			property: "og:title",
			content: "PipelineMatch — AI DevOps Job Matching Agent"
		},
		{
			property: "og:description",
			content: "Fetch, dedupe and score Azure/GCP DevOps roles against your resume with semantic matching."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
//#endregion
//#region src/routes/_authenticated/route.tsx
var $$splitComponentImporter$6 = () => import("./route-DDdUVKhN.js");
var Route$6 = createFileRoute("/_authenticated")({
	ssr: false,
	beforeLoad: async () => {
		const { data, error } = await supabase.auth.getUser();
		if (error || !data.user) throw redirect({ to: "/auth" });
		return { user: data.user };
	},
	component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
//#endregion
//#region src/routes/auth.tsx
var $$splitComponentImporter$5 = () => import("./auth-DYi9qxOy.js");
var Route$5 = createFileRoute("/auth")({
	head: () => ({ meta: [
		{ title: "Sign in — PipelineMatch" },
		{
			name: "description",
			content: "Sign in or create an account to match DevOps and SRE jobs to your resume."
		},
		{
			property: "og:title",
			content: "Sign in — PipelineMatch"
		},
		{
			property: "og:description",
			content: "Access your DevOps job matches, saved roles and application tracker."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
//#endregion
//#region src/routes/_authenticated/analytics.tsx
var $$splitComponentImporter$4 = () => import("./analytics-Cu3_aVaJ.js");
var Route$4 = createFileRoute("/_authenticated/analytics")({
	head: () => ({ meta: [
		{ title: "Analytics — PipelineMatch" },
		{
			name: "description",
			content: "Match quality and application funnel analytics for your DevOps job search."
		},
		{
			property: "og:title",
			content: "Analytics — PipelineMatch"
		},
		{
			property: "og:description",
			content: "Funnel conversion and match score distribution."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
//#endregion
//#region src/routes/_authenticated/applications.tsx
var $$splitComponentImporter$3 = () => import("./applications-pSylDSoL.js");
var Route$3 = createFileRoute("/_authenticated/applications")({
	head: () => ({ meta: [
		{ title: "Application tracker — PipelineMatch" },
		{
			name: "description",
			content: "Track applied, interview, rejected and offer stages for every role."
		},
		{
			property: "og:title",
			content: "Application tracker — PipelineMatch"
		},
		{
			property: "og:description",
			content: "Your DevOps job pipeline, stage by stage."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
//#endregion
//#region src/routes/_authenticated/dashboard.tsx
var $$splitComponentImporter$2 = () => import("./dashboard-Cg7CN89V.js");
var Route$2 = createFileRoute("/_authenticated/dashboard")({
	head: () => ({ meta: [
		{ title: "Dashboard — PipelineMatch" },
		{
			name: "description",
			content: "Upload your resume, run the fetch agent and score DevOps jobs."
		},
		{
			property: "og:title",
			content: "Dashboard — PipelineMatch"
		},
		{
			property: "og:description",
			content: "Resume parsing, job ingestion and match scoring in one place."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
//#endregion
//#region src/routes/_authenticated/saved.tsx
var $$splitComponentImporter$1 = () => import("./saved-CNjii9Kh.js");
var Route$1 = createFileRoute("/_authenticated/saved")({
	head: () => ({ meta: [
		{ title: "Saved jobs — PipelineMatch" },
		{
			name: "description",
			content: "Roles you bookmarked for later."
		},
		{
			property: "og:title",
			content: "Saved jobs — PipelineMatch"
		},
		{
			property: "og:description",
			content: "Your shortlist of DevOps and SRE roles."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
//#endregion
//#region src/routes/_authenticated/jobs.index.tsx
var $$splitComponentImporter = () => import("./jobs.index-CMYt42g4.js");
var Route = createFileRoute("/_authenticated/jobs/")({
	head: () => ({ meta: [
		{ title: "Jobs — PipelineMatch" },
		{
			name: "description",
			content: "Browse and filter DevOps, SRE and cloud roles ranked by match score."
		},
		{
			property: "og:title",
			content: "Jobs — PipelineMatch"
		},
		{
			property: "og:description",
			content: "Filter by region, remote type, visa sponsorship and match score."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
//#region src/routeTree.gen.ts
var IndexRoute = Route$7.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$8
});
var AuthenticatedRouteRoute = Route$6.update({
	id: "/_authenticated",
	getParentRoute: () => Route$8
});
var AuthRoute = Route$5.update({
	id: "/auth",
	path: "/auth",
	getParentRoute: () => Route$8
});
var AuthenticatedAnalyticsRoute = Route$4.update({
	id: "/analytics",
	path: "/analytics",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedApplicationsRoute = Route$3.update({
	id: "/applications",
	path: "/applications",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedDashboardRoute = Route$2.update({
	id: "/dashboard",
	path: "/dashboard",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedSavedRoute = Route$1.update({
	id: "/saved",
	path: "/saved",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedJobsIndexRoute = Route.update({
	id: "/jobs/",
	path: "/jobs/",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedRouteRouteChildren = {
	AuthenticatedAnalyticsRoute,
	AuthenticatedApplicationsRoute,
	AuthenticatedDashboardRoute,
	AuthenticatedSavedRoute,
	AuthenticatedJobsJobIdRoute: Route$9.update({
		id: "/jobs/$jobId",
		path: "/jobs/$jobId",
		getParentRoute: () => AuthenticatedRouteRoute
	}),
	AuthenticatedJobsIndexRoute
};
var rootRouteChildren = {
	IndexRoute,
	AuthenticatedRouteRoute: AuthenticatedRouteRoute._addFileChildren(AuthenticatedRouteRouteChildren),
	AuthRoute
};
var routeTree = Route$8._addFileChildren(rootRouteChildren)._addFileTypes();
//#endregion
//#region src/router.tsx
var getRouter = () => createRouter({
	routeTree,
	defaultPreload: "intent",
	defaultStaleTime: 5e3
});
//#endregion
export { getRouter };
