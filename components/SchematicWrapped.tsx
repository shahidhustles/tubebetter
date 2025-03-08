"use client";

import { useUser } from "@clerk/nextjs";
import { useSchematicEvents } from "@schematichq/schematic-react";
import { useEffect } from "react";

const SchematicWrapped = ({ children }: { children: React.ReactNode }) => {
  const { identify } = useSchematicEvents();
  const { user } = useUser();

  useEffect(() => {
    const username =
      user?.username ??
      user?.fullName ??
      user?.emailAddresses[0]?.emailAddress ??
      user?.id;

    if (user?.id) {
      identify({
        //Company level key
        company: {
          keys: {
            id: user.id,
          },
          name: username,
        },
        
        //user level key
        keys: {
          id: user.id,
        },
        name: username,
      });
    }
  }, [user, identify]);
  return children;
};
export default SchematicWrapped;
