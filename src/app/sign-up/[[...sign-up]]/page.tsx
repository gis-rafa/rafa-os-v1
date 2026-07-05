import { SignUp } from "@clerk/nextjs";
import { isClerkConfigured } from "@/lib/clerk-config";
import { AuthConfigMissing } from "@/components/auth-config-missing";

export default function SignUpPage() {
  if (!isClerkConfigured()) {
    return <AuthConfigMissing title="Sign up unavailable" />;
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-stone-100 px-4 py-10">
      <SignUp />
    </main>
  );
}
