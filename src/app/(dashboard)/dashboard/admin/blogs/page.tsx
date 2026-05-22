import { AdminBlogBuilderForm } from "@/components/admin/admin-blog-builder-form";

export default function AdminBlogsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-lg font-semibold text-emerald-50">Blogs</h2>
        <p className="mt-1 text-sm text-white/65">
          Write, publish, and manage articles for the public blog section.
        </p>
      </header>
      <AdminBlogBuilderForm />
    </div>
  );
}
