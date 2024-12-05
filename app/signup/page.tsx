import NavigationAnyAccess from "@/components/NavigationAnyAccess";
import SignupForm from "./SignupForm";

export default function Page() {
	return (
		<main className="flex flex-col min-h-screen bg-neutral-50">
			<NavigationAnyAccess />
			<SignupForm />
		</main>
	);
}