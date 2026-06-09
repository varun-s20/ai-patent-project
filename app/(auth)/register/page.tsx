import { signUp } from "@/app/auth/actions";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-2xl font-bold text-navy">Create your account</h1>
      {error && <p className="mt-4 rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <form action={signUp} className="mt-6 space-y-4">
        <input name="fullName" placeholder="Full name" required className="w-full rounded border p-3" />
        <input name="email" type="email" placeholder="Email" required className="w-full rounded border p-3" />
        <input name="password" type="password" placeholder="Password" required minLength={8} className="w-full rounded border p-3" />
        <button className="w-full rounded bg-navy p-3 font-semibold text-white">Register</button>
      </form>
      <p className="mt-4 text-sm">
        Already have an account? <a href="/login" className="text-gold underline">Log in</a>
      </p>
    </main>
  );
}
