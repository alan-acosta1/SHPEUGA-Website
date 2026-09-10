import ForgotPassword from "../components/ForgotPassword";
import AccountLayout from "../components/AccountLayout";

export default function ForgotPasswordPage() {
    return <AccountLayout title="Let’s get you back in." description="Enter your account email to request a password reset."><ForgotPassword /></AccountLayout>;
}
