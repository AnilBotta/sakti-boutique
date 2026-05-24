import { notFound } from 'next/navigation';
import { AdminScaffoldPage } from '@/components/admin/AdminScaffoldPage';
import { getContentPageForEdit } from '@/lib/repositories/content';
import { ContentEditor } from '../ContentEditor';

interface PageProps {
  params: { slug: string };
}

export const dynamic = 'force-dynamic';

export default async function EditContentPage({ params }: PageProps) {
  const page = await getContentPageForEdit(params.slug);
  if (!page) notFound();

  return (
    <AdminScaffoldPage
      eyebrow="Content"
      title={`Edit · ${page.title}`}
      description={`Editing /journal/${page.slug}`}
    >
      <ContentEditor
        mode="edit"
        initial={{
          id: page.id,
          slug: page.slug,
          title: page.title,
          status: page.status,
          body: page.body,
          metaTitle: page.metaTitle,
          metaDescription: page.metaDescription,
        }}
      />
    </AdminScaffoldPage>
  );
}
