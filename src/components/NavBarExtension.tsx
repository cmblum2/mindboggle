
import { ThemeToggle } from './ThemeToggle';
import { Bell, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavBarExtensionProps {
  className?: string;
}

const NavBarExtension = ({ className }: NavBarExtensionProps) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
        <Bell className="h-4 w-4 text-brain-blue" />
      </Button>
      <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
        <Settings className="h-4 w-4 text-brain-teal" />
      </Button>
      <ThemeToggle />
    </div>
  );
};

export default NavBarExtension;
