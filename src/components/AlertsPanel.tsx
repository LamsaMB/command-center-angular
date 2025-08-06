import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  Shield, 
  Users, 
  Radio,
  Clock,
  MapPin,
  CheckCircle,
  X,
  Bell,
  Filter,
  Archive
} from 'lucide-react';

interface Alert {
  id: string;
  type: 'danger' | 'reinforcement' | 'ammunition' | 'medical';
  soldier: string;
  location: { lat: number; lng: number };
  timestamp: string;
  message: string;
  status: 'active' | 'acknowledged' | 'resolved';
  priority: 'low' | 'medium' | 'high' | 'critical';
}

const mockAlerts: Alert[] = [
  {
    id: 'ALT-001',
    type: 'danger',
    soldier: 'SOL-002',
    location: { lat: 48.8606, lng: 2.3376 },
    timestamp: '14:30:15',
    message: 'Contact ennemi signalé - Secteur Bravo',
    status: 'active',
    priority: 'critical'
  },
  {
    id: 'ALT-002',
    type: 'reinforcement',
    soldier: 'SOL-004',
    location: { lat: 48.8529, lng: 2.3499 },
    timestamp: '14:25:32',
    message: 'Demande de renforts - Position compromise',
    status: 'acknowledged',
    priority: 'high'
  },
  {
    id: 'ALT-003',
    type: 'ammunition',
    soldier: 'SOL-001',
    location: { lat: 48.8566, lng: 2.3522 },
    timestamp: '14:20:08',
    message: 'Munitions faibles - Réapprovisionnement nécessaire',
    status: 'active',
    priority: 'medium'
  }
];

const alertTypeConfig = {
  danger: { icon: AlertTriangle, color: 'destructive', label: 'Danger' },
  reinforcement: { icon: Users, color: 'warning', label: 'Renforts' },
  ammunition: { icon: Radio, color: 'default', label: 'Munitions' },
  medical: { icon: Shield, color: 'destructive', label: 'Médical' }
};

const priorityConfig = {
  low: { color: 'secondary', label: 'Faible' },
  medium: { color: 'default', label: 'Moyenne' },
  high: { color: 'warning', label: 'Élevée' },
  critical: { color: 'destructive', label: 'Critique' }
};

export const AlertsPanel = () => {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [filter, setFilter] = useState<'all' | 'active' | 'acknowledged' | 'resolved'>('all');
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  // Simulate real-time alerts
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
        const newAlert: Alert = {
          id: `ALT-${Date.now()}`,
          type: ['danger', 'reinforcement', 'ammunition', 'medical'][Math.floor(Math.random() * 4)] as Alert['type'],
          soldier: `SOL-${Math.floor(Math.random() * 10).toString().padStart(3, '0')}`,
          location: { 
            lat: 48.8566 + (Math.random() - 0.5) * 0.1, 
            lng: 2.3522 + (Math.random() - 0.5) * 0.1 
          },
          timestamp: new Date().toLocaleTimeString('fr-FR'),
          message: 'Nouvelle alerte détectée sur le terrain',
          status: 'active',
          priority: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as Alert['priority']
        };
        
        setAlerts(prev => [newAlert, ...prev]);
        
        // Play alert sound (in real app)
        console.log('🚨 Nouvelle alerte:', newAlert.type);
      }
    }, 10000); // Every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const handleAcknowledge = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, status: 'acknowledged' }
        : alert
    ));
  };

  const handleResolve = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, status: 'resolved' }
        : alert
    ));
  };

  const filteredAlerts = alerts.filter(alert => 
    filter === 'all' || alert.status === filter
  );

  const activeAlertsCount = alerts.filter(a => a.status === 'active').length;
  const criticalAlertsCount = alerts.filter(a => a.priority === 'critical' && a.status === 'active').length;

  return (
    <div className="space-y-6">
      {/* Alert Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="command-panel">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Alertes Actives</p>
                <p className="text-2xl font-bold font-mono text-destructive">{activeAlertsCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card className="command-panel">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critiques</p>
                <p className="text-2xl font-bold font-mono text-warning">{criticalAlertsCount}</p>
              </div>
              <Bell className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card className="command-panel">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Traitées</p>
                <p className="text-2xl font-bold font-mono text-success">
                  {alerts.filter(a => a.status === 'acknowledged').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="command-panel">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Résolues</p>
                <p className="text-2xl font-bold font-mono text-muted-foreground">
                  {alerts.filter(a => a.status === 'resolved').length}
                </p>
              </div>
              <Archive className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts List */}
        <div className="lg:col-span-2">
          <Card className="command-panel">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5 text-primary" />
                  <span>Centre d'Alertes</span>
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant={filter === 'all' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setFilter('all')}
                  >
                    Toutes
                  </Button>
                  <Button 
                    variant={filter === 'active' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setFilter('active')}
                  >
                    Actives
                  </Button>
                  <Button 
                    variant={filter === 'resolved' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setFilter('resolved')}
                  >
                    Résolues
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {filteredAlerts.map((alert) => {
                  const AlertIcon = alertTypeConfig[alert.type].icon;
                  
                  return (
                    <div 
                      key={alert.id}
                      className={`p-4 rounded-lg border transition-all cursor-pointer ${
                        selectedAlert?.id === alert.id 
                          ? 'border-primary bg-primary/10' 
                          : 'border-border hover:bg-secondary/50'
                      } ${alert.status === 'active' && alert.priority === 'critical' ? 'animate-pulse' : ''}`}
                      onClick={() => setSelectedAlert(alert)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <AlertIcon className={`h-5 w-5 mt-1 ${
                            alert.priority === 'critical' ? 'text-destructive' :
                            alert.priority === 'high' ? 'text-warning' :
                            'text-primary'
                          }`} />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-semibold text-sm">{alert.id}</span>
                              <Badge variant={alertTypeConfig[alert.type].color as any}>
                                {alertTypeConfig[alert.type].label}
                              </Badge>
                              <Badge variant={priorityConfig[alert.priority].color as any}>
                                {priorityConfig[alert.priority].label}
                              </Badge>
                            </div>
                            <p className="text-sm mb-2">{alert.message}</p>
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                              <div className="flex items-center space-x-1">
                                <Users className="h-3 w-3" />
                                <span>{alert.soldier}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>{alert.timestamp}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <MapPin className="h-3 w-3" />
                                <span>{alert.location.lat.toFixed(4)}, {alert.location.lng.toFixed(4)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {alert.status === 'active' && (
                            <>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAcknowledge(alert.id);
                                }}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Accuser réception
                              </Button>
                              <Button 
                                size="sm" 
                                className="tactical-button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleResolve(alert.id);
                                }}
                              >
                                Résoudre
                              </Button>
                            </>
                          )}
                          {alert.status === 'acknowledged' && (
                            <Button 
                              size="sm" 
                              className="tactical-button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleResolve(alert.id);
                              }}
                            >
                              Résoudre
                            </Button>
                          )}
                          {alert.status === 'resolved' && (
                            <Badge variant="outline" className="text-success border-success">
                              Résolue
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alert Details */}
        <div>
          <Card className="command-panel">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-primary" />
                <span>Détails de l'Alerte</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedAlert ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">ID: {selectedAlert.id}</h4>
                    <p className="text-sm text-muted-foreground">{selectedAlert.message}</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Type:</span>
                      <Badge variant={alertTypeConfig[selectedAlert.type].color as any}>
                        {alertTypeConfig[selectedAlert.type].label}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Priorité:</span>
                      <Badge variant={priorityConfig[selectedAlert.priority].color as any}>
                        {priorityConfig[selectedAlert.priority].label}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Soldat:</span>
                      <span className="text-sm font-mono">{selectedAlert.soldier}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Heure:</span>
                      <span className="text-sm font-mono">{selectedAlert.timestamp}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-sm text-muted-foreground">Position:</span>
                      <p className="text-sm font-mono bg-secondary/50 p-2 rounded">
                        {selectedAlert.location.lat.toFixed(6)}, {selectedAlert.location.lng.toFixed(6)}
                      </p>
                    </div>
                  </div>
                  
                  {selectedAlert.status === 'active' && (
                    <div className="space-y-2">
                      <Button 
                        onClick={() => handleAcknowledge(selectedAlert.id)}
                        variant="outline" 
                        className="w-full"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Accuser réception
                      </Button>
                      <Button 
                        onClick={() => handleResolve(selectedAlert.id)}
                        className="tactical-button w-full"
                      >
                        Résoudre l'alerte
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground text-center">
                  Sélectionnez une alerte pour voir les détails
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};