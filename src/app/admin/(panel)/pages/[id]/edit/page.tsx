import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { PostEditor } from "@/components/admin/PostEditor";
import type { BlogPost } from "@/lib/types";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();
  if (!supabase) notFound();

  const { data } = await supabase.from("blog_posts").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();

  return <PostEditor post={data as BlogPost} />;
}
