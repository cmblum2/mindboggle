
import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const [activeTab, setActiveTab] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { toast } = useToast();
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Missing information",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      await login(email, password);
      toast({
        title: "Welcome back!",
        description: "Successfully logged in.",
      });
      resetForm();
      onClose();
      navigate('/dashboard');
    } catch (error: any) {
      console.error("Login error:", error);
      if (error.message?.includes('not confirmed')) {
        toast({
          title: "Email not confirmed",
          description: "Please check your email and confirm your account before logging in.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login failed",
          description: error?.message || "Please check your credentials and try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }
    
    if (password.length < 6) {
      toast({
        title: "Weak password",
        description: "Password should be at least 6 characters.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      await signup(email, password, name);
      toast({
        title: "Account created!",
        description: "Your account has been created successfully. Please log in to continue.",
        duration: 5000,
      });
      resetForm();
      // Switch to the login tab after successful signup
      setActiveTab('login');
    } catch (error: any) {
      console.error("Signup error:", error);
      if (error.message?.includes('Email address already in use')) {
        toast({
          title: "Email already in use",
          description: "This email is already registered. Try logging in instead.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Signup failed",
          description: error?.message || "Please try again with a different email.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };
  
  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Welcome to MindBoggle</DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Train your brain with personalized AI-guided games
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 w-full mb-4">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-brain-purple to-brain-teal text-white"
                disabled={loading}
                data-login-button
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="signup">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-brain-purple to-brain-teal text-white"
                disabled={loading}
                data-signup-button
              >
                {loading ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
