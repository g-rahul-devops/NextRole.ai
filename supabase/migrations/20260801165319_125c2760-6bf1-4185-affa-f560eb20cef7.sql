CREATE EXTENSION IF NOT EXISTS vector;

CREATE TYPE public.visa_status AS ENUM ('yes','no','unclear');
CREATE TYPE public.remote_kind AS ENUM ('remote','hybrid','onsite','unknown');
CREATE TYPE public.application_status AS ENUM ('applied','interview','rejected','offer');

CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

-- profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile select" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name',''))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- resumes
CREATE TABLE public.resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL DEFAULT 'resume.txt',
  raw_text TEXT NOT NULL,
  parsed JSONB NOT NULL DEFAULT '{}'::jsonb,
  embedding vector(3072),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.resumes TO authenticated;
GRANT ALL ON public.resumes TO service_role;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own resumes" ON public.resumes FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX resumes_user_idx ON public.resumes(user_id, created_at DESC);
CREATE TRIGGER resumes_updated BEFORE UPDATE ON public.resumes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- jobs
CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,
  source_job_id TEXT NOT NULL,
  title TEXT NOT NULL,
  company TEXT NOT NULL DEFAULT 'Unknown',
  description TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  country TEXT,
  region TEXT NOT NULL DEFAULT 'other',
  remote_type public.remote_kind NOT NULL DEFAULT 'unknown',
  salary_min NUMERIC,
  salary_max NUMERIC,
  salary_currency TEXT,
  skills TEXT[] NOT NULL DEFAULT '{}',
  visa_sponsorship public.visa_status NOT NULL DEFAULT 'unclear',
  apply_url TEXT NOT NULL,
  posted_date TIMESTAMPTZ,
  dedupe_key TEXT NOT NULL,
  embedding vector(3072),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (source, source_job_id)
);
CREATE UNIQUE INDEX jobs_dedupe_key_idx ON public.jobs(dedupe_key);
CREATE INDEX jobs_posted_idx ON public.jobs(posted_date DESC NULLS LAST);
CREATE INDEX jobs_embedding_idx ON public.jobs USING hnsw ((embedding::halfvec(3072)) halfvec_cosine_ops);
GRANT SELECT ON public.jobs TO authenticated;
GRANT ALL ON public.jobs TO service_role;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "jobs readable" ON public.jobs FOR SELECT TO authenticated USING (true);

-- matches
CREATE TABLE public.job_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  score NUMERIC NOT NULL DEFAULT 0,
  breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
  explanation TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (resume_id, job_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.job_matches TO authenticated;
GRANT ALL ON public.job_matches TO service_role;
ALTER TABLE public.job_matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own matches" ON public.job_matches FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX job_matches_user_idx ON public.job_matches(user_id, score DESC);

-- saved jobs
CREATE TABLE public.saved_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, job_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_jobs TO authenticated;
GRANT ALL ON public.saved_jobs TO service_role;
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own saved jobs" ON public.saved_jobs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- applications
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  status public.application_status NOT NULL DEFAULT 'applied',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, job_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.applications TO authenticated;
GRANT ALL ON public.applications TO service_role;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own applications" ON public.applications FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER applications_updated BEFORE UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- cover letters
CREATE TABLE public.cover_letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, job_id, resume_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cover_letters TO authenticated;
GRANT ALL ON public.cover_letters TO service_role;
ALTER TABLE public.cover_letters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own cover letters" ON public.cover_letters FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ai cache (backend only)
CREATE TABLE public.ai_cache (
  cache_key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.ai_cache TO service_role;
ALTER TABLE public.ai_cache ENABLE ROW LEVEL SECURITY;

-- ai usage (backend only)
CREATE TABLE public.ai_usage (
  user_id UUID NOT NULL,
  day DATE NOT NULL DEFAULT CURRENT_DATE,
  kind TEXT NOT NULL,
  count INT NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, day, kind)
);
GRANT SELECT ON public.ai_usage TO authenticated;
GRANT ALL ON public.ai_usage TO service_role;
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own usage" ON public.ai_usage FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- similarity search
CREATE OR REPLACE FUNCTION public.match_jobs(
  query_embedding vector(3072),
  match_count int DEFAULT 50
)
RETURNS TABLE (job_id uuid, similarity float)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT j.id, 1 - (j.embedding::halfvec(3072) <=> query_embedding::halfvec(3072))
  FROM public.jobs j
  WHERE j.embedding IS NOT NULL
  ORDER BY j.embedding::halfvec(3072) <=> query_embedding::halfvec(3072)
  LIMIT match_count;
$$;
GRANT EXECUTE ON FUNCTION public.match_jobs(vector, int) TO authenticated, service_role;