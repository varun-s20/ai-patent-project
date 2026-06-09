import { signIn } from "@/app/auth/actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-2xl font-bold text-navy">Log in</h1>
      {error && <p className="mt-4 rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <form action={signIn} className="mt-6 space-y-4">
        <input name="email" type="email" placeholder="Email" required className="w-full rounded border p-3" />
        <input name="password" type="password" placeholder="Password" required className="w-full rounded border p-3" />
        <button className="w-full rounded bg-navy p-3 font-semibold text-white">Log in</button>
      </form>
      <p className="mt-4 text-sm">
        No account? <a href="/register" className="text-gold underline">Register</a>
      </p>
    </main>
  );
}
