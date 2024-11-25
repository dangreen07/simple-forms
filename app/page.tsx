import NavigationAnyAccess from "@/components/NavigationAnyAccess";


export default async function Home() {

  return (
    <div className="bg-neutral-100 min-h-screen">
      <main>
        {/* The navigation bar */}
        <NavigationAnyAccess />
        <div id="hero">
          {/* TODO: Implement hero section */}
        </div>
      </main>
    </div>
  );
}