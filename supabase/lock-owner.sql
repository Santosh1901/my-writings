-- Lock writes to pvsantosh2019@gmail.com only.
-- Run in Supabase → SQL Editor if the site cannot apply this itself.

drop policy if exists "Signed-in author can insert writings" on public.writings;
drop policy if exists "Author can update own writings" on public.writings;
drop policy if exists "Author can delete own writings" on public.writings;
drop policy if exists "Only owner can insert writings" on public.writings;
drop policy if exists "Only owner can update writings" on public.writings;
drop policy if exists "Only owner can delete writings" on public.writings;

create policy "Only owner can insert writings"
  on public.writings for insert
  with check (auth.uid() = 'b72f5225-7dd0-4b46-878f-e3115ee010db'::uuid);

create policy "Only owner can update writings"
  on public.writings for update
  using (auth.uid() = 'b72f5225-7dd0-4b46-878f-e3115ee010db'::uuid)
  with check (auth.uid() = 'b72f5225-7dd0-4b46-878f-e3115ee010db'::uuid);

create policy "Only owner can delete writings"
  on public.writings for delete
  using (auth.uid() = 'b72f5225-7dd0-4b46-878f-e3115ee010db'::uuid);
