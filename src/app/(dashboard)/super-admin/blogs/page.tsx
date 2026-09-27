import { getTenantSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getBlogsAction } from "@/app/actions/blogs";
import { BlogsClient } from "./blogs-client";

export default async function BlogsPage() {
  const { user } = await getTenantSession();
  if (!user || !user.isSuperAdmin) {
    redirect("/dashboard");
  }

  const blogs = await getBlogsAction();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Manage Blogs</h1>
      <BlogsClient initialBlogs={blogs} />
    </div>
  );
}
