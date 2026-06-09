-- Private bucket for generated PDFs (reports + certificates)
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

-- Only the owning user (or admin) may read their objects.
-- Object paths are namespaced as: {user_id}/{submission_id}/{file}
create policy "read own documents" on storage.objects
  for select using (
    bucket_id = 'documents'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_admin()
    )
  );
