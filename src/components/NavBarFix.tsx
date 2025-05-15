
// This file is a simple temporary fix to address build errors with NavBar
// It provides compatibility with components expecting an onLogin prop

import NavBar from "@/components/NavBar";

// Create a wrapper that handles the onLogin prop but doesn't pass it to NavBar
export const NavBarWithLogin = ({ 
  isLoggedIn, 
  onLogout, 
  onLogin, 
  extension,
  overrideNavigation
}: { 
  isLoggedIn: boolean; 
  onLogout: () => void; 
  onLogin?: () => void; 
  extension?: React.ReactNode;
  overrideNavigation?: (path: string) => void;
}) => {
  return (
    <NavBar 
      isLoggedIn={isLoggedIn} 
      onLogout={onLogout} 
      extension={extension}
      overrideNavigation={overrideNavigation}
    />
  );
};

export default NavBarWithLogin;
