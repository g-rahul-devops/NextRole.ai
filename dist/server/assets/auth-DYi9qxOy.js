import { t as Button } from "./button-79MBYDnH.js";
import { t as Input } from "./input-DBivzZwy.js";
import { i as signUpWithEmailPassword, n as signInWithEmailPassword, t as getCurrentAuthUser } from "./auth-DBcUZEuj.js";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { toast } from "sonner";
import { Terminal } from "lucide-react";
//#region src/components/ui/label.tsx
function Label({ children, className, ...props }) {
	return /* @__PURE__ */ jsx("label", {
		className: ["auth-label", className].filter(Boolean).join(" "),
		...props,
		children
	});
}
//#endregion
//#region src/routes/auth.tsx?tsr-split=component
function AuthPage() {
	const navigate = useNavigate();
	const [mode, setMode] = useState("signin");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	useEffect(() => {
		getCurrentAuthUser().then((user) => {
			if (user) navigate({
				to: "/dashboard",
				replace: true
			});
		});
	}, [navigate]);
	async function submit(e) {
		e.preventDefault();
		setLoading(true);
		try {
			if (mode === "signup") {
				await signUpWithEmailPassword(email, password);
				toast.success("Account ready. You can continue to the dashboard.");
			} else await signInWithEmailPassword(email, password);
			navigate({
				to: "/dashboard",
				replace: true
			});
		} catch (error) {
			toast.error(error.message);
		} finally {
			setLoading(false);
		}
	}
	return /* @__PURE__ */ jsx("div", {
		className: "landing-shell auth-page",
		children: /* @__PURE__ */ jsxs("div", {
			className: "auth-panel",
			children: [/* @__PURE__ */ jsxs(Link, {
				to: "/",
				className: "auth-brand",
				children: [/* @__PURE__ */ jsx("div", {
					className: "landing-brand-icon",
					children: /* @__PURE__ */ jsx(Terminal, { size: 18 })
				}), /* @__PURE__ */ jsx("span", { children: "PipelineMatch" })]
			}), /* @__PURE__ */ jsxs("div", {
				className: "auth-card",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "auth-card-header",
						children: [
							/* @__PURE__ */ jsx("p", {
								className: "hero-badge",
								children: "secure access"
							}),
							/* @__PURE__ */ jsx("h1", { children: mode === "signin" ? "Welcome back" : "Create your account" }),
							/* @__PURE__ */ jsx("p", { children: mode === "signin" ? "Sign in to review matches, saved roles and your application flow." : "Start scoring DevOps roles against your resume in a few seconds." })
						]
					}),
					/* @__PURE__ */ jsxs("form", {
						onSubmit: submit,
						className: "auth-form",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "auth-field",
								children: [/* @__PURE__ */ jsx(Label, {
									htmlFor: "email",
									children: "Username or email"
								}), /* @__PURE__ */ jsx(Input, {
									id: "email",
									type: "text",
									required: true,
									value: email,
									onChange: (e) => setEmail(e.target.value),
									placeholder: "admin or you@example.com",
									autoComplete: "username"
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "auth-field",
								children: [/* @__PURE__ */ jsx(Label, {
									htmlFor: "password",
									children: "Password"
								}), /* @__PURE__ */ jsx(Input, {
									id: "password",
									type: "password",
									required: true,
									minLength: 4,
									value: password,
									onChange: (e) => setPassword(e.target.value),
									placeholder: "admin",
									autoComplete: "current-password"
								})]
							}),
							/* @__PURE__ */ jsx("p", {
								className: "auth-hint",
								children: "Demo login: admin / admin"
							}),
							/* @__PURE__ */ jsx(Button, {
								type: "submit",
								className: "w-full",
								disabled: loading,
								children: loading ? "Working…" : mode === "signin" ? "Sign in" : "Sign up"
							})
						]
					}),
					/* @__PURE__ */ jsx("button", {
						type: "button",
						className: "auth-toggle",
						onClick: () => setMode(mode === "signin" ? "signup" : "signin"),
						children: mode === "signin" ? "No account? Sign up" : "Already have an account? Sign in"
					})
				]
			})]
		})
	});
}
//#endregion
export { AuthPage as component };
