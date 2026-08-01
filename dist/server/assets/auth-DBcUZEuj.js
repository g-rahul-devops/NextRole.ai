import { t as supabase } from "./client-DCjuFEfc.js";
//#region src/lib/auth.ts
var STORAGE_KEY = "pipeline-match-auth";
var DEMO_EMAIL = "demo@pipelinematch.dev";
var DEMO_PASSWORD = "demo1234";
var ADMIN_USERNAME = "admin";
var ADMIN_PASSWORD = "admin";
function getStoredAuthUser() {
	if (typeof window === "undefined") return null;
	const raw = window.localStorage.getItem(STORAGE_KEY);
	if (!raw) return null;
	try {
		return JSON.parse(raw);
	} catch {
		window.localStorage.removeItem(STORAGE_KEY);
		return null;
	}
}
function setStoredAuthUser(user) {
	if (typeof window === "undefined") return;
	window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}
function clearStoredAuthUser() {
	if (typeof window === "undefined") return;
	window.localStorage.removeItem(STORAGE_KEY);
}
function isAdminCredential(email, password) {
	return email.trim().toLowerCase() === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}
async function getCurrentAuthUser() {
	const stored = getStoredAuthUser();
	if (stored) return stored;
	try {
		const { data, error } = await supabase.auth.getUser();
		if (!error && data.user) {
			const user = {
				id: data.user.id,
				email: data.user.email ?? "user@example.com",
				provider: "supabase"
			};
			setStoredAuthUser(user);
			return user;
		}
	} catch {}
	return null;
}
async function signInWithEmailPassword(email, password) {
	try {
		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password
		});
		if (!error && data.session) {
			const user = {
				id: data.user?.id ?? "supabase-user",
				email: data.user?.email ?? email,
				provider: "supabase"
			};
			setStoredAuthUser(user);
			return user;
		}
		if (email === DEMO_EMAIL && password === DEMO_PASSWORD || isAdminCredential(email, password)) {
			const user = {
				id: isAdminCredential(email, password) ? "admin-user" : "demo-user",
				email: isAdminCredential(email, password) ? ADMIN_USERNAME : email,
				provider: "demo"
			};
			setStoredAuthUser(user);
			return user;
		}
		throw error ?? /* @__PURE__ */ new Error("Unable to sign in with the supplied credentials.");
	} catch (error) {
		if (email === DEMO_EMAIL && password === DEMO_PASSWORD || isAdminCredential(email, password)) {
			const user = {
				id: isAdminCredential(email, password) ? "admin-user" : "demo-user",
				email: isAdminCredential(email, password) ? ADMIN_USERNAME : email,
				provider: "demo"
			};
			setStoredAuthUser(user);
			return user;
		}
		throw error instanceof Error ? error : /* @__PURE__ */ new Error("Unable to sign in.");
	}
}
async function signUpWithEmailPassword(email, password) {
	try {
		const { data, error } = await supabase.auth.signUp({
			email,
			password,
			options: { emailRedirectTo: typeof window !== "undefined" ? window.location.origin : void 0 }
		});
		if (!error && data.session) {
			const user = {
				id: data.user?.id ?? "supabase-user",
				email: data.user?.email ?? email,
				provider: "supabase"
			};
			setStoredAuthUser(user);
			return user;
		}
	} catch {}
	if (email === DEMO_EMAIL && password === DEMO_PASSWORD || isAdminCredential(email, password)) {
		const user = {
			id: isAdminCredential(email, password) ? "admin-user" : "demo-user",
			email: isAdminCredential(email, password) ? ADMIN_USERNAME : email,
			provider: "demo"
		};
		setStoredAuthUser(user);
		return user;
	}
	const user = {
		id: `local-${email}`,
		email,
		provider: "demo"
	};
	setStoredAuthUser(user);
	return user;
}
async function signOutAuth() {
	try {
		await supabase.auth.signOut();
	} catch {}
	clearStoredAuthUser();
}
//#endregion
export { signUpWithEmailPassword as i, signInWithEmailPassword as n, signOutAuth as r, getCurrentAuthUser as t };
