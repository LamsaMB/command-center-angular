import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Users, 
  AlertTriangle, 
  Radio, 
  Settings,
  Search,
  Filter,
  Target,
  Activity
} from 'lucide-react';

interface Soldier {
  id: string;
  name: string;
  position: { lat: number; lng: number };
  status: 'active' | 'alert' | 'offline';
  lastUpdate: string;
  mission: string;
}

const mockSoldiers: Soldier[] = [
  {
    id: 'SOL-001',
    name: 'Équipe Alpha',
    position: { lat: 48.8566, lng: 2.3522 },
    status: 'active',
    lastUpdate: '14:32',
    mission: 'OP-001'
  },
  {
    id: 'SOL-002',
    name: 'Équipe Bravo',
    position: { lat: 48.8606, lng: 2.3376 },
    status: 'alert',
    lastUpdate: '14:30',
    mission: 'OP-001'
  },
  {
    id: 'SOL-003',
    name: 'Équipe Charlie',
    position: { lat: 48.8529, lng: 2.3499 },
    status: 'active',
    lastUpdate: '14:31',
    mission: 'OP-001'
  }
];

export const MissionMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [soldiers] = useState<Soldier[]>(mockSoldiers);
  const [selectedSoldier, setSelectedSoldier] = useState<Soldier | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(true);
  const map = useRef<any>(null);

  const initializeMap = async () => {
    if (!mapContainer.current || !mapboxToken) return;

    try {
      // Dynamically import mapbox-gl
      const mapboxgl = await import('mapbox-gl');
      await import('mapbox-gl/dist/mapbox-gl.css');

      mapboxgl.default.accessToken = mapboxToken;
      
      map.current = new mapboxgl.default.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [2.3522, 48.8566],
        zoom: 12,
      });

      map.current.addControl(new mapboxgl.default.NavigationControl(), 'top-right');

      // Add soldiers markers
      soldiers.forEach((soldier) => {
        const markerColor = soldier.status === 'active' ? '#22c55e' : 
                           soldier.status === 'alert' ? '#ef4444' : '#6b7280';

        new mapboxgl.default.Marker({ color: markerColor })
          .setLngLat([soldier.position.lng, soldier.position.lat])
          .setPopup(
            new mapboxgl.default.Popup({ offset: 25 })
              .setHTML(`
                <div class="p-2">
                  <h3 class="font-semibold">${soldier.name}</h3>
                  <p class="text-sm">ID: ${soldier.id}</p>
                  <p class="text-sm">Status: ${soldier.status}</p>
                  <p class="text-sm">Dernière mise à jour: ${soldier.lastUpdate}</p>
                </div>
              `)
          )
          .addTo(map.current);
      });

      setShowTokenInput(false);
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de la carte:', error);
    }
  };

  useEffect(() => {
    if (mapboxToken) {
      initializeMap();
    }

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [mapboxToken]);

  if (showTokenInput) {
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
            <p className="text-muted-foreground">
              Pour afficher la carte tactique, veuillez entrer votre token Mapbox public.
              Vous pouvez l'obtenir sur <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">mapbox.com</a>
            </p>
            <div className="space-y-2">
              <Input
                placeholder="pk.eyJ1Ijoi..."
                value={mapboxToken}
                onChange={(e) => setMapboxToken(e.target.value)}
                className="bg-input"
              />
              <Button 
                onClick={() => mapboxToken && initializeMap()} 
                disabled={!mapboxToken}
                className="tactical-button"
              >
                Initialiser la carte
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map */}
        <div className="lg:col-span-3">
          <Card className="command-panel">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span>Carte Tactique</span>
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtres
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Vue
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div 
                ref={mapContainer} 
                className="w-full h-[600px] rounded-lg bg-secondary/20 border border-border"
              />
            </CardContent>
          </Card>
        </div>

        {/* Soldiers Panel */}
        <div className="space-y-4">
          <Card className="command-panel">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-primary" />
                <span>Unités Déployées</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Rechercher une unité..."
                  className="pl-10 bg-input"
                />
              </div>

              <div className="space-y-3">
                {soldiers.map((soldier) => (
                  <div 
                    key={soldier.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedSoldier?.id === soldier.id 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:bg-secondary/50'
                    }`}
                    onClick={() => setSelectedSoldier(soldier)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className={`status-indicator status-${soldier.status === 'active' ? 'active' : soldier.status === 'alert' ? 'danger' : 'warning'}`} />
                        <span className="font-medium text-sm">{soldier.name}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {soldier.id}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3" />
                        <span>{soldier.position.lat.toFixed(4)}, {soldier.position.lng.toFixed(4)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Activity className="h-3 w-3" />
                        <span>Dernière activité: {soldier.lastUpdate}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="command-panel">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Actifs</span>
                  <span className="font-semibold text-success">{soldiers.filter(s => s.status === 'active').length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">En alerte</span>
                  <span className="font-semibold text-destructive">{soldiers.filter(s => s.status === 'alert').length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Hors ligne</span>
                  <span className="font-semibold text-muted-foreground">{soldiers.filter(s => s.status === 'offline').length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};