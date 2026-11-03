# Project Commands

1. To create a project

```bash
npx create-next-app@latest fixflow
```

### Setup Choices

- TypeScript: Yes
- ESLint: Yes
- React Compiler: No
- Tailwind CSS: Yes
- src/ directory: Yes
- App Router: Yes
- Customize import alias: Yes
- Import alias: @/\*

2. To run the project

```bash
npm run dev
```

3. To install deoendencies

```bash
npm install @prisma/client zod bcryptjs bullmq ioredis resend razorpay lucide-react
```

4. To install dev dependencies [ Used only for development code not in production like for testing during development ]

```bash
npm install -D prisma vitest @playwright/test tsx
```

or

```
npm install -D @types/node@^24
```

```
npm install -D prisma@7.10.1
```

```
npm install @prisma/client@7.10.1
```

```
npm install -D vitest@^4 @playwright/test tsx
```

5. Initialize Prisma and Git

```bash
npx prisma init
```

```bash
git init
```

6. Create docker-compose.yml file for creating a container for postgresql with volumes as persistent data and replace database_url with the provided url

- fixlow/docker-compose.yml

```yml
services:
  postgres:
    image: postgres:17-alpine
    container_name: fixflow-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: fixflow
      POSTGRES_PASSWORD: fixflow_dev_password
      POSTGRES_DB: fixflow
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U fixflow -d fixflow"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

```bash
DATABASE_URL="postgresql://fixflow:fixflow_dev_password@localhost:5432/fixflow?schema=public"
```

- This is only development purpose, not for productipn purpose.

- To run the container in detach mode only for postgres, to run this cmd you should first open docker desktop app

```yml
docker compose up -d postgres
```

- To check the container is running or not and its status as healthy if running

```yml
docker compose ps
```

- To check the docker logs

```yml
docker compose logs postgres
```

7. Prisma Client uses driver adapters for direct database connections.

```bash
npm install @prisma/adapter-pg pg
```

```bash
npm install -D @types/pg
```

Their responsibilities:

- @prisma/adapter-pg: Connects Prisma to PostgreSQL through the Node.js driver.
- pg: The PostgreSQL Node.js driver.
- @types/pg: TypeScript definitions.

#### Check is docker running or not

```yml
docker compose ps
```

#### Validate prisma schema

```bash
npx prisma validate
```

#### Generate Prisma client

- Genrates Generated Prisma Client (7.10.1) to .\src\generated\prisma (We'll use this generated client when creating our database connection)

```bash
npx prisma generate
```

8. We creating the first FixFlow database models

- #### User

##### Stores login credentials and basic user information.

- #### Community

##### Represents an apartment community or residential society.

- #### Membership

##### Connects users to communities and defines their roles.

- #### Apartment

##### Represents individual flats within a community.

### Models

##### user accounts, communities, memberships, apartments, and apartment residents.

9. Now lets Add the model to our prisma/schema.prisma

```yml

generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"}

datasource db {
  provider = "postgresql"}

enum MembershipRole {
  ADMIN
  RESIDENT
  STAFF}

enum ApartmentResidentRole {
  OWNER
  TENANT
  FAMILY_MEMBER}

