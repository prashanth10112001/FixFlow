import LoginForm from "./login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-blue-600">
            FixFlow
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Apartment maintenance, simplified.
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>

          <p className="mt-2 text-sm text-gray-500">
            Sign in to manage your apartment community.
          </p>

          <div className="mt-8">
            <LoginForm />
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-gray-400">
          &copy; 2026 FixFlow. All rights reserved.
        </p>
      </div>
    </main>
  );
}
