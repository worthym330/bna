import prisma from "@/lib/prisma";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description: "Read the latest news, updates, and articles from Invoq.",
};

export default async function BlogsIndexPage() {
  const blogs = await prisma.blog.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="bg-slate-50 py-24 sm:py-32 min-h-screen">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center mb-16">
          <h2 className="text-base font-semibold leading-7 text-blue-600 flex justify-center items-center gap-2">
            <BookOpen className="w-5 h-5" /> Our Blog
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Latest Updates & Articles
          </p>
          <p className="mt-6 text-lg leading-8 text-slate-600">
            Learn more about the future of billing operations, product updates, and how to scale your agency.
          </p>
        </div>

        {blogs.length === 0 ? (
          <div className="text-center text-slate-500 py-12">
            No published blogs found. Check back later!
          </div>
        ) : (
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {blogs.map((blog) => (
              <article key={blog.id} className="flex flex-col items-start justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-x-4 text-xs">
                  <time dateTime={blog.createdAt.toISOString()} className="text-slate-500">
                    {new Date(blog.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </time>
                  <span className="relative z-10 rounded-full bg-blue-50 px-3 py-1.5 font-medium text-blue-600 hover:bg-blue-100">
                    Article
                  </span>
                </div>
                <div className="group relative">
                  <h3 className="mt-3 text-lg font-semibold leading-6 text-slate-900 group-hover:text-blue-600">
                    <Link href={`/blogs/${blog.slug}`}>
                      <span className="absolute inset-0" />
                      {blog.title}
                    </Link>
                  </h3>
                  <p className="mt-5 line-clamp-3 text-sm leading-6 text-slate-600">
                    {/* Extract a short snippet by stripping HTML tags from the content */}
                    {blog.htmlContent.replace(/<[^>]+>/g, '').substring(0, 150)}...
                  </p>
                </div>
                <div className="relative mt-8 flex items-center gap-x-4">
                  <Link href={`/blogs/${blog.slug}`} className="text-sm font-semibold leading-6 text-blue-600 flex items-center gap-1 hover:text-blue-500">
                    Read more <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
