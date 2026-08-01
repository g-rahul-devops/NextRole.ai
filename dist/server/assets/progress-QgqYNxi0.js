import "react";
import { jsx } from "react/jsx-runtime";
//#region src/components/ui/progress.tsx
function Progress({ value = 0, ...props }) {
	return /* @__PURE__ */ jsx("div", {
		...props,
		style: {
			width: "100%",
			background: "#334155",
			borderRadius: 999,
			overflow: "hidden"
		},
		children: /* @__PURE__ */ jsx("div", { style: {
			width: `${Math.max(0, Math.min(100, value))}%`,
			height: 8,
			background: "#38bdf8"
		} })
	});
}
//#endregion
export { Progress as t };
