import { Navbar } from "./Navbar";

export function MainLayout({ children }) {
  const linkedinUrl = "https://www.linkedin.com/in/shivendra-keshari-46aa67256/";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16 pb-20 md:pb-8">
        {children}
      </main>

      <footer className="border-t border-border py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} DevLinker.</p>
          <p className="text-sm text-muted-foreground">
            Made with love by{" "}
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground transition-colors"
            >
              Shivendra Keshari
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
