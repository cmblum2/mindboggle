
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  BrainCircuit, 
  LayoutDashboard, 
  Home, 
  LogOut, 
  Menu, 
  Lightbulb,
  Gamepad2
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import AuthModal from '@/components/AuthModal';
import { ThemeToggle } from '@/components/ThemeToggle';

interface NavBarProps {
  isLoggedIn: boolean;
  onLogout: () => void;
  extension?: React.ReactNode;
  overrideNavigation?: (path: string) => void;
}

const NavBar = ({ isLoggedIn, onLogout, extension, overrideNavigation }: NavBarProps) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleNavigation = (path: string) => {
    if (overrideNavigation) {
      overrideNavigation(path);
    } else {
      navigate(path);
    }
    setIsOpen(false);
  };
  
  const handleLogout = async () => {
    await onLogout();
    if (overrideNavigation) {
      overrideNavigation('/');
    } else {
      navigate('/');
    }
    setIsOpen(false);
  };
  
  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer group" onClick={() => handleNavigation('/')}>
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 group-hover:from-primary/30 group-hover:to-accent/30 transition-all">
            <BrainCircuit className="h-6 w-6 text-primary" />
          </div>
          <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
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
            <div className="flex flex-col gap-2 mt-8">
              <Button 
                variant="ghost" 
                className="flex items-center justify-start gap-3 h-12 rounded-xl hover:bg-primary/10" 
                onClick={() => handleNavigation('/')}
              >
                <Home className="h-5 w-5 text-brain-blue" /> Home
              </Button>
              <Button 
                variant="ghost" 
                className="flex items-center justify-start gap-3 h-12 rounded-xl hover:bg-primary/10" 
                onClick={() => handleNavigation('/info')}
              >
                <Lightbulb className="h-5 w-5 text-brain-yellow" /> Info
              </Button>
              {isLoggedIn && (
                <>
                  <Button 
                    variant="ghost" 
                    className="flex items-center justify-start gap-3 h-12 rounded-xl hover:bg-primary/10" 
                    onClick={() => handleNavigation('/dashboard')}
                  >
                    <LayoutDashboard className="h-5 w-5 text-brain-teal" /> Dashboard
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="flex items-center justify-start gap-3 h-12 rounded-xl hover:bg-primary/10" 
                    onClick={() => handleNavigation('/games')}
                  >
                    <Gamepad2 className="h-5 w-5 text-brain-coral" /> Games
                  </Button>
                  <div className="h-px bg-border/50 my-2" />
                  <Button 
                    variant="ghost" 
                    className="flex items-center justify-start gap-3 h-12 rounded-xl hover:bg-destructive/10 text-destructive" 
                    onClick={handleLogout}
                  >
                    <LogOut className="h-5 w-5" /> Logout
                  </Button>
                </>
              )}
              {!isLoggedIn && (
                <Button 
                  className="mt-4 h-12 rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground shadow-lg" 
                  onClick={() => setShowAuthModal(true)}
                  data-get-started
                >
                  Get Started
                </Button>
              )}
              <div className="mt-4 flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Theme</span>
                <ThemeToggle />
              </div>
            </div>
          </SheetContent>
        </Sheet>
        
        {/* Desktop menu */}
        <nav className="hidden md:flex items-center gap-1">
          <Button 
            variant="ghost" 
            className="rounded-full hover:bg-primary/10 transition-all" 
            onClick={() => handleNavigation('/')}
          >
            <Home className="h-4 w-4 mr-1.5 text-brain-blue" /> Home
          </Button>
          
          <Button 
            variant="ghost" 
            className="rounded-full hover:bg-primary/10 transition-all" 
            onClick={() => handleNavigation('/info')}
          >
            <Lightbulb className="h-4 w-4 mr-1.5 text-brain-yellow" /> Info
          </Button>
          
          {isLoggedIn ? (
            <>
              <Button 
                variant="ghost" 
                className="rounded-full hover:bg-primary/10 transition-all" 
                onClick={() => handleNavigation('/dashboard')}
              >
                <LayoutDashboard className="h-4 w-4 mr-1.5 text-brain-teal" /> Dashboard
              </Button>
              <Button 
                variant="ghost" 
                className="rounded-full hover:bg-primary/10 transition-all" 
                onClick={() => handleNavigation('/games')}
              >
                <Gamepad2 className="h-4 w-4 mr-1.5 text-brain-coral" /> Games
              </Button>
              <div className="w-px h-6 bg-border/50 mx-2" />
              <Button 
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4 mr-1.5" /> Logout
              </Button>
            </>
          ) : (
            <Button 
              className="ml-2 rounded-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground shadow-md hover:shadow-lg transition-all"
              onClick={() => setShowAuthModal(true)}
              data-get-started
            >
              Get Started
            </Button>
          )}
          
          <ThemeToggle />
          
          {extension}
        </nav>
      </div>
      
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </header>
  );
};

export default NavBar;
