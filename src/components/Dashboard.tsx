import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Users, 
  MapPin, 
  Radio, 
  AlertTriangle, 
  Plus,
  Activity,
  Globe,
  Zap,
  Clock,
  Target
} from 'lucide-react';
import { CreateMission } from './CreateMission';
import MissionMap from './MissionMap';
import { AlertsPanel } from './AlertsPanel';
import { MissionDetails } from './MissionDetails';

interface DashboardProps {
  onLogout: () => void;
}

export const Dashboard = ({ onLogout }: DashboardProps) => {
  const [activeView, setActiveView] = useState<'overview' | 'create-mission' | 'map' | 'alerts' | 'mission-details'>('overview');
  const [selectedMission, setSelectedMission] = useState<any>(null);
  const [activeMissions, setActiveMissions] = useState([
    {
      id: 'OP-001',
      name: 'OPERATION ATLAS',
      status: 'active',
      soldiers: 12,
      location: 'Secteur Nord-Est',
      lastUpdate: '14:30'
    }
  ]);

  const stats = [
    { label: 'Missions Actives', value: activeMissions.length, icon: Target, status: 'active' },
    { label: 'Soldats Déployés', value: 47, icon: Users, status: 'active' },
    { label: 'Alertes en Cours', value: 3, icon: AlertTriangle, status: 'warning' },
    { label: 'Systèmes Opérationnels', value: '98%', icon: Activity, status: 'active' }
  ];

  const handleMissionClick = (mission: any) => {
    setSelectedMission(mission);
    setActiveView('mission-details');
  };

  const renderContent = () => {
    switch (activeView) {
      case 'create-mission':
        return <CreateMission onBack={() => setActiveView('overview')} onMissionCreated={() => setActiveView('overview')} />;
      case 'map':
        return <MissionMap />;
      case 'alerts':
        return <AlertsPanel />;
      case 'mission-details':
        return selectedMission ? (
          <MissionDetails 
            mission={selectedMission} 
            onBack={() => setActiveView('overview')} 
          />
        ) : null;
      default:
        return (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <Card key={index} className="command-panel">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                        <p className="text-2xl font-bold font-mono">{stat.value}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <stat.icon className="h-6 w-6 text-primary" />
                        <div className={`status-indicator status-${stat.status}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Actions */}
            <Card className="command-panel">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-primary" />
                  <span>Actions Rapides</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    onClick={() => setActiveView('create-mission')}
                    className="tactical-button h-16 flex-col space-y-2"
                  >
                    <Plus className="h-6 w-6" />
                    <span>Nouvelle Mission</span>
                  </Button>
                  <Button 
                    onClick={() => setActiveView('map')}
                    className="tactical-button h-16 flex-col space-y-2"
                  >
                    <MapPin className="h-6 w-6" />
                    <span>Carte Tactique</span>
                  </Button>
                  <Button 
                    onClick={() => setActiveView('alerts')}
                    className="tactical-button h-16 flex-col space-y-2"
                  >
                    <AlertTriangle className="h-6 w-6" />
                    <span>Centre d'Alertes</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Active Missions */}
            <Card className="command-panel">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-primary" />
                  <span>Missions en Cours</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeMissions.map((mission) => (
                    <div 
                      key={mission.id} 
                      className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg border border-border cursor-pointer hover:bg-secondary/70 transition-all duration-200 hover:border-primary/50"
                      onClick={() => handleMissionClick(mission)}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="status-indicator status-active" />
                        <div>
                          <h4 className="font-semibold font-mono">{mission.id}</h4>
                          <p className="text-sm text-muted-foreground">{mission.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6 text-sm">
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{mission.soldiers}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{mission.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{mission.lastUpdate}</span>
                        </div>
                        <Badge variant="outline" className="text-success border-success">
                          {mission.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img src="/military-logo.svg" alt="Logo Militaire" className="h-10 w-10" />
              <div>
                <h1 className="command-header text-xl">CENTRE DE COMMANDEMENT</h1>
                <p className="text-sm text-muted-foreground">Opérations Tactiques</p>
              </div>
            </div>
            
            <nav className="flex items-center space-x-4">
              <Button 
                variant={activeView === 'overview' ? 'default' : 'ghost'}
                onClick={() => setActiveView('overview')}
                className="flex items-center space-x-2"
              >
                <Globe className="h-4 w-4" />
                <span>Vue d'ensemble</span>
              </Button>
              <Button 
                variant={activeView === 'map' ? 'default' : 'ghost'}
                onClick={() => setActiveView('map')}
                className="flex items-center space-x-2"
              >
                <MapPin className="h-4 w-4" />
                <span>Carte</span>
              </Button>
              <Button 
                variant={activeView === 'alerts' ? 'default' : 'ghost'}
                onClick={() => setActiveView('alerts')}
                className="flex items-center space-x-2"
              >
                <AlertTriangle className="h-4 w-4" />
                <span>Alertes</span>
              </Button>
              <Button variant="outline" onClick={onLogout}>
                Déconnexion
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {renderContent()}
      </main>
    </div>
  );
};