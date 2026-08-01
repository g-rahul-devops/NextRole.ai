import { useEffect, useState } from "react";

const KEY = "pm.activeResumeId";

export function useActiveResume(resumes: Array<{ id: string }> | undefined) {
  const [resumeId, setResumeId] = useState<string | null>(null);

  useEffect(() => {
    if (!resumes?.length) {
      setResumeId(null);
      return;
    }
    const stored = typeof window !== "undefined" ? window.localStorage.getItem(KEY) : null;
    const valid = stored && resumes.some((r) => r.id === stored) ? stored : (resumes[0]?.id ?? null);
    setResumeId(valid);
  }, [resumes]);

  function select(id: string) {
    window.localStorage.setItem(KEY, id);
    setResumeId(id);
  }

  return { resumeId, select };
}
