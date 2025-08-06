import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  MapPin, 
  Users, 
  Radio, 
  Wifi, 
  Satellite, 
  Shield,
  Download,
  FileText,
  Cpu,
  CheckCircle
} from 'lucide-react';

interface CreateMissionProps {
  onBack: () => void;
  onMissionCreated: () => void;
}

const transmissionModes = [
  { id: 'gsm', name: 'GSM', icon: Radio, description: 'Réseau cellulaire standard' },
  { id: 'satellite', name: 'Satellite', icon: Satellite, description: 'Communication satellite militaire' },
  { id: 'wifi', name: 'Wi-Fi Sécurisé', icon: Wifi, description: 'Réseau Wi-Fi chiffré' },
  { id: 'lora', name: 'LoRa', icon: Radio, description: 'Longue portée, faible consommation' },
  { id: 'military', name: 'Réseau Militaire', icon: Shield, description: 'Réseau privé sécurisé' }
];

export const CreateMission = ({ onBack, onMissionCreated }: CreateMissionProps) => {
  const [step, setStep] = useState<'details' | 'transmission' | 'config'>('details');
  const [missionData, setMissionData] = useState({
    name: '',
    sector: '',
    soldiers: '',
    description: '',
    transmissionMode: ''
  });

  const handleNextStep = () => {
    if (step === 'details') setStep('transmission');
    else if (step === 'transmission') setStep('config');
  };

  const handleGenerateConfig = () => {
    // Simulate config generation
    setTimeout(() => {
      onMissionCreated();
    }, 2000);
  };

  const renderStepContent = () => {
    switch (step) {
      case 'details':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mission-name">Nom de l'opération</Label>
                <Input
                  id="mission-name"
                  placeholder="ex: OPERATION ATLAS"
                  value={missionData.name}
                  onChange={(e) => setMissionData(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sector">Secteur géographique</Label>
                <Input
                  id="sector"
                  placeholder="ex: Secteur Nord-Est, Zone Alpha"
                  value={missionData.sector}
                  onChange={(e) => setMissionData(prev => ({ ...prev, sector: e.target.value }))}
                  className="bg-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="soldiers">Nombre de soldats</Label>
                <Input
                  id="soldiers"
                  type="number"
                  placeholder="ex: 12"
                  value={missionData.soldiers}
                  onChange={(e) => setMissionData(prev => ({ ...prev, soldiers: e.target.value }))}
                  className="bg-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description de la mission</Label>
                <Textarea
                  id="description"
                  placeholder="Objectifs, contraintes, remarques particulières..."
                  value={missionData.description}
                  onChange={(e) => setMissionData(prev => ({ ...prev, description: e.target.value }))}
                  className="bg-input min-h-[100px]"
                />
              </div>
            </div>

            <Button 
              onClick={handleNextStep}
              disabled={!missionData.name || !missionData.sector || !missionData.soldiers}
              className="tactical-button w-full"
            >
              Continuer vers la transmission
            </Button>
          </div>
        );

      case 'transmission':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Sélection du mode de transmission</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {transmissionModes.map((mode) => (
                  <Card 
                    key={mode.id}
                    className={`cursor-pointer transition-all ${
                      missionData.transmissionMode === mode.id 
                        ? 'ring-2 ring-primary bg-primary/10' 
                        : 'hover:bg-secondary/50'
                    }`}
                    onClick={() => setMissionData(prev => ({ ...prev, transmissionMode: mode.id }))}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <mode.icon className="h-6 w-6 text-primary mt-1" />
                        <div>
                          <h4 className="font-semibold">{mode.name}</h4>
                          <p className="text-sm text-muted-foreground">{mode.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <Button 
              onClick={handleNextStep}
              disabled={!missionData.transmissionMode}
              className="tactical-button w-full"
            >
              Générer la configuration
            </Button>
          </div>
        );

      case 'config':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <CheckCircle className="h-16 w-16 text-success mx-auto" />
              <h3 className="text-lg font-semibold">Configuration générée avec succès</h3>
              <p className="text-muted-foreground">
                Les éléments suivants sont prêts pour le déploiement
              </p>
            </div>

            <div className="space-y-4">
              <Card className="command-panel">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Cpu className="h-5 w-5 text-primary" />
                      <div>
                        <h4 className="font-semibold">Code ESP32</h4>
                        <p className="text-sm text-muted-foreground">Firmware prêt à téléverser</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="command-panel">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-primary" />
                      <div>
                        <h4 className="font-semibold">Liste des composants</h4>
                        <p className="text-sm text-muted-foreground">Matériel nécessaire</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="command-panel">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-primary" />
                      <div>
                        <h4 className="font-semibold">Schéma de câblage</h4>
                        <p className="text-sm text-muted-foreground">Diagramme de connexion</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Button 
              onClick={handleGenerateConfig}
              className="tactical-button w-full"
            >
              Finaliser la mission
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onBack} className="p-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="command-header text-xl">Création de Mission</h2>
          <p className="text-sm text-muted-foreground">
            Étape {step === 'details' ? '1' : step === 'transmission' ? '2' : '3'} sur 3
          </p>
        </div>
      </div>

      <Card className="command-panel">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {step === 'details' && <><MapPin className="h-5 w-5" /><span>Détails de la Mission</span></>}
            {step === 'transmission' && <><Radio className="h-5 w-5" /><span>Mode de Transmission</span></>}
            {step === 'config' && <><CheckCircle className="h-5 w-5" /><span>Configuration Générée</span></>}
          </CardTitle>
          <CardDescription>
            {step === 'details' && 'Saisissez les informations de base de l\'opération'}
            {step === 'transmission' && 'Choisissez le mode de communication pour vos équipes'}
            {step === 'config' && 'Votre configuration est prête pour le déploiement'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>
    </div>
  );
};