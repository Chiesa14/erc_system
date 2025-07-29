// src/pages/ActivationSuccess.tsx
import { Church } from "lucide-react";

const ActivationSuccess = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="flex items-center justify-center mb-4">
          <div className="w-14 h-14 bg-green-600 rounded-lg flex items-center justify-center">
            <Church className="w-7 h-7 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-foreground">
          Account Activated
        </h1>
        <p className="text-muted-foreground">
          Your account has been successfully activated. You can now log in using
          your new password.
        </p>
        <a
          href="/login"
          className="inline-block bg-primary text-white px-5 py-2 rounded-md shadow hover:bg-primary/90 transition"
        >
          Go to Login
        </a>
      </div>
    </div>
  );
};

export default ActivationSuccess;
