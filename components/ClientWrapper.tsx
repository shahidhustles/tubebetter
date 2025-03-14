"use client";

import { SchematicProvider } from "@schematichq/schematic-react";
import SchematicIdentifier from "./SchematicIdentifier";
import ConvexClientProvider from "./ConvexClientProvider";

export default function ClientWrapper({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const schematicPubKey = process.env.NEXT_PUBLIC_SCHEMATIC_PUBLISHABLE_KEY;

  if (!schematicPubKey) {
    throw new Error("No schematic publishable key found!!");
  }

  return (
    <ConvexClientProvider>
      <SchematicProvider publishableKey={schematicPubKey}>
        <SchematicIdentifier>{children}</SchematicIdentifier>
      </SchematicProvider>{" "}
    </ConvexClientProvider>
  );
}
