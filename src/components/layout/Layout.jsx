import { Link, useLocation } from "wouter";
import { LayoutDashboard, ListOrdered, BarChart3, Moon, Sun, Settings } from "lucide-react";
import { useFinance } from "../../context/FinanceContext";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "../ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Menu } from "lucide-react";
export function Layout({ children }) {
    const [location] = useLocation();
    const { role, setRole, theme, setTheme } = useFinance();
    const navigation = [
        { name: "Dashboard", href: "/", icon: LayoutDashboard },
        { name: "Transactions", href: "/transactions", icon: ListOrdered },
        { name: "Insights", href: "/insights", icon: BarChart3 },
    ];
    const NavLinks = () => (<>
      {navigation.map((item) => {
            const isActive = location === item.href;
            return (<Link key={item.name} href={item.href} className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium ${isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
            <item.icon className="h-4 w-4"/>
            {item.name}
          </Link>);
        })}
    </>);
    return (<div className="flex min-h-screen w-full bg-background font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden border-r bg-card w-64 flex-col md:flex">
        <div className="flex h-16 items-center border-b px-6">
          <div className="flex items-center gap-2 font-bold text-lg tracking-tight font-mono">
            <div className="bg-primary text-primary-foreground p-1 rounded">
              <BarChart3 className="h-5 w-5"/>
            </div>
            Terminal
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-4 py-4">
          <NavLinks />
        </nav>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b bg-card px-6">
          <div className="flex items-center gap-4 md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5"/>
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="flex h-16 items-center border-b px-6">
                  <div className="flex items-center gap-2 font-bold text-lg tracking-tight font-mono">
                    <div className="bg-primary text-primary-foreground p-1 rounded">
                      <BarChart3 className="h-5 w-5"/>
                    </div>
                    Terminal
                  </div>
                </div>
                <nav className="flex-1 space-y-1 px-4 py-4">
                  <NavLinks />
                </nav>
              </SheetContent>
            </Sheet>
          </div>

          <div className="flex-1"/>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "light" ? "dark" : "light")} title="Toggle theme">
              {theme === "light" ? <Moon className="h-5 w-5"/> : <Sun className="h-5 w-5"/>}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 font-mono text-xs uppercase tracking-wider">
                  <Settings className="h-4 w-4"/>
                  {role}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setRole("viewer")}>
                  Viewer (Read-only)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRole("admin")}>
                  Admin (Full access)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-6xl">
            {children}
          </div>
        </main>
      </div>
    </div>);
}
