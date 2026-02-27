import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="Sign In | Yolel System Dashboard"
        description="Login to your Yolel System dashboard - Advanced E-commerce Management"
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
