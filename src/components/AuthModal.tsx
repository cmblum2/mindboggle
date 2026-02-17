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
import { Separator } from '@/components/ui/separator';

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
  const { login, signup, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error?.message || "Could not sign in with Google.",
        variant: "destructive",
      });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: "Missing information", description: "Please enter both email and password.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      toast({ title: "Welcome back!", description: "Successfully logged in." });
      resetForm();
      onClose();
      navigate('/dashboard');
    } catch (error: any) {
      const msg = error.message?.includes('Invalid login credentials')
        ? "The email or password you entered is incorrect."
        : (error?.message || "Please check your credentials and try again.");
      toast({ title: "Login failed", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast({ title: "Missing information", description: "Please fill in all fields.", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Weak password", description: "Password should be at least 6 characters.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await signup(email, password, name);
      toast({ title: "Account created!", description: "Check your inbox to confirm your email.", duration: 5000 });
      resetForm();
      setActiveTab('login');
    } catch (error: any) {
      if (error.message?.includes('Email address already in use')) {
        toast({ title: "Email already in use", description: "Please use the login form instead.", variant: "destructive" });
        setActiveTab('login');
      } else {
        toast({ title: "Signup failed", description: error?.message || "Please try again.", variant: "destructive" });
      }
    } finally {
      setLoading(false);
    }
  };
  
  const resetForm = () => { setName(''); setEmail(''); setPassword(''); };
  const handleClose = () => { resetForm(); onClose(); };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[420px] rounded-2xl border-border/50 bg-background/95 backdrop-blur-xl">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-2xl font-bold text-center text-foreground">Welcome to MindBoggle</DialogTitle>
          <DialogDescription className="text-center text-muted-foreground text-sm">
            Train your brain with personalized cognitive games
          </DialogDescription>
        </DialogHeader>

        {/* Google Sign-In - Primary CTA */}
        <Button
          onClick={handleGoogleSignIn}
          variant="outline"
          className="w-full h-12 gap-3 rounded-xl border-border/60 hover:bg-accent/50 transition-all text-foreground font-medium"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </Button>

        <div className="relative my-1">
          <Separator className="bg-border/40" />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-xs text-muted-foreground">
            or
          </span>
        </div>

        <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 w-full mb-3 bg-muted/50 rounded-lg">
            <TabsTrigger value="login" className="rounded-md text-sm">Login</TabsTrigger>
            <TabsTrigger value="signup" className="rounded-md text-sm">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm text-foreground">Email</Label>
                <Input id="email" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} className="h-10 rounded-lg bg-muted/30 border-border/40" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm text-foreground">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="h-10 rounded-lg bg-muted/30 border-border/40" />
              </div>
              <Button type="submit" className="w-full h-10 rounded-lg bg-gradient-to-r from-brain-purple to-brain-teal text-white font-medium" disabled={loading} data-login-button>
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="signup">
            <form onSubmit={handleSignup} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-sm text-foreground">Name</Label>
                <Input id="name" type="text" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} className="h-10 rounded-lg bg-muted/30 border-border/40" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="signup-email" className="text-sm text-foreground">Email</Label>
                <Input id="signup-email" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} className="h-10 rounded-lg bg-muted/30 border-border/40" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="signup-password" className="text-sm text-foreground">Password</Label>
                <Input id="signup-password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="h-10 rounded-lg bg-muted/30 border-border/40" />
              </div>
              <Button type="submit" className="w-full h-10 rounded-lg bg-gradient-to-r from-brain-purple to-brain-teal text-white font-medium" disabled={loading} data-signup-button>
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
