import NavigationAnyAccess from "@/components/NavigationAnyAccess";
import LoginForm from "./LoginForm";

export default async function Page() {
	return (
		<main className="flex flex-col min-h-screen bg-neutral-50">
			<NavigationAnyAccess />
			<LoginForm />
		</main>
	);
}