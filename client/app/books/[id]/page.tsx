import { BookDetails } from "@/components/reading-pages";
export const metadata = { title: "Book Details" };
export default async function DetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BookDetails id={id} />;
}
