import { t as createServerFn } from "../server.js";
import { t as requireSupabaseAuth } from "./auth-middleware-BxjOzQ2s.js";
import { d as createSsrRpc } from "./skeleton-CdrIB4qs.js";
import * as React from "react";
import { useEffect, useState } from "react";
import { isRedirect, useRouter } from "@tanstack/react-router";
import { z } from "zod";
//#region node_modules/@tanstack/react-start/dist/esm/useServerFn.js
function useServerFn(serverFn) {
	const router = useRouter();
	return React.useCallback(async (...args) => {
		try {
			const res = await serverFn(...args);
			if (isRedirect(res)) throw res;
			return res;
		} catch (err) {
			if (isRedirect(err)) {
				err.options._fromLocation = router.stores.location.get();
				return router.navigate(router.resolveRedirect(err).options);
			}
			throw err;
		}
	}, [router, serverFn]);
}
//#endregion
//#region src/lib/resume.functions.ts
var UploadInput = z.object({
	fileName: z.string().min(1).max(200),
	mimeType: z.string().max(120),
	base64: z.string().min(10)
});
var uploadResume = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => UploadInput.parse(input)).handler(createSsrRpc("107b1c81c8664a01d9ab046533f665238584805e69057fbd7a0567e2e69cb528"));
var listResumes = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("b288288ab2fbfc0ca7181e1a97e7dfa0595009975ab09c38712ba7388546face"));
var deleteResume = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input)).handler(createSsrRpc("b770062f53397f87339e19e0ecab926a5a29badd155b20f722f317084c9c2140"));
//#endregion
//#region src/hooks/use-active-resume.ts
var KEY = "pm.activeResumeId";
function useActiveResume(resumes) {
	const [resumeId, setResumeId] = useState(null);
	useEffect(() => {
		if (!resumes?.length) {
			setResumeId(null);
			return;
		}
		const stored = typeof window !== "undefined" ? window.localStorage.getItem(KEY) : null;
		const valid = stored && resumes.some((r) => r.id === stored) ? stored : resumes[0]?.id ?? null;
		setResumeId(valid);
	}, [resumes]);
	function select(id) {
		window.localStorage.setItem(KEY, id);
		setResumeId(id);
	}
	return {
		resumeId,
		select
	};
}
//#endregion
export { useServerFn as a, uploadResume as i, deleteResume as n, listResumes as r, useActiveResume as t };
