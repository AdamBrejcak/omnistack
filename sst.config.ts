/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "omnistack",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
    };
  },

  async run() {
    const api = new sst.aws.Function("Api", {
      handler: "apps/backend/src/index.handler",
      environment: {
        DATABASE_URL: process.env.DATABASE_URL!,
        FIREBASE_SERVICE_ACCOUNT: process.env.FIREBASE_SERVICE_ACCOUNT!,
      },
      url: true,
    });

    const web = new sst.aws.Nuxt("Web", {
      path: "apps/frontend",
      environment: {
        PUBLIC_API_URL: api.url,
        PUBLIC_FIREBASE_API_KEY: process.env.PUBLIC_FIREBASE_API_KEY!,
        PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.PUBLIC_FIREBASE_AUTH_DOMAIN!,
        PUBLIC_FIREBASE_PROJECT_ID: process.env.PUBLIC_FIREBASE_PROJECT_ID!,
      },
    });

    return {
      apiUrl: api.url,
      webUrl: web.url,
    };
  },
});