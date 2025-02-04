import { type Express } from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUiExpress from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Fickle API",
      version: "1.0.0",
    },
    servers: [
      {
        url: "http://localhost:8080",
      },
    ],
    components: {
      securitySchemes: {
        sessionAuth: {
          type: "apiKey",
          in: "cookie",
          name: "connect.sid",
        },
      },
    },
  },
  apis: ["./src/routes/*.ts"],
};

const openApiSpecification = swaggerJsdoc(options);

export default function (app: Express) {
  app.use(
    "/fickle-docs",
    swaggerUiExpress.serve,
    swaggerUiExpress.setup(openApiSpecification)
  );
}
