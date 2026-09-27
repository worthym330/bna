"use server";

import prisma from "@/lib/prisma";
import { getTenantSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createBlogAction(data: { title: string, slug: string }) {
  const { user } = await getTenantSession();
  if (!user || !user.isSuperAdmin) throw new Error("Unauthorized");

  const existing = await prisma.blog.findUnique({ where: { slug: data.slug } });
  if (existing) throw new Error("Slug already exists");

  const blog = await prisma.blog.create({
    data: {
      title: data.title,
      slug: data.slug,
      htmlContent: "<h1>" + data.title + "</h1><p>Start writing here...</p>",
      designConfig: {},
      isPublished: false,
    }
  });

  revalidatePath("/super-admin/blogs");
  return { success: true, blogId: blog.id };
}

export async function getBlogsAction() {
  const { user } = await getTenantSession();
  if (!user || !user.isSuperAdmin) throw new Error("Unauthorized");

  return await prisma.blog.findMany({
    orderBy: { createdAt: "desc" }
  });
}

export async function getBlogAction(id: string) {
  const { user } = await getTenantSession();
  if (!user || !user.isSuperAdmin) throw new Error("Unauthorized");

  return await prisma.blog.findUnique({ where: { id } });
}

export async function updateBlogAction(id: string, data: {
  title?: string;
  slug?: string;
  htmlContent?: string;
  designConfig?: any;
  isPublished?: boolean;
}) {
  const { user } = await getTenantSession();
  if (!user || !user.isSuperAdmin) throw new Error("Unauthorized");

  await prisma.blog.update({
    where: { id },
    data
  });

  if (data.slug) {
    revalidatePath(`/blogs/${data.slug}`);
  }
  revalidatePath("/super-admin/blogs");
  return { success: true };
}

export async function deleteBlogAction(id: string) {
  const { user } = await getTenantSession();
  if (!user || !user.isSuperAdmin) throw new Error("Unauthorized");

  await prisma.blog.delete({ where: { id } });
  revalidatePath("/super-admin/blogs");
  return { success: true };
}
