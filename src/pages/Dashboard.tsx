import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import NavBar from '@/components/NavBar';
import { seedDemoDataIfNeeded } from '@/lib/demoData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Sparkles, Gamepad2, BarChart3, Brain, FlaskConical, Database } from 'lucide-react';
import OverviewTab from '@/components/dashboard/OverviewTab';
import CognitiveProfileTab from '@/components/dashboard/CognitiveProfileTab';
import TrainingInsightsTab from '@/components/dashboard/TrainingInsightsTab';
import ExperimentsTab from '@/components/dashboard/ExperimentsTab';
import DataExplorerTab from '@/components/dashboard/DataExplorerTab';

interface DashboardProps {
  navBarExtension?: React.ReactNode;
}

const Dashboard = ({ navBarExtension }: DashboardProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user) {
      seedDemoDataIfNeeded(user.id);
    }
  }, [user]);

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NavBar isLoggedIn={true} onLogout={() => {}} extension={navBarExtension} />
      
      <main className="flex-1 container px-4 py-6 md:py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-sm font-medium text-primary border border-primary/20 mb-2">
              <Sparkles className="h-3 w-3" />
              Analytics Dashboard
            </div>
            <h1 className="text-2xl font-bold text-foreground">Welcome back, {user.name || user.email?.split('@')[0]}</h1>
            <p className="text-sm text-muted-foreground">Your cognitive training analytics at a glance</p>
          </div>
          <Button
            onClick={() => navigate('/train')}
            className="mt-3 md:mt-0 rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground shadow-lg"
            size="sm"
          >
            <Gamepad2 className="h-4 w-4 mr-2" />
            Start Training
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-card border border-border/50 p-1 rounded-xl h-auto flex-wrap gap-1">
            <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5 text-xs sm:text-sm">
              <BarChart3 className="h-3.5 w-3.5" /> Overview
            </TabsTrigger>
            <TabsTrigger value="profile" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5 text-xs sm:text-sm">
              <Brain className="h-3.5 w-3.5" /> Cognitive Profile
            </TabsTrigger>
            <TabsTrigger value="insights" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5 text-xs sm:text-sm">
              <Sparkles className="h-3.5 w-3.5" /> Training Insights
            </TabsTrigger>
            <TabsTrigger value="experiments" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5 text-xs sm:text-sm">
              <FlaskConical className="h-3.5 w-3.5" /> Experiments
            </TabsTrigger>
            <TabsTrigger value="data" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5 text-xs sm:text-sm">
              <Database className="h-3.5 w-3.5" /> Data Explorer
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview"><OverviewTab /></TabsContent>
          <TabsContent value="profile"><CognitiveProfileTab /></TabsContent>
          <TabsContent value="insights"><TrainingInsightsTab /></TabsContent>
          <TabsContent value="experiments"><ExperimentsTab /></TabsContent>
          <TabsContent value="data"><DataExplorerTab /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
