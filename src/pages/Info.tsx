
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Brain, GamepadIcon, Star, LightbulbIcon } from 'lucide-react';
import NavBar from '@/components/NavBar';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface InfoProps {
  navBarExtension?: React.ReactNode;
}

const Info = ({ navBarExtension }: InfoProps) => {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Create a wrapper function for login that doesn't require parameters
  const handleLogin = () => {
    // The actual login will be handled by a modal or form
    // This is just a placeholder that matches the expected function signature
    login('', '');
  };
  
  const handleButtonClick = (path: string) => {
    if (user) {
      navigate(path);
    } else {
      // Show toast notification that login is required
      toast({
        title: "Login Required",
        description: "Please login or create an account to access this feature.",
        variant: "default",
      });
      
      // This will trigger the auth modal through the NavBar component
      const getStartedButton = document.querySelector('[data-get-started]') as HTMLButtonElement;
      if (getStartedButton) {
        getStartedButton.click();
      }
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar 
        isLoggedIn={!!user}
        onLogout={logout}
        onLogin={handleLogin}
        extension={navBarExtension}
      />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-12 md:py-20 bg-gradient-to-b from-background to-brain-purple/5 dark:from-background dark:to-brain-purple/10">
          <div className="container px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                A Proactive Approach to <span className="text-gradient">Cognitive Health</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8">
                MindBoggle combines neuroscience, engaging gameplay, and AI-powered feedback to help maintain and improve your cognitive abilities.
              </p>
              <Button
                className="bg-gradient-to-r from-brain-purple to-brain-teal hover:opacity-90 text-white px-8"
                size="lg"
                onClick={() => navigate('/games')}
              >
                Try Our Games
              </Button>
            </div>
          </div>
        </section>
        
        {/* Our Approach Section */}
        <section className="py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-10 text-center">Our Approach</h2>
              
              <div className="space-y-16">
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="w-full md:w-1/3 flex justify-center">
                    <div className="w-32 h-32 rounded-full bg-brain-purple/10 flex items-center justify-center dark:bg-brain-purple/20">
                      <Brain className="h-16 w-16 text-brain-purple" />
                    </div>
                  </div>
                  <div className="w-full md:w-2/3">
                    <h3 className="text-2xl font-bold mb-3">Science-Based Foundation</h3>
                    <p className="text-muted-foreground">
                      Built on principles from the Bredesen Protocol, our exercises are designed to target specific 
                      cognitive domains including memory, attention, processing speed, and executive function. 
                      Regular cognitive stimulation through engaging activities has been shown to support brain health.
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row-reverse gap-8 items-center">
                  <div className="w-full md:w-1/3 flex justify-center">
                    <div className="w-32 h-32 rounded-full bg-brain-teal/10 flex items-center justify-center dark:bg-brain-teal/20">
                      <GamepadIcon className="h-16 w-16 text-brain-teal" />
                    </div>
                  </div>
                  <div className="w-full md:w-2/3">
                    <h3 className="text-2xl font-bold mb-3">Engaging Gameplay</h3>
                    <p className="text-muted-foreground">
                      Cognitive exercises are most effective when they're enjoyable. Our games are designed 
                      to be fun and engaging while providing meaningful cognitive challenges. Multiple difficulty 
                      levels ensure that games remain challenging as your skills improve, providing the 
                      right amount of cognitive stretch.
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="w-full md:w-1/3 flex justify-center">
                    <div className="w-32 h-32 rounded-full bg-brain-coral/10 flex items-center justify-center dark:bg-brain-coral/20">
                      <LightbulbIcon className="h-16 w-16 text-brain-coral" />
                    </div>
                  </div>
                  <div className="w-full md:w-2/3">
                    <h3 className="text-2xl font-bold mb-3">AI-Powered Insights</h3>
                    <p className="text-muted-foreground">
                      What makes MindBoggle unique is our AI-powered feedback system. After each game, 
                      you receive personalized analysis of your performance, highlighting strengths and 
                      suggesting areas for improvement. This feedback loop helps maximize the benefits of 
                      your brain training sessions and keeps you motivated.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Benefits Section */}
        <section className="py-16 md:py-24 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold">Benefits of Regular Brain Training</h2>
              <p className="text-muted-foreground mt-2">Research suggests consistent cognitive exercise may provide these benefits</p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto">
              <div className="brain-card">
                <h3 className="text-xl font-bold mb-3">Maintain Cognitive Function</h3>
                <p className="text-muted-foreground">
                  Regular cognitive challenges help maintain neural pathways and cognitive reserve, supporting 
                  brain health as you age.
                </p>
              </div>
              
              <div className="brain-card">
                <h3 className="text-xl font-bold mb-3">Improve Mental Agility</h3>
                <p className="text-muted-foreground">
                  Targeted exercises can help improve processing speed, memory recall, and problem-solving abilities.
                </p>
              </div>
              
              <div className="brain-card">
                <h3 className="text-xl font-bold mb-3">Track Progress Over Time</h3>
                <p className="text-muted-foreground">
                  Our system monitors your performance, allowing you to see improvements and identify areas for growth.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">Ready to Exercise Your Brain?</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Take a proactive approach to your cognitive health with MindBoggle's 
                engaging games and personalized feedback.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  className="bg-gradient-to-r from-brain-purple to-brain-teal hover:opacity-90 text-white px-8"
                  size="lg"
                  onClick={() => handleButtonClick('/games')}
                >
                  Start Playing
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleButtonClick('/dashboard')}
                >
                  View Dashboard
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Info;
