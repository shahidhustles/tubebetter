if (!process.env.CLERK_ISSUE_URL) {
  throw new Error("CLERK_ISSUE_URL not setup");
}

const authConfig = {
  providers: [
    {
      domain: process.env.CLERK_ISSUE_URL,
      applicationID: "convex",
    },
  ],
};

export default authConfig;
