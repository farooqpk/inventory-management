import { useEffect, useState } from "react";
import {
  redirect,
  type ActionFunction,
  type LoaderFunction,
} from "@remix-run/node";
import { useLoaderData, useSubmit, Form } from "@remix-run/react";
import {
  Page,
  TextField,
  Button,
  Text,
  BlockStack,
  FormLayout,
} from "@shopify/polaris";
import { prisma } from "~/db.server";

type LoaderData = {
  product: {
    id: string;
    title: string;
    quantity: number;
  };
  mode: "new" | "edit";
};

export const loader: LoaderFunction = async ({ params }) => {
  if (params.id === "new") {
    return Response.json({
      product: { id: "", title: "", quantity: 0 },
      mode: "new",
    });
  }
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    select: { id: true, title: true, quantity: true },
  });

  if (!product) {
    throw new Response("Product not found", { status: 404 });
  }

  return Response.json({ product, mode: "edit" });
};

export const action: ActionFunction = async ({ request, params }) => {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "delete") {
    await prisma.product.delete({
      where: { id: params.id },
    });
    return redirect("/");
  }

  const title = formData.get("title");
  const quantity = Number(formData.get("quantity"));

  await prisma.product.upsert({
    where: { id: params.id === "new" ? "" : params.id },
    create: {
      title: title as string,
      quantity,
    },
    update: {
      title: title as string,
      quantity,
    },
  });

  return redirect("/");
};

export default function ProductEdit() {
  const { product, mode } = useLoaderData<LoaderData>();
  const submit = useSubmit();

  const [isEditingTitle, setIsEditingTitle] = useState(mode === "new");
  const [title, setTitle] = useState(product.title);
  const [quantity, setQuantity] = useState(product.quantity);
  const [errors, setErrors] = useState({
    title: "",
    quantity: "",
  });

  useEffect(() => {
    setTitle(product.title);
    setQuantity(product.quantity);
  }, [product]);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (errors.title && value.trim()) {
      setErrors({ ...errors, title: "" });
    }
  };

  const handleQuantityChange = (value: string) => {
    const newQuantity = parseInt(value) || 0;
    setQuantity(newQuantity);
    if (errors.quantity && newQuantity >= 0) {
      setErrors({ ...errors, quantity: "" });
    }
  };

  const handleSave = () => {
    const newErrors = { title: "", quantity: "" };

    if (!title?.trim()) {
      newErrors.title = "Title is required";
    }

    if (quantity < 0) {
      newErrors.quantity = "Quantity cannot be negative";
    }

    setErrors(newErrors);

    if (newErrors.title || newErrors.quantity) {
      return;
    }

    submit(
      { title, quantity: quantity.toString(), intent: "update" },
      { method: "post" }
    );
  };

  const handleReset = () => {
    setTitle(product.title);
    setQuantity(product.quantity);
    setErrors({ title: "", quantity: "" });
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      submit({ intent: "delete" }, { method: "post" });
    }
  };

  const handleDoubleClick = () => {
    setIsEditingTitle(true);
  };

  const handleTitleBlur = () => {
    if (mode === "edit") setIsEditingTitle(false);
  };

  return (
    <Page
      title={mode === "new" ? "Add New Product" : "Edit Product"}
      backAction={{ content: "Products", url: "/" }}
    >
      <Form method="post">
        <FormLayout>
          <BlockStack gap={"500"}>
            {isEditingTitle ? (
              <TextField
                label="Title"
                value={title}
                onChange={handleTitleChange}
                autoComplete="off"
                onBlur={handleTitleBlur}
                autoFocus
              />
            ) : (
              <div onDoubleClick={handleDoubleClick}>
                <Text as="p" variant="bodyLg">
                  Title: {title}
                </Text>
              </div>
            )}
            {errors.title.length > 0 && (
              <Text tone="critical" as="p">
                {errors.title}
              </Text>
            )}

            <TextField
              label="Quantity"
              type="number"
              value={quantity.toString()}
              onChange={handleQuantityChange}
              autoComplete="off"
              min={0}
            />
            {errors.quantity.length > 0 && (
              <Text tone="critical" as="p">
                {errors.quantity}
              </Text>
            )}

            <div style={{ display: "flex", gap: "3px" }}>
              {mode === "edit" && (
                <Button onClick={handleDelete} tone="critical">
                  Delete
                </Button>
              )}
              <div style={{ display: "flex", gap: "3px", marginLeft: "auto" }}>
                <Button onClick={handleReset}>Reset</Button>
                <Button onClick={handleSave}>Save</Button>
              </div>
            </div>
          </BlockStack>
        </FormLayout>
      </Form>
    </Page>
  );
}
