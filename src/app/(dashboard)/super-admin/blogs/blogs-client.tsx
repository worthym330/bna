"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Link as LinkIcon, ExternalLink } from "lucide-react";
import { createBlogAction, deleteBlogAction } from "@/app/actions/blogs";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function BlogsClient({ initialBlogs }: { initialBlogs: any[] }) {
  const [blogs, setBlogs] = useState(initialBlogs);
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const router = useRouter();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await createBlogAction({ title, slug });
      if (res.success) {
        toast.success("Blog created!");
        router.push(`/super-admin/blogs/${res.blogId}/edit`);
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to create blog");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog?")) return;
    try {
      await deleteBlogAction(id);
      setBlogs(blogs.filter(b => b.id !== id));
      toast.success("Deleted successfully");
    } catch (e: any) {
      toast.error(e.message || "Failed to delete");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
        <h2 className="font-semibold text-slate-800">All Blogs</h2>
        <button
          onClick={() => setIsCreating(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New Blog
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreate} className="p-4 border-b border-slate-200 bg-blue-50/50 flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-slate-700 mb-1">Blog Title</label>
            <input 
              required
              type="text" 
              value={title} 
              onChange={e => {
                setTitle(e.target.value);
                if (!slug) {
                  setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
                }
              }}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600"
              placeholder="e.g. How to automate billing"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-slate-700 mb-1">URL Slug</label>
            <input 
              required
              type="text" 
              value={slug} 
              onChange={e => setSlug(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600"
              placeholder="how-to-automate-billing"
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
              Create & Edit
            </button>
            <button type="button" onClick={() => setIsCreating(false)} className="bg-slate-200 text-slate-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-slate-300">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="divide-y divide-slate-100">
        {blogs.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No blogs found.</div>
        ) : (
          blogs.map(blog => (
            <div key={blog.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div>
                <h3 className="font-medium text-slate-900">{blog.title}</h3>
                <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <LinkIcon className="w-3 h-3" /> /{blog.slug}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${blog.isPublished ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {blog.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {blog.isPublished && (
                  <Link href={`/blogs/${blog.slug}`} target="_blank" className="p-2 text-slate-400 hover:text-blue-600 transition-colors" title="View Public Blog">
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                )}
                <Link href={`/super-admin/blogs/${blog.id}/edit`} className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                  <Edit2 className="w-4 h-4" />
                </Link>
                <button onClick={() => handleDelete(blog.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
