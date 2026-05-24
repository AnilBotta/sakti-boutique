import { AdminScaffoldPage } from '@/components/admin/AdminScaffoldPage';
import { ContentEditor } from '../ContentEditor';

export default function NewContentPage() {
  return (
    <AdminScaffoldPage
      eyebrow="Content"
      title="New page"
      description="Create an editorial page. Publishing will make it live at /journal/{slug}."
    >
      <ContentEditor
        mode="create"
        initial={{
          slug: '',
          title: '',
          status: 'draft',
          body: [],
          metaTitle: null,
          metaDescription: null,
        }}
      />
    </AdminScaffoldPage>
  );
}
