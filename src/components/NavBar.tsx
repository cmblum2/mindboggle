
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  BrainCircuit, 
  LayoutDashboard, 
  Home, 
  LogOut, 
  Menu, 
  PanelTopOpen,
  Lightbulb,
  Gamepad2
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import AuthModal from '@/components/AuthModal';

interface NavBarProps {
  isLoggedIn: boolean;
  onLogout: () => void;
  extension?: React.ReactNode;
  // The overrideNavigation prop allows GameDetail to handle navigation with confirmation
  overrideNavigation?: (path: string) => void;
}

const NavBar = ({ isLoggedIn, onLogout, extension, overrideNavigation }: NavBarProps) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleNavigation = (path: string) => {
    if (overrideNavigation) {
      // Use the override navigation if provided
      overrideNavigation(path);
    } else {
      // Otherwise use the default navigation
      navigate(path);
    }
    setIsOpen(false);
  };
  
  const handleLogout = async () => {
    await onLogout();
    // After logout, navigate home
    if (overrideNavigation) {
      overrideNavigation('/');
    } else {
      navigate('/');
    }
    setIsOpen(false);
  };
  
  return (
    <header className="sticky top-0 z-50 w-full bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border-b border-brain-teal/10">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNavigation('/')}>
          <BrainCircuit className="h-7 w-7 text-brain-purple" />
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
                <Home className="h-5 w-5 text-brain-blue" /> Home
              </Button>
              <Button 
                variant="ghost" 
                className="flex items-center justify-start gap-2" 
                onClick={() => handleNavigation('/info')}
              >
                <Lightbulb className="h-5 w-5 text-brain-yellow" /> Info
              </Button>
              {isLoggedIn && (
                <>
                  <Button 
                    variant="ghost" 
                    className="flex items-center justify-start gap-2" 
                    onClick={() => handleNavigation('/dashboard')}
                  >
                    <LayoutDashboard className="h-5 w-5 text-brain-teal" /> Dashboard
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="flex items-center justify-start gap-2" 
                    onClick={() => handleNavigation('/games')}
                  >
                    <Gamepad2 className="h-5 w-5 text-brain-coral" /> Games
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="flex items-center justify-start gap-2" 
                    onClick={handleLogout}
                  >
                    <LogOut className="h-5 w-5 text-brain-purple" /> Logout
                  </Button>
                </>
              )}
              {!isLoggedIn && (
                <Button 
                  variant="default" 
                  className="bg-gradient-to-r from-brain-purple to-brain-teal text-white" 
                  onClick={() => setShowAuthModal(true)}
                  data-get-started
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
            className="hover:bg-brain-teal/10 flex items-center gap-1" 
            onClick={() => handleNavigation('/')}
          >
            <Home className="h-4 w-4 text-brain-blue mr-1" /> Home
          </Button>
          
          <Button 
            variant="ghost" 
            className="hover:bg-brain-teal/10 flex items-center gap-1" 
            onClick={() => handleNavigation('/info')}
          >
            <Lightbulb className="h-4 w-4 text-brain-yellow mr-1" /> Info
          </Button>
          
          {isLoggedIn ? (
            <>
              <Button 
                variant="ghost" 
                className="hover:bg-brain-teal/10 flex items-center gap-1" 
                onClick={() => handleNavigation('/dashboard')}
              >
                <LayoutDashboard className="h-4 w-4 text-brain-teal mr-1" /> Dashboard
              </Button>
              <Button 
                variant="ghost" 
                className="hover:bg-brain-teal/10 flex items-center gap-1" 
                onClick={() => handleNavigation('/games')}
              >
                <Gamepad2 className="h-4 w-4 text-brain-coral mr-1" /> Games
              </Button>
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="flex items-center gap-1"
              >
                <LogOut className="h-4 w-4 mr-1" /> Logout
              </Button>
            </>
          ) : (
            <Button 
              className="bg-gradient-to-r from-brain-purple to-brain-teal hover:opacity-90 text-white"
              onClick={() => setShowAuthModal(true)}
              data-get-started
            >
              Get Started
            </Button>
          )}
          
          {/* Add extension slot */}
          {extension}
        </nav>
      </div>
      
      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </header>
  );
};

export default NavBar;
