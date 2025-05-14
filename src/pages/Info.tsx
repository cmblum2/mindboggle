import React from 'react';
import NavBar from '@/components/NavBar';

interface InfoProps {
  navBarExtension?: React.ReactNode;
}

const Info = ({ navBarExtension }: InfoProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar 
        isLoggedIn={false}
        onLogout={() => {}}
        extension={navBarExtension}
      />
      <main className="flex-1 p-4">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold mb-4">Info Page</h1>
          <p>This is the info page content.</p>
        </div>
      </main>
    </div>
  );
};

export default Info;
