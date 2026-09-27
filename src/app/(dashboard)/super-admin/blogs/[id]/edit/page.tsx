import { getTenantSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getBlogAction } from "@/app/actions/blogs";
import { BlogEditorClient } from "./blog-editor-client";

export default async function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const { user } = await getTenantSession();
  if (!user || !user.isSuperAdmin) {
    redirect("/dashboard");
  }

  const { id } = await params;
  const blog = await getBlogAction(id);
  if (!blog) {
    redirect("/super-admin/blogs");
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 h-full flex flex-col">
      <h1 className="text-2xl font-bold text-slate-900">Edit Blog: {blog.title}</h1>
      <BlogEditorClient initialBlog={blog} />
    </div>
  );
}
