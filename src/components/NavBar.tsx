
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Brain, GamepadIcon, Home, LogOut, Menu, User, InfoIcon } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface NavBarProps {
  isLoggedIn: boolean;
  onLogout: () => void;
  onLogin: () => void;
}

const NavBar = ({ isLoggedIn, onLogout, onLogin }: NavBarProps) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };
  
  return (
    <header className="sticky top-0 z-50 w-full bg-white/70 backdrop-blur-md border-b border-brain-teal/10">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNavigation('/')}>
          <Brain className="h-7 w-7 text-brain-purple" />
          <span className="font-bold text-xl tracking-tight">MindBoggle</span>
        </div>
        
        {/* Mobile menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <div className="flex flex-col gap-4 mt-8">
              <Button 
                variant="ghost" 
                className="flex items-center justify-start gap-2" 
                onClick={() => handleNavigation('/')}
              >
                <Home className="h-5 w-5" /> Home
              </Button>
              <Button 
                variant="ghost" 
                className="flex items-center justify-start gap-2" 
                onClick={() => handleNavigation('/info')}
              >
                <InfoIcon className="h-5 w-5" /> Info
              </Button>
              {isLoggedIn && (
                <>
                  <Button 
                    variant="ghost" 
                    className="flex items-center justify-start gap-2" 
                    onClick={() => handleNavigation('/dashboard')}
                  >
                    <User className="h-5 w-5" /> Dashboard
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="flex items-center justify-start gap-2" 
                    onClick={() => handleNavigation('/games')}
                  >
                    <GamepadIcon className="h-5 w-5" /> Games
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="flex items-center justify-start gap-2" 
                    onClick={onLogout}
                  >
                    <LogOut className="h-5 w-5" /> Logout
                  </Button>
                </>
              )}
              {!isLoggedIn && (
                <Button 
                  variant="default" 
                  className="bg-gradient-to-r from-brain-purple to-brain-teal text-white" 
                  onClick={onLogin}
                >
                  Get Started
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>
        
        {/* Desktop menu */}
        <nav className="hidden md:flex items-center gap-6">
          <Button 
            variant="ghost" 
            className="hover:bg-brain-teal/10" 
            onClick={() => handleNavigation('/')}
          >
            Home
          </Button>
          
          <Button 
            variant="ghost" 
            className="hover:bg-brain-teal/10" 
            onClick={() => handleNavigation('/info')}
          >
            Info
          </Button>
          
          {isLoggedIn ? (
            <>
              <Button 
                variant="ghost" 
                className="hover:bg-brain-teal/10" 
                onClick={() => handleNavigation('/dashboard')}
              >
                Dashboard
              </Button>
              <Button 
                variant="ghost" 
                className="hover:bg-brain-teal/10" 
                onClick={() => handleNavigation('/games')}
              >
                Games
              </Button>
              <Button 
                variant="outline" 
                onClick={onLogout}
              >
                Logout
              </Button>
            </>
          ) : (
            <Button 
              className="bg-gradient-to-r from-brain-purple to-brain-teal hover:opacity-90 text-white"
              onClick={onLogin}
            >
              Get Started
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default NavBar;
