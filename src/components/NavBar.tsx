import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  BrainCircuit, LayoutDashboard, Home, LogOut, Menu,
  Lightbulb, Gamepad2, Target, Calendar, Database
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import AuthModal from '@/components/AuthModal';

interface NavBarProps {
  isLoggedIn: boolean;
  onLogout: () => void;
  extension?: React.ReactNode;
  overrideNavigation?: (path: string) => void;
}

const NavBar = ({ isLoggedIn, onLogout, extension, overrideNavigation }: NavBarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleNavigation = (path: string) => {
    if (overrideNavigation) overrideNavigation(path);
    else navigate(path);
    setIsOpen(false);
  };
  
  const handleLogout = async () => {
    await onLogout();
    handleNavigation('/');
  };

  const isActive = (path: string) => location.pathname === path;

  const navItems = isLoggedIn ? [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', color: 'text-primary' },
    { path: '/train', icon: Target, label: 'Train', color: 'text-accent' },
    { path: '/games', icon: Gamepad2, label: 'Games', color: 'text-brain-coral' },
    { path: '/history', icon: Calendar, label: 'History', color: 'text-brain-blue' },
  ] : [];
  
  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer group" onClick={() => handleNavigation('/')}>
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 group-hover:from-primary/30 group-hover:to-accent/30 transition-all">
            <BrainCircuit className="h-5 w-5 text-primary" />
          </div>
          <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            MindBoggle
          </span>
        </div>
        
        {/* Mobile menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent className="bg-background/95 backdrop-blur-xl border-border/50">
            <div className="flex flex-col gap-1 mt-8">
              {navItems.map(item => (
                <Button key={item.path} variant="ghost" 
                  className={`flex items-center justify-start gap-3 h-11 rounded-xl ${isActive(item.path) ? 'bg-primary/10' : 'hover:bg-primary/10'}`}
                  onClick={() => handleNavigation(item.path)}
                >
                  <item.icon className={`h-4 w-4 ${item.color}`} /> {item.label}
                </Button>
              ))}
              {isLoggedIn && (
                <>
                  <div className="h-px bg-border/50 my-2" />
                  <Button variant="ghost" className="flex items-center justify-start gap-3 h-11 rounded-xl hover:bg-destructive/10 text-destructive" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" /> Logout
                  </Button>
                </>
              )}
              {!isLoggedIn && (
                <Button className="mt-4 h-11 rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground shadow-lg" 
                  onClick={() => setShowAuthModal(true)} data-get-started>
                  Get Started
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>
        
        {/* Desktop menu */}
        <nav className="hidden md:flex items-center gap-0.5">
          {navItems.map(item => (
            <Button key={item.path} variant="ghost" size="sm"
              className={`rounded-full text-xs gap-1.5 ${isActive(item.path) ? 'bg-primary/10 text-primary' : 'hover:bg-primary/10'}`}
              onClick={() => handleNavigation(item.path)}
            >
              <item.icon className={`h-3.5 w-3.5 ${isActive(item.path) ? 'text-primary' : item.color}`} /> {item.label}
            </Button>
          ))}
          
          {isLoggedIn ? (
            <>
              <div className="w-px h-5 bg-border/50 mx-1" />
              <Button variant="ghost" size="sm" onClick={handleLogout}
                className="rounded-full text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-1.5">
                <LogOut className="h-3.5 w-3.5" /> Logout
              </Button>
            </>
          ) : (
            <Button className="ml-2 rounded-full text-xs bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground shadow-md"
              onClick={() => setShowAuthModal(true)} data-get-started>
              Get Started
            </Button>
          )}
          {extension}
        </nav>
      </div>
      
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </header>
  );
};

export default NavBar;
