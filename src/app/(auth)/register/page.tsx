import { Card, CardContent } from "@/components/ui/card";
import { RegisterForm } from "./register-form";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen w-screen items-center justify-center bg-slate-50 py-10">
      <Card className="w-full max-w-[500px]">
        <CardContent className="pt-6">
          <RegisterForm />
        </CardContent>
      </Card>
    </div>
  );
}
