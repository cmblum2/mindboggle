
import { ThemeToggle } from './ThemeToggle';

interface NavBarExtensionProps {
  className?: string;
}

const NavBarExtension = ({ className }: NavBarExtensionProps) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <ThemeToggle />
    </div>
  );
};

export default NavBarExtension;
