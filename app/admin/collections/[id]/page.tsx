import CollectionForm from "@/components/admin/CollectionForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCollectionPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Collection</h1>
      <CollectionForm id={id} />
    </div>
  );
}
