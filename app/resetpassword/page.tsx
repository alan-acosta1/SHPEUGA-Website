import ResetPassword from "../components/resetPassword";
import AccountLayout from "../components/AccountLayout";

export default function ResetPasswordPage() {
    return <AccountLayout title="A fresh start." description="Choose a new password for your member account."><ResetPassword /></AccountLayout>;
}
