
import { ThemeToggle } from './ThemeToggle';

interface NavBarExtensionProps {
  className?: string;
}

const NavBarExtension = ({ className }: NavBarExtensionProps) => {
  return (
    <div className={className}>
      <ThemeToggle />
    </div>
  );
};

export default NavBarExtension;