model User {
  id           String  @id @default(cuid())
  name         String
  email        String  @unique
  passwordHash String
  phone        String?
  isActive     Boolean @default(true)

  memberships Membership[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt}

model Community {
  id          String  @id @default(cuid())
  name        String
  slug        String  @unique
  description String?

  memberships Membership[]
  apartments  Apartment[]

  apartmentResidents ApartmentResident[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt}

model Membership {
  id       String         @id @default(cuid())
  role     MembershipRole @default(RESIDENT)
  isActive Boolean        @default(true)

  userId      String
  communityId String

  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  community Community @relation(fields: [communityId], references: [id], onDelete: Cascade)

  apartmentResidents ApartmentResident[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([userId, communityId])
  @@unique([userId, communityId, id])
  @@index([communityId, role])}

model Apartment {
  id         String  @id @default(cuid())
  unitNumber String
  floor      Int?
  block      String?

  communityId String
  community   Community @relation(fields: [communityId], references: [id], onDelete: Cascade)

  residents ApartmentResident[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([communityId, unitNumber])
  @@unique([communityId, id])}

model ApartmentResident {
  id        String                @id @default(cuid())
  role      ApartmentResidentRole
  isPrimary Boolean               @default(false)
  isActive  Boolean               @default(true)

  apartmentId String
  userId      String
  communityId String

  apartment Apartment @relation(fields: [communityId, apartmentId], references: [communityId, id], onDelete: Cascade)

  membership Membership @relation(fields: [userId, communityId], references: [userId, communityId], onDelete: Cascade)

  community Community @relation(fields: [communityId], references: [id], onDelete: Cascade)

  moveInDate  DateTime  @default(now())
  moveOutDate DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([apartmentId, userId])
  @@index([communityId, userId])
  @@index([userId, isActive])}

```

i. After writing schema these steps needed to be done to access to use postgresql, as we are using cmds to get or put or delete instead of writing query. So first we have to validate

```yml
npx prisma validate
```

ii. Now after validating we have to generate i.e npx prisma generate, which will generate the typescript tools like getUserId() or find() like these or by using migrate dev internally it calls generate cmd. Migration will convert all your schema to actual query like create table ... etc.

```yml
npx prisma generate
```

```yml
npx prisma migrate dev --name init_user_community_apartment
```

10. Now after migrating successfully, we can connect our nextjs application to our prisma database.

#### Create a folder and file like src/lib.prisma.ts

```ts
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

- To test this database and our application connection we create a test file

* src/lib/db-test.ts

```ts
import "dotenv/config";
import { prisma } from "@/lib/prisma";

async function main() {
  await prisma.$connect();

  const result = await prisma.$queryRaw`
    SELECT current_database() AS database,
           NOW() AS server_time
  `;

  console.log("Database connected successfully!");
  console.log(result);
}

main()
  .catch((error) => {
    console.error("Database connection failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

- To run this

```bash
npx tsx src/lib/db-test.ts
```

11. Now lets create our auth for registration functions.

#### First for our password we build some functions to hash and compare

##### src/lib/password.ts

```ts
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  passwordHash: string,
): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}
```

#### To validate our registration data that comes from client we create validation using zod

##### src/modules/auth/auth.validation.ts

```ts
import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters"),

  email: z
    .string()
    .trim()
    .email("Please enter a valid email address")
    .max(255, "Email must not exceed 255 characters"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(72, "Password must not exceed 72 characters"),

  phone: z
    .string()
    .trim()
    .min(7, "Phone number is too short")
    .max(20, "Phone number is too long")
    .optional()
    .or(z.literal("")),
});

export type RegisterInput = z.infer<typeof registerSchema>;
```

#### Now its time to create the registration service for a user

##### src/modules/auth/auth.service.ts

```ts
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import type { RegisterInput } from "./auth.validation";

export async function registerUser(input: RegisterInput) {
  const email = input.email.toLowerCase();

  try {
    const passwordHash = await hashPassword(input.password);

    const user = await prisma.user.create({
      data: {
        name: input.name,
        email,
        passwordHash,
        phone: input.phone || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    return user;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new Error("EMAIL_ALREADY_EXISTS");
    }

    throw error;
  }
}
```

#### Now its time to combine all our service, validations and functions to create our first registration api

##### src/app/api/v1/auth/register/route.ts

```ts
import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { registerSchema } from "@/modules/auth/auth.validation";
import { registerUser } from "@/modules/auth/auth.service";

export async function POST(request: Request) {
  try {
    // 1. Read incoming JSON.
    const body = await request.json();

    // 2. Validate the request.
    const validatedData = registerSchema.parse(body);

    // 3. Register the user.
    const user = await registerUser(validatedData);

    // 4. Return the safe user response.
    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully",
        data: user,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: error.issues,
        },
        { status: 400 },
      );
    }

    if (error instanceof Error && error.message === "EMAIL_ALREADY_EXISTS") {
      return NextResponse.json(
        {
          success: false,
          message: "An account with this email already exists",
        },
        { status: 409 },
      );
    }

    console.error("Registration error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong. Please try again later.",
      },
      { status: 500 },
    );
  }
}
```

#### We can start testing the api

##### http://localhost:3000/api/v1/auth/register POST

```yml
{
  "name": "Test Resident",
  "email": "residents@example.com",
  "password": "FixFlow@123",
}
```

12. ### Login and authentication with Auth.js

#### build and test credential verification, then introduce sessions and protected routes.

#### login req -> zod -> auth service -> Auth.js manage sessions

- We use Auth.js for our authentication.

```bash
npm install next-auth@beta
```

13.
14.
