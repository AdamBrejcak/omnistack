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
    const profileImages = new sst.aws.Bucket("ProfileImages", {
      public: true,
    });

    const api = new sst.aws.Function("Api", {
      handler: "apps/backend/src/index.handler",
      link: [profileImages],
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
        FIREBASE_API_KEY: process.env.FIREBASE_API_KEY!,
        FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN!,
        FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID!,
      },
    });

    return {
      apiUrl: api.url,
      webUrl: web.url,
    };
  },
});