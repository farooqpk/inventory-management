import { type LoaderFunction } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { Page, Layout, DataTable, Button } from "@shopify/polaris";
import { prisma } from "~/db.server";

interface Product {
  id: string;
  title: string;
  quantity: number;
}

interface LoaderData {
  products: Product[];
}

export const loader: LoaderFunction = async () => {
  const products = await prisma.product.findMany({
    select: { id: true, title: true, quantity: true },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ products });
};

export default function Index() {
  const { products } = useLoaderData<LoaderData>();

  const row = products?.map((product) => {
    return [
      product.title,
      product.quantity,
      <Link to={`/products/${product.id}`}>
        <Button>Edit</Button>
      </Link>,
    ];
  });

  return (
    <Page
      title="Inventory"
      primaryAction={
        <Link to="/products/new">
          <Button>Create</Button>
        </Link>
      }
    >
      <Layout>
        <Layout.Section>
          <DataTable
            columnContentTypes={["text", "numeric", "text"]}
            headings={["Name", "Quantity", "Action"]}
            rows={row}
          />
        </Layout.Section>
      </Layout>
    </Page>
  );
}
