import { t as Button } from "./button-79MBYDnH.js";
import { r as signOutAuth } from "./auth-DBcUZEuj.js";
import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { useQueryClient } from "@tanstack/react-query";
import { BarChart3, Bookmark, Briefcase, KanbanSquare, LayoutDashboard, LogOut, Terminal } from "lucide-react";
//#region src/components/app-shell.tsx
var NAV = [
	{
		to: "/dashboard",
		label: "Dashboard",
		icon: LayoutDashboard
	},
	{
		to: "/jobs",
		label: "Jobs",
		icon: Briefcase
	},
	{
		to: "/saved",
		label: "Saved",
		icon: Bookmark
	},
	{
		to: "/applications",
		label: "Tracker",
		icon: KanbanSquare
	},
	{
		to: "/analytics",
		label: "Analytics",
		icon: BarChart3
	}
];
function AppShell({ children }) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	async function signOut() {
		await queryClient.cancelQueries();
		queryClient.clear();
		await signOutAuth();
		navigate({
			to: "/auth",
			replace: true
		});
	}
	return /* @__PURE__ */ jsxs("div", {
		className: "landing-shell app-shell",
		children: [/* @__PURE__ */ jsx("header", {
			className: "app-shell-header",
			children: /* @__PURE__ */ jsxs("div", {
				className: "app-shell-header-inner",
				children: [
					/* @__PURE__ */ jsxs(Link, {
						to: "/dashboard",
						className: "landing-brand",
						children: [/* @__PURE__ */ jsx("div", {
							className: "landing-brand-icon",
							children: /* @__PURE__ */ jsx(Terminal, { size: 18 })
						}), /* @__PURE__ */ jsx("span", { children: "PipelineMatch" })]
					}),
					/* @__PURE__ */ jsx("nav", {
						className: "app-shell-nav",
						children: NAV.map((item) => {
							const active = pathname.startsWith(item.to);
							return /* @__PURE__ */ jsxs(Link, {
								to: item.to,
								className: `app-shell-nav-link ${active ? "active" : ""}`,
								children: [/* @__PURE__ */ jsx(item.icon, { className: "size-4" }), /* @__PURE__ */ jsx("span", { children: item.label })]
							}, item.to);
						})
					}),
					/* @__PURE__ */ jsxs(Button, {
						variant: "ghost",
						size: "sm",
						onClick: signOut,
						children: [/* @__PURE__ */ jsx(LogOut, { className: "size-4" }), /* @__PURE__ */ jsx("span", {
							className: "hidden sm:inline",
							children: "Sign out"
						})]
					})
				]
			})
		}), /* @__PURE__ */ jsx("main", {
			className: "app-shell-main",
			children
		})]
	});
}
//#endregion
//#region src/routes/_authenticated/route.tsx?tsr-split=component
var SplitComponent = () => /* @__PURE__ */ jsx(AppShell, { children: /* @__PURE__ */ jsx(Outlet, {}) });
//#endregion
export { SplitComponent as component };
