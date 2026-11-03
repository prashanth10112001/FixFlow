import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold text-gray-900">Welcome to FixFlow</h1>

        <p className="mt-2 text-gray-600">
          Hello, {session.user.name ?? "Resident"}!
        </p>

        <div className="mt-8 rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Resident Dashboard</h2>

          <p className="mt-2 text-gray-500">
            Your apartment maintenance workspace will appear here.
          </p>
        </div>
      </div>
    </main>
  );
}
