import * as React from "react";
import { jsx } from "react/jsx-runtime";
//#region src/components/ui/button.tsx
function Button({ children, asChild = false, variant = "default", size, className, style, ...props }) {
	const sharedProps = {
		className: [
			"button",
			`button-${variant}`,
			size ? `button-${size}` : "",
			className
		].filter(Boolean).join(" "),
		style
	};
	if (asChild && React.isValidElement(children)) return React.cloneElement(children, sharedProps);
	return /* @__PURE__ */ jsx("button", {
		...props,
		...sharedProps,
		children
	});
}
//#endregion
export { Button as t };
