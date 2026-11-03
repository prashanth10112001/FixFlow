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
