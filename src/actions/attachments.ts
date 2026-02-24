'use server';

import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Service-role client — bypasses RLS so the upload always succeeds
// regardless of the bucket's per-user policies.
// This module is server-only; the key is never sent to the browser.
function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function uploadTaskAttachment(
  formData: FormData
): Promise<{ path?: string; error?: string }> {
  const file = formData.get('file') as File | null;
  if (!file) return { error: 'No file provided' };

  const supabase = getServiceClient();
  const ext = file.name.split('.').pop();
  const path = `uploads/${uuidv4()}.${ext}`;

  const { error } = await supabase.storage
    .from('task-attachments')
    .upload(path, file, { upsert: false, contentType: file.type });

  if (error) return { error: error.message };
  return { path };
}

export async function deleteTaskAttachments(
  paths: string[]
): Promise<{ error?: string }> {
  if (!paths.length) return {};
  const supabase = getServiceClient();
  const { error } = await supabase.storage.from('task-attachments').remove(paths);
  return error ? { error: error.message } : {};
}
