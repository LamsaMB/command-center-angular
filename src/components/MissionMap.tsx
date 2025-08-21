import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Users, 
  Target, 
  AlertTriangle, 
  Activity, 
  Search, 
  Filter, 
  Settings,
  Clock
} from 'lucide-react';


// Interfaces
interface Position {
  lat: number;
  lng: number;
}

interface Soldier {
  id: string;
  name: string;
  position: Position;
  status: 'active' | 'alert' | 'offline';
  mission: string;
  lastUpdate: string;
}

interface OperationZone {
  id: string;
  name: string;
  coordinates: Position[];
  type: 'secure' | 'danger' | 'restricted';
  description: string;
}

interface MissionObjective {
  id: string;
  name: string;
  position: Position;
  type: 'primary' | 'secondary' | 'intel';
  status: 'pending' | 'in_progress' | 'completed';
  description: string;
}



const MissionMap: React.FC = () => {
  // États
  const [soldiers, setSoldiers] = useState<Soldier[]>([
    {
      id: 'S001',
      name: 'Alpha Team Leader',
      position: { lat: 48.8566, lng: 2.3522 },
      status: 'active',
      mission: 'Reconnaissance',
      lastUpdate: '2 min ago'
    },
    {
      id: 'S002',
      name: 'Bravo Sniper',
      position: { lat: 48.8576, lng: 2.3532 },
      status: 'alert',
      mission: 'Overwatch',
      lastUpdate: '1 min ago'
    },
    {
      id: 'S003',
      name: 'Charlie Medic',
      position: { lat: 48.8556, lng: 2.3512 },
      status: 'offline',
      mission: 'Support',
      lastUpdate: '5 min ago'
    }
  ]);

  const [operationZones, setOperationZones] = useState<OperationZone[]>([
    {
      id: 'Z001',
      name: 'Zone Alpha',
      coordinates: [
        { lat: 48.8560, lng: 2.3520 },
        { lat: 48.8570, lng: 2.3520 },
        { lat: 48.8570, lng: 2.3530 },
        { lat: 48.8560, lng: 2.3530 }
      ],
      type: 'secure',
      description: 'Zone sécurisée'
    }
  ]);

  const [objectives, setObjectives] = useState<MissionObjective[]>([
    {
      id: 'O001',
      name: 'Point de contrôle Alpha',
      position: { lat: 48.8566, lng: 2.3522 },
      type: 'primary',
      status: 'in_progress',
      description: 'Sécuriser le point de contrôle'
    },
    {
      id: 'O002',
      name: 'Collecte Intel',
      position: { lat: 48.8576, lng: 2.3532 },
      type: 'intel',
      status: 'pending',
      description: 'Récupérer les documents'
    }
  ]);

  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [showTokenInput, setShowTokenInput] = useState<boolean>(true);
  const [showSimpleMap, setShowSimpleMap] = useState<boolean>(false);
  const [filters, setFilters] = useState({
    showSoldiers: true,
    showObjectives: true,
    showZones: true,
    soldierStatus: ['active', 'alert', 'offline']
  });
  const [selectedSoldier, setSelectedSoldier] = useState<Soldier | null>(null);
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState<boolean>(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [showCoordinates, setShowCoordinates] = useState<boolean>(false);
  const [currentCoordinates, setCurrentCoordinates] = useState<Position | null>(null);
  const [measurementMode, setMeasurementMode] = useState<boolean>(false);
  const [measurementPoints, setMeasurementPoints] = useState<Position[]>([]);
  const [totalDistance, setTotalDistance] = useState<number>(0);

  // Refs
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fonction d'initialisation de la carte
  const initializeMap = useCallback(() => {
    if (!mapContainer.current || !mapboxToken) return;
    
    // Logique d'initialisation Mapbox ici
    console.log('Initialisation de la carte Mapbox');
  }, [mapboxToken]);

  // Fonctions utilitaires
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active': return 'text-green-500';
      case 'alert': return 'text-red-500';
      case 'offline': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  };

  const getZoneColor = (type: string): string => {
    switch (type) {
      case 'secure': return 'rgba(34, 197, 94, 0.3)';
      case 'danger': return 'rgba(239, 68, 68, 0.3)';
      case 'restricted': return 'rgba(245, 158, 11, 0.3)';
      default: return 'rgba(156, 163, 175, 0.3)';
    }
  };

  const getObjectiveIcon = (type: string): string => {
    switch (type) {
      case 'primary': return '🎯';
      case 'secondary': return '📍';
      case 'intel': return '📋';
      default: return '📍';
    }
  };

  const calculateDistance = (point1: Position, point2: Position): number => {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLon = (point2.lng - point1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const calculateTotalDistance = (points: Position[]): number => {
    if (points.length < 2) return 0;
    let total = 0;
    for (let i = 1; i < points.length; i++) {
      total += calculateDistance(points[i-1], points[i]);
    }
    return total;
  };

  const simulateRealTimeUpdate = useCallback(() => {
    setSoldiers(prevSoldiers => 
      prevSoldiers.map(soldier => ({
        ...soldier,
        position: {
          lat: soldier.position.lat + (Math.random() - 0.5) * 0.001,
          lng: soldier.position.lng + (Math.random() - 0.5) * 0.001
        },
        lastUpdate: new Date().toLocaleTimeString('fr-FR')
      }))
    );
    setLastUpdate(new Date());
  }, []);

  const formatCoordinates = (lat: number, lng: number): string => {
    return `${lat.toFixed(6)}°N, ${lng.toFixed(6)}°E`;
  };

  const resetMeasurement = () => {
    setMeasurementPoints([]);
    setTotalDistance(0);
  };

  // Fonction pour gérer le mode carte simplifiée
  const handleSimpleMapMode = () => {
    setShowSimpleMap(true);
    setShowTokenInput(false);
  };





  // Hook pour la gestion du mode temps réel
  useEffect(() => {
    if (isRealTimeEnabled) {
      updateIntervalRef.current = setInterval(simulateRealTimeUpdate, 5000);
    } else {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
        updateIntervalRef.current = null;
      }
    }

    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [isRealTimeEnabled, simulateRealTimeUpdate]);

  // Hook pour la gestion du token Mapbox
  useEffect(() => {
    if (mapboxToken && !showSimpleMap) {
      initializeMap();
    }
  }, [mapboxToken, showSimpleMap, initializeMap]);

  // Callback pour la mise à jour des marqueurs
  const updateMarkers = useCallback(() => {
    if (!map.current) return;
    
    // Logique de mise à jour des marqueurs
    console.log('Mise à jour des marqueurs');
  }, [soldiers, objectives, operationZones, filters]);

  // Hook pour la mise à jour des marqueurs
  useEffect(() => {
    updateMarkers();
  }, [updateMarkers]);

  // Rendu conditionnel pour le mode carte simplifiée
  if (showSimpleMap) {
    return (
      <div className="space-y-6">
        <Card className="command-panel">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-primary" />
                <span>Carte Tactique Simplifiée</span>
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button 
                  onClick={() => setIsRealTimeEnabled(!isRealTimeEnabled)}
                  variant={isRealTimeEnabled ? "default" : "outline"}
                  size="sm"
                >
                  <Activity className="h-4 w-4 mr-2" />
                  {isRealTimeEnabled ? 'Temps réel ON' : 'Temps réel OFF'}
                </Button>
                <Button 
                  onClick={() => {
                    setShowSimpleMap(false);
                    setShowTokenInput(true);
                  }}
                  variant="outline"
                  size="sm"
                >
                  Mode Avancé
                </Button>

              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Carte tactique avec grille */}
            <div className="relative bg-slate-900 rounded-lg p-6 mb-6" style={{ minHeight: '400px' }}>
              {/* Grille tactique */}
              <div className="absolute inset-0 opacity-20">
                <svg className="w-full h-full">
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#10b981" strokeWidth="1"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>
              
              {/* Zones d'opération */}
              {operationZones.map((zone, index) => (
                <div 
                  key={zone.id}
                  className={`absolute border-2 rounded-lg p-2 ${
                    zone.type === 'secure' ? 'border-green-500 bg-green-500/10' :
                    zone.type === 'danger' ? 'border-red-500 bg-red-500/10' :
                    'border-yellow-500 bg-yellow-500/10'
                  }`}
                  style={{
                    left: `${20 + index * 25}%`,
                    top: `${30 + index * 15}%`,
                    width: '120px',
                    height: '80px'
                  }}
                >
                  <div className="text-xs font-medium text-white">{zone.name}</div>
                  <div className="text-xs text-gray-300">{zone.type}</div>
                </div>
              ))}
              
              {/* Soldats positionnés */}
              {soldiers.map((soldier, index) => (
                <div 
                  key={soldier.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                  style={{
                    left: `${25 + index * 20}%`,
                    top: `${40 + index * 15}%`
                  }}
                  onClick={() => setSelectedSoldier(soldier)}
                >
                  <div className={`w-6 h-6 rounded-full border-2 border-white flex items-center justify-center ${
                    soldier.status === 'active' ? 'bg-green-500' :
                    soldier.status === 'alert' ? 'bg-red-500 animate-pulse' : 'bg-gray-500'
                  }`}>
                    <Users className="h-3 w-3 text-white" />
                  </div>
                  <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {soldier.name}
                  </div>
                </div>
              ))}
              
              {/* Objectifs */}
              {objectives.map((objective, index) => (
                <div 
                  key={objective.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                  style={{
                    left: `${60 + index * 15}%`,
                    top: `${25 + index * 20}%`
                  }}
                >
                  <div className={`w-8 h-8 rounded-lg border-2 border-white flex items-center justify-center ${
                    objective.type === 'primary' ? 'bg-blue-500' :
                    objective.type === 'secondary' ? 'bg-purple-500' : 'bg-orange-500'
                  } ${
                    objective.status === 'completed' ? 'opacity-50' : ''
                  }`}>
                    <Target className="h-4 w-4 text-white" />
                  </div>
                  <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {objective.name}
                  </div>
                </div>
              ))}
              
              {/* Légende */}
              <div className="absolute bottom-4 left-4 bg-black/80 text-white p-3 rounded-lg text-xs">
                <div className="font-medium mb-2">Légende</div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Unité Active</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span>Unité en Alerte</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span>Objectif Principal</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500/20 border border-green-500 rounded"></div>
                    <span>Zone Sécurisée</span>
                  </div>
                </div>
              </div>
              
              {/* Coordonnées de référence */}
              <div className="absolute top-4 right-4 bg-black/80 text-white p-2 rounded text-xs font-mono">
                <div>Grid: 12S UD 41234 56789</div>
                <div>Scale: 1:25,000</div>
              </div>
            </div>
            
            {/* Informations détaillées du soldat sélectionné */}
            {selectedSoldier && (
              <Card className="mb-4 border-primary">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{selectedSoldier.name}</CardTitle>
                    <Button 
                      onClick={() => setSelectedSoldier(null)}
                      variant="ghost"
                      size="sm"
                    >
                      ×
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Mission</p>
                      <p className="text-sm text-muted-foreground">{selectedSoldier.mission}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Statut</p>
                      <Badge variant={selectedSoldier.status === 'active' ? 'default' : selectedSoldier.status === 'alert' ? 'destructive' : 'secondary'}>
                        {selectedSoldier.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Dernière MAJ</p>
                      <p className="text-sm text-muted-foreground">{selectedSoldier.lastUpdate}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Position</p>
                      <p className="text-sm text-muted-foreground font-mono">
                        {selectedSoldier.position.lat.toFixed(4)}°N, {selectedSoldier.position.lng.toFixed(4)}°E
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Résumé tactique */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Users className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{soldiers.filter(s => s.status === 'active').length}</p>
                  <p className="text-sm text-muted-foreground">Unités Actives</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Target className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{objectives.filter(o => o.status === 'completed').length}/{objectives.length}</p>
                  <p className="text-sm text-muted-foreground">Objectifs Complétés</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{soldiers.filter(s => s.status === 'alert').length}</p>
                  <p className="text-sm text-muted-foreground">Alertes Actives</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Rendu conditionnel pour la configuration Mapbox
  if (showTokenInput && !showSimpleMap) {
    return (
      <div className="space-y-6">
        <Card className="command-panel">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-primary" />
              <span>Configuration Mapbox</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Token Mapbox (optionnel)
              </label>
              <Input
                type="password"
                placeholder="Entrez votre token Mapbox..."
                value={mapboxToken}
                onChange={(e) => setMapboxToken(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Obtenez votre token sur mapbox.com
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => setShowTokenInput(false)}
                disabled={!mapboxToken}
                className="flex-1"
              >
                Initialiser la carte
              </Button>
              <Button 
                onClick={handleSimpleMapMode}
                variant="outline"
                className="flex-1"
              >
                Mode simplifié
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Rendu principal du composant
  return (
    <div className="space-y-6">
      <Card className="command-panel">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-primary" />
              <span>Carte Tactique</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button 
                onClick={() => setIsRealTimeEnabled(!isRealTimeEnabled)}
                variant={isRealTimeEnabled ? "default" : "outline"}
                size="sm"
              >
                <Activity className="h-4 w-4 mr-2" />
                {isRealTimeEnabled ? 'Temps réel ON' : 'Temps réel OFF'}
              </Button>
              <Button 
                onClick={() => setShowCoordinates(!showCoordinates)}
                variant={showCoordinates ? "default" : "outline"}
                size="sm"
              >
                <Search className="h-4 w-4 mr-2" />
                Coordonnées
              </Button>
              <Button 
                onClick={() => setMeasurementMode(!measurementMode)}
                variant={measurementMode ? "default" : "outline"}
                size="sm"
              >
                <Target className="h-4 w-4 mr-2" />
                Mesure
              </Button>

            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div ref={mapContainer} className="w-full h-96 rounded-lg" />
          
          {showCoordinates && currentCoordinates && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">
                Coordonnées: {formatCoordinates(currentCoordinates.lat, currentCoordinates.lng)}
              </p>
            </div>
          )}
          
          {measurementMode && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Mode Mesure Activé</p>
                  <p className="text-xs text-muted-foreground">
                    Points: {measurementPoints.length} | Distance: {totalDistance.toFixed(2)} km
                  </p>
                </div>
                <Button onClick={resetMeasurement} variant="outline" size="sm">
                  Réinitialiser
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Panneau de contrôle des filtres */}
      <Card className="command-panel">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-primary" />
            <span>Filtres</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Éléments</label>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.showSoldiers}
                    onChange={(e) => setFilters(prev => ({ ...prev, showSoldiers: e.target.checked }))}
                  />
                  <span className="text-sm">Soldats</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.showObjectives}
                    onChange={(e) => setFilters(prev => ({ ...prev, showObjectives: e.target.checked }))}
                  />
                  <span className="text-sm">Objectifs</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.showZones}
                    onChange={(e) => setFilters(prev => ({ ...prev, showZones: e.target.checked }))}
                  />
                  <span className="text-sm">Zones</span>
                </label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Panneau d'informations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="command-panel">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <span>Unités Déployées</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {soldiers.slice(0, 5).map((soldier) => (
                <div key={soldier.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">{soldier.name}</p>
                    <p className="text-sm text-muted-foreground">{soldier.mission}</p>
                  </div>
                  <Badge 
                    variant={soldier.status === 'active' ? 'default' : 
                            soldier.status === 'alert' ? 'destructive' : 'secondary'}
                  >
                    {soldier.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="command-panel">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-primary" />
              <span>Objectifs de Mission</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {objectives.map((objective) => (
                <div key={objective.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">{objective.name}</p>
                    <p className="text-sm text-muted-foreground">{objective.type}</p>
                  </div>
                  <Badge 
                    variant={objective.status === 'completed' ? 'default' : 
                            objective.status === 'in_progress' ? 'secondary' : 'outline'}
                  >
                    {objective.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MissionMap;