import Login from "../components/LogIn";
import AccountLayout from "../components/AccountLayout";

export default function LoginPage() {
    return <AccountLayout title="Welcome back." description="Sign in to your UGA SHPE member account."><Login /></AccountLayout>;
}
