import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  Target, 
  Users, 
  MapPin, 
  Clock, 
  Radio, 
  Shield,
  Activity,
  AlertTriangle,
  CheckCircle,
  Calendar,
  FileText,
  Settings
} from 'lucide-react';

interface Mission {
  id: string;
  name: string;
  status: string;
  soldiers: number;
  location: string;
  lastUpdate: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  priority?: 'low' | 'medium' | 'high';
  progress?: number;
  objectives?: string[];
  equipment?: string[];
  transmissionMode?: string;
}

interface MissionDetailsProps {
  mission: Mission;
  onBack: () => void;
}

const mockMissionDetails: Mission = {
  id: 'OP-001',
  name: 'OPERATION ATLAS',
  status: 'active',
  soldiers: 12,
  location: 'Secteur Nord-Est',
  lastUpdate: '14:30',
  description: 'Mission de reconnaissance et de sécurisation du secteur Nord-Est. Surveillance des mouvements suspects et établissement d\'un périmètre de sécurité.',
  startDate: '2024-01-15 06:00',
  endDate: '2024-01-15 18:00',
  priority: 'high',
  progress: 65,
  objectives: [
    'Sécuriser le périmètre de la zone Alpha',
    'Établir un point de contrôle principal',
    'Effectuer des patrouilles de reconnaissance',
    'Maintenir les communications avec la base'
  ],
  equipment: [
    '12x Dispositifs ESP32 avec GPS',
    '12x Radios tactiques',
    '3x Véhicules blindés légers',
    '1x Station de communication satellite',
    'Équipement de vision nocturne'
  ],
  transmissionMode: 'Réseau Militaire Sécurisé'
};

const soldierUnits = [
  { id: 'ALPHA-01', name: 'Équipe Alpha', status: 'active', position: 'Point de contrôle Nord', lastContact: '14:28' },
  { id: 'BRAVO-01', name: 'Équipe Bravo', status: 'active', position: 'Patrouille Secteur Est', lastContact: '14:30' },
  { id: 'CHARLIE-01', name: 'Équipe Charlie', status: 'alert', position: 'Zone de surveillance Sud', lastContact: '14:25' },
  { id: 'DELTA-01', name: 'Équipe Delta', status: 'active', position: 'Base avancée', lastContact: '14:29' }
];

export const MissionDetails = ({ mission, onBack }: MissionDetailsProps) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'units' | 'objectives' | 'equipment'>('overview');
  
  // Utiliser les données mockées pour la démonstration
  const missionData = { ...mockMissionDetails, ...mission };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-success border-success';
      case 'alert': return 'text-destructive border-destructive';
      case 'completed': return 'text-primary border-primary';
      default: return 'text-muted-foreground border-muted-foreground';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-destructive border-destructive';
      case 'medium': return 'text-warning border-warning';
      case 'low': return 'text-success border-success';
      default: return 'text-muted-foreground border-muted-foreground';
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Mission Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="command-panel">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <span>Informations Générales</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Statut:</span>
                      <Badge variant="outline" className={getStatusColor(missionData.status)}>
                        {missionData.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Priorité:</span>
                      <Badge variant="outline" className={getPriorityColor(missionData.priority || 'medium')}>
                        {(missionData.priority || 'medium').toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Progression:</span>
                      <span className="text-sm font-medium">{missionData.progress}%</span>
                    </div>
                  </div>
                  <Progress value={missionData.progress} className="w-full" />
                </CardContent>
              </Card>

              <Card className="command-panel">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <span>Planning</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Début:</span>
                      <span className="text-sm font-medium">{missionData.startDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Fin prévue:</span>
                      <span className="text-sm font-medium">{missionData.endDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Dernière MAJ:</span>
                      <span className="text-sm font-medium">{missionData.lastUpdate}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Description */}
            <Card className="command-panel">
              <CardHeader>
                <CardTitle>Description de la Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{missionData.description}</p>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="command-panel">
                <CardContent className="p-4 text-center">
                  <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold font-mono">{missionData.soldiers}</p>
                  <p className="text-sm text-muted-foreground">Soldats</p>
                </CardContent>
              </Card>
              <Card className="command-panel">
                <CardContent className="p-4 text-center">
                  <MapPin className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-lg font-semibold">{missionData.location}</p>
                  <p className="text-sm text-muted-foreground">Zone d'opération</p>
                </CardContent>
              </Card>
              <Card className="command-panel">
                <CardContent className="p-4 text-center">
                  <Radio className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-sm font-semibold">{missionData.transmissionMode}</p>
                  <p className="text-sm text-muted-foreground">Communication</p>
                </CardContent>
              </Card>
              <Card className="command-panel">
                <CardContent className="p-4 text-center">
                  <Activity className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold font-mono">{missionData.progress}%</p>
                  <p className="text-sm text-muted-foreground">Progression</p>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'units':
        return (
          <div className="space-y-4">
            <Card className="command-panel">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span>Unités Déployées</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {soldierUnits.map((unit) => (
                    <div key={unit.id} className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg border border-border">
                      <div className="flex items-center space-x-4">
                        <div className={`status-indicator status-${unit.status === 'active' ? 'active' : 'danger'}`} />
                        <div>
                          <h4 className="font-semibold font-mono">{unit.id}</h4>
                          <p className="text-sm text-muted-foreground">{unit.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6 text-sm">
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{unit.position}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{unit.lastContact}</span>
                        </div>
                        <Badge variant="outline" className={getStatusColor(unit.status)}>
                          {unit.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'objectives':
        return (
          <div className="space-y-4">
            <Card className="command-panel">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-primary" />
                  <span>Objectifs de Mission</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {missionData.objectives?.map((objective, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-secondary/30 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                      <div>
                        <p className="font-medium">{objective}</p>
                        <p className="text-sm text-muted-foreground">Objectif {index + 1}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'equipment':
        return (
          <div className="space-y-4">
            <Card className="command-panel">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <span>Équipement Déployé</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {missionData.equipment?.map((item, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-secondary/30 rounded-lg">
                      <Settings className="h-5 w-5 text-primary" />
                      <span className="font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onBack} className="p-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="command-header text-xl">{missionData.name}</h2>
          <p className="text-sm text-muted-foreground">{missionData.id}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-secondary/50 p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Vue d\'ensemble', icon: Target },
          { id: 'units', label: 'Unités', icon: Users },
          { id: 'objectives', label: 'Objectifs', icon: CheckCircle },
          { id: 'equipment', label: 'Équipement', icon: Shield }
        ].map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'default' : 'ghost'}
            onClick={() => setActiveTab(tab.id as any)}
            className="flex-1 flex items-center space-x-2"
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </Button>
        ))}
      </div>

      {/* Content */}
      {renderTabContent()}
    </div>
  );
};