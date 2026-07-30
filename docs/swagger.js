import path from "node:path";
import swaggerJsdoc from "swagger-jsdoc";

const options = {
    definition: {
        openapi: "3.0.3",
        info: {
            title: "Turnix API",
            version: "1.0.0",
            description: [
                "Smart Queue Management System REST API.",
                "",
                "Customers join queues without an account (guest token based tracking).",
                "Employees manage their daily queue from the workspace.",
                "Admins manage employees, system settings, and performance reports.",
                "",
                "**Response envelopes:** most modules return `{ success: true, message, data }`;",
                "profile, settings and reports return `{ status: \"success\", message, data }`.",
                "All errors return `{ status: \"error\", error: { code, message, details? } }`."
            ].join("\n"),
        },
        servers: [
            {
                url: "http://localhost:5000/api",
                description: "Local development",
            },
        ],
        tags: [
            { name: "Auth", description: "Authentication (public)" },
            { name: "Branches", description: "Public branch listing" },
            { name: "Services", description: "Public branch services listing" },
            { name: "Tickets", description: "Public customer queue: join & track (guest token)" },
            { name: "Workspace", description: "Employee daily queue management (Bearer)" },
            { name: "Employees", description: "Employee management (Bearer, ADMIN)" },
            { name: "Profile", description: "Authenticated user profile (Bearer)" },
            { name: "Settings", description: "System settings (Bearer, ADMIN)" },
            { name: "Reports", description: "Performance reports (Bearer, ADMIN)" },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                    description: "JWT obtained from POST /auth/login.",
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },

    apis: [
        path.resolve("docs/schemas/*.yaml"),
        path.resolve("docs/paths/*.yaml"),
    ],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
