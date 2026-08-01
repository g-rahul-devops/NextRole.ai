import "react";
import { jsx } from "react/jsx-runtime";
//#region src/components/ui/input.tsx
function Input({ className, ...props }) {
	return /* @__PURE__ */ jsx("input", {
		className: ["auth-input", className].filter(Boolean).join(" "),
		...props
	});
}
//#endregion
export { Input as t };
