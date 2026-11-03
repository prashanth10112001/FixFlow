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
