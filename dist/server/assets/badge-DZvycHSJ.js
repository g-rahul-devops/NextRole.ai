import "react";
import { jsx } from "react/jsx-runtime";
//#region src/components/ui/badge.tsx
function Badge({ children, variant = "default", className, ...props }) {
	const tone = variant === "outline" ? {
		background: "transparent",
		border: "1px solid rgba(148, 163, 184, 0.25)",
		color: "#e2e8f0"
	} : variant === "secondary" ? {
		background: "rgba(56, 189, 248, 0.14)",
		color: "#bae6fd"
	} : {
		background: "rgba(129, 140, 248, 0.18)",
		color: "#e2e8f0"
	};
	return /* @__PURE__ */ jsx("span", {
		...props,
		className,
		style: {
			display: "inline-flex",
			alignItems: "center",
			borderRadius: 999,
			padding: "0.2rem 0.55rem",
			...tone,
			fontSize: "0.8rem"
		},
		children
	});
}
//#endregion
export { Badge as t };
