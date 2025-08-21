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
  CheckCircle2,
  Calendar,
  FileText,
  Settings,
  Download
} from 'lucide-react';
import jsPDF from 'jspdf';

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

interface MissionReport {
  missionId: string;
  missionName: string;
  commander: string;
  status: string;
  priority: string;
  startDate: string;
  endDate: string;
  location: string;
  description: string;
  soldiers: Array<{
    id: string;
    name: string;
    status: string;
    position: string;
    lastContact: string;
  }>;
  objectives: string[];
  equipment: string[];
  transmissionMode: string;
  progress: number;
  summary: {
    totalSoldiers: number;
    activeSoldiers: number;
    alertSoldiers: number;
    completedObjectives: number;
    totalObjectives: number;
  };
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
  const [missionCompleted, setMissionCompleted] = useState(false);
  
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

  // Fonction pour générer le rapport de mission
  const generateMissionReport = (): MissionReport => {
    const activeSoldiers = soldierUnits.filter(s => s.status === 'active').length;
    const alertSoldiers = soldierUnits.filter(s => s.status === 'alert').length;
    const completedObjectives = Math.floor((missionData.objectives?.length || 0) * (missionData.progress || 0) / 100);
    
    return {
      missionId: missionData.id,
      missionName: missionData.name,
      commander: 'Commandant Martin',
      status: missionData.status,
      priority: missionData.priority || 'medium',
      startDate: missionData.startDate || new Date().toISOString(),
      endDate: missionData.endDate || new Date().toISOString(),
      location: missionData.location,
      description: missionData.description || '',
      soldiers: soldierUnits,
      objectives: missionData.objectives || [],
      equipment: missionData.equipment || [],
      transmissionMode: missionData.transmissionMode || 'Standard',
      progress: missionData.progress || 0,
      summary: {
        totalSoldiers: soldierUnits.length,
        activeSoldiers,
        alertSoldiers,
        completedObjectives,
        totalObjectives: missionData.objectives?.length || 0
      }
    };
  };

  // Fonction pour télécharger le rapport PDF
  const downloadMissionReport = () => {
    const report = generateMissionReport();
    const pdf = new jsPDF();
    
    // Configuration et couleurs
    const pageWidth = pdf.internal.pageSize.width;
    const pageHeight = pdf.internal.pageSize.height;
    const margin = 20;
    let yPosition = 30;
    
    // Couleurs
    const primaryColor: [number, number, number] = [41, 128, 185]; // Bleu militaire
    const secondaryColor: [number, number, number] = [52, 73, 94]; // Gris foncé
    const accentColor: [number, number, number] = [231, 76, 60]; // Rouge pour les alertes
    const successColor: [number, number, number] = [39, 174, 96]; // Vert pour les succès
    const warningColor: [number, number, number] = [243, 156, 18]; // Orange pour les avertissements
    
    // Fonction pour dessiner une section avec bordure
    const drawSection = (title: string, y: number, height: number = 15) => {
      // Bordure de section
      pdf.setDrawColor(...primaryColor);
      pdf.setLineWidth(0.5);
      pdf.rect(margin - 5, y - 5, pageWidth - 2 * margin + 10, height);
      
      // Fond de titre
      pdf.setFillColor(...primaryColor);
      pdf.rect(margin - 5, y - 5, pageWidth - 2 * margin + 10, 8, 'F');
      
      // Titre en blanc
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(title, margin, y);
      
      // Reset couleur texte
      pdf.setTextColor(0, 0, 0);
      
      return y + 12;
    };
    
    // Fonction pour dessiner un badge de statut
    const drawStatusBadge = (status: string, x: number, y: number) => {
      let color = secondaryColor;
      if (status.toLowerCase() === 'active' || status.toLowerCase() === 'completed') {
        color = successColor;
      } else if (status.toLowerCase() === 'alert' || status.toLowerCase() === 'high') {
        color = accentColor;
      } else if (status.toLowerCase() === 'medium') {
        color = warningColor;
      }
      
      pdf.setFillColor(...color);
      pdf.roundedRect(x, y - 3, 25, 6, 2, 2, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.text(status.toUpperCase(), x + 2, y + 1);
      pdf.setTextColor(0, 0, 0);
    };
    
    // En-tête avec design amélioré
    // Bannière supérieure
    pdf.setFillColor(...primaryColor);
    pdf.rect(0, 0, pageWidth, 25, 'F');
    
    // Logo/Emblème (simulé avec un cercle)
    pdf.setFillColor(255, 255, 255);
    pdf.circle(25, 12.5, 8, 'F');
    pdf.setTextColor(...primaryColor);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('*', 22, 15);
    
    // Titre principal
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('RAPPORT DE MISSION TACTIQUE', pageWidth / 2, 15, { align: 'center' });
    
    yPosition = 35;
    
    // Sous-titre avec encadré
    pdf.setTextColor(0, 0, 0);
    pdf.setDrawColor(...primaryColor);
    pdf.setLineWidth(1);
    pdf.rect(margin, yPosition, pageWidth - 2 * margin, 20);
    pdf.setFillColor(245, 245, 245);
    pdf.rect(margin, yPosition, pageWidth - 2 * margin, 20, 'F');
    
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${report.missionName}`, pageWidth / 2, yPosition + 8, { align: 'center' });
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`ID Mission: ${report.missionId}`, pageWidth / 2, yPosition + 15, { align: 'center' });
    
    yPosition += 35;
    
    // Section Informations générales
    yPosition = drawSection('>> INFORMATIONS GENERALES', yPosition, 70);
    
    // Grille d'informations avec icônes
    const infoItems = [
      { icon: '>', label: 'Commandant', value: report.commander },
      { icon: '*', label: 'Statut', value: report.status.toUpperCase(), badge: true },
      { icon: '!', label: 'Priorite', value: report.priority.toUpperCase(), badge: true },
      { icon: '+', label: 'Localisation', value: report.location },
      { icon: '~', label: 'Transmission', value: report.transmissionMode },
      { icon: '%', label: 'Progression', value: `${report.progress}%` },
      { icon: '-', label: 'Debut', value: new Date(report.startDate).toLocaleString('fr-FR') },
      { icon: '=', label: 'Fin', value: new Date(report.endDate).toLocaleString('fr-FR') }
    ];
    
    let col = 0;
    infoItems.forEach((item, index) => {
      const x = margin + (col * (pageWidth - 2 * margin) / 2);
      const maxWidth = (pageWidth - 2 * margin) / 2 - 10;
      
      pdf.setFontSize(8);
      pdf.text(item.icon, x, yPosition);
      pdf.setFont('helvetica', 'bold');
      pdf.text(item.label + ':', x + 8, yPosition);
      pdf.setFont('helvetica', 'normal');
      
      if (item.badge) {
        drawStatusBadge(item.value, x + 45, yPosition);
      } else {
        const splitValue = pdf.splitTextToSize(item.value, maxWidth - 45);
        pdf.text(splitValue, x + 45, yPosition);
      }
      
      col = (col + 1) % 2;
      if (col === 0) yPosition += 10;
    });
    
    yPosition += 15;
    
    // Section Résumé exécutif avec graphiques
    yPosition = drawSection('>> RESUME EXECUTIF', yPosition, 60);
    
    // Barre de progression
    const progressWidth = 100;
    const progressHeight = 8;
    pdf.setDrawColor(...secondaryColor);
    pdf.rect(margin, yPosition, progressWidth, progressHeight);
    pdf.setFillColor(...successColor);
    pdf.rect(margin, yPosition, (progressWidth * report.progress) / 100, progressHeight, 'F');
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Progression: ${report.progress}%`, margin + progressWidth + 10, yPosition + 5);
    
    yPosition += 15;
    
    // Statistiques avec icônes colorées
    const stats = [
      { icon: '#', label: 'Soldats deployes', value: report.summary.totalSoldiers, color: primaryColor },
      { icon: '+', label: 'Soldats actifs', value: report.summary.activeSoldiers, color: successColor },
      { icon: '!', label: 'Soldats en alerte', value: report.summary.alertSoldiers, color: warningColor },
      { icon: '*', label: 'Objectifs completes', value: `${report.summary.completedObjectives}/${report.summary.totalObjectives}`, color: primaryColor }
    ];
    
    stats.forEach((stat, index) => {
      const x = margin + (index % 2) * (pageWidth - 2 * margin) / 2;
      const y = yPosition + Math.floor(index / 2) * 14;
      const maxLabelWidth = (pageWidth - 2 * margin) / 2 - 60;
      
      pdf.setTextColor(...stat.color);
      pdf.setFontSize(9);
      pdf.text(stat.icon, x, y);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'normal');
      const splitLabel = pdf.splitTextToSize(`${stat.label}: `, maxLabelWidth);
      pdf.text(splitLabel, x + 10, y);
      pdf.setFont('helvetica', 'bold');
      pdf.text(stat.value.toString(), x + 70, y);
    });
    
    yPosition += 30;
    
    // Description avec encadré
    if (yPosition > 190) {
      pdf.addPage();
      yPosition = 30;
    }
    
    yPosition = drawSection('>> DESCRIPTION DE LA MISSION', yPosition, 50);
    
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    const splitDescription = pdf.splitTextToSize(report.description, pageWidth - 2 * margin - 12);
    const descHeight = Math.max(20, splitDescription.length * 3 + 8);
    
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.5);
    pdf.rect(margin, yPosition, pageWidth - 2 * margin, descHeight);
    pdf.setFillColor(250, 250, 250);
    pdf.rect(margin, yPosition, pageWidth - 2 * margin, descHeight, 'F');
    
    pdf.text(splitDescription, margin + 5, yPosition + 6);
    
    yPosition += descHeight + 12;
    
    // Nouvelle page si nécessaire
    if (yPosition > 190) {
      pdf.addPage();
      yPosition = 30;
    }
    
    // Section Unités déployées
    yPosition = drawSection('>> UNITES DEPLOYEES', yPosition, 100);
    
    report.soldiers.forEach((soldier, index) => {
      if (yPosition > 235) {
        pdf.addPage();
        yPosition = 30;
      }
      
      // Encadré pour chaque soldat
      pdf.setDrawColor(220, 220, 220);
      pdf.setLineWidth(0.3);
      pdf.rect(margin, yPosition - 2, pageWidth - 2 * margin, 18);
      
      // Numéro avec cercle
      pdf.setFillColor(...primaryColor);
      pdf.circle(margin + 8, yPosition + 5, 3.5, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(7);
      pdf.setFont('helvetica', 'bold');
      pdf.text((index + 1).toString(), margin + 6.5, yPosition + 7);
      
      // Informations du soldat
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      const soldierName = pdf.splitTextToSize(`${soldier.id} - ${soldier.name}`, pageWidth - margin - 90);
      pdf.text(soldierName, margin + 18, yPosition + 3);
      
      // Badge de statut
      drawStatusBadge(soldier.status, pageWidth - margin - 40, yPosition + 5);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(6);
      const positionText = pdf.splitTextToSize(`+ Position: ${soldier.position}`, pageWidth - margin - 50);
      const contactText = pdf.splitTextToSize(`~ Dernier contact: ${soldier.lastContact}`, pageWidth - margin - 50);
      pdf.text(positionText, margin + 18, yPosition + 9);
      pdf.text(contactText, margin + 18, yPosition + 13);
      
      yPosition += 22;
    });
    
    // Section Objectifs
    if (yPosition > 170) {
      pdf.addPage();
      yPosition = 30;
    }
    
    yPosition = drawSection('>> OBJECTIFS DE MISSION', yPosition, 60);
    
    report.objectives.forEach((objective, index) => {
      if (yPosition > 240) {
        pdf.addPage();
        yPosition = 30;
      }
      
      const isCompleted = index < report.summary.completedObjectives;
      const statusIcon = isCompleted ? '[OK]' : '[--]';
      const statusColor = isCompleted ? successColor : warningColor;
      
      // Ligne avec icône de statut
      pdf.setTextColor(...statusColor);
      pdf.setFontSize(8);
      pdf.text(statusIcon, margin, yPosition);
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      const objectiveText = pdf.splitTextToSize(`${index + 1}. ${objective}`, pageWidth - 2 * margin - 60);
      pdf.text(objectiveText, margin + 12, yPosition);
      
      // Badge de statut
      const statusText = isCompleted ? 'COMPLETE' : 'EN COURS';
      drawStatusBadge(statusText, pageWidth - margin - 40, yPosition - 2);
      
      const lineHeight = Math.max(10, objectiveText.length * 3 + 2);
      yPosition += lineHeight;
    });
    
    // Section Équipement
    if (yPosition > 170) {
      pdf.addPage();
      yPosition = 30;
    }
    
    yPosition = drawSection('>> EQUIPEMENT DEPLOYE', yPosition, 60);
    
    report.equipment.forEach((item, index) => {
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 30;
      }
      
      // Puce avec icône
      pdf.setTextColor(...primaryColor);
      pdf.setFontSize(8);
      pdf.text('*', margin, yPosition);
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      const equipmentText = pdf.splitTextToSize(`${item}`, pageWidth - 2 * margin - 15);
      pdf.text(equipmentText, margin + 8, yPosition);
      
      const lineHeight = Math.max(8, equipmentText.length * 2.5 + 1);
      yPosition += lineHeight;
    });
    
    // Signature et validation
    yPosition += 15;
    if (yPosition > 220) {
      pdf.addPage();
      yPosition = 30;
    }
    
    // Encadré de signature
    pdf.setDrawColor(...primaryColor);
    pdf.setLineWidth(1);
    pdf.rect(margin, yPosition, pageWidth - 2 * margin, 30);
    pdf.setFillColor(248, 249, 250);
    pdf.rect(margin, yPosition, pageWidth - 2 * margin, 30, 'F');
    
    pdf.setTextColor(...primaryColor);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('VALIDATION ET SIGNATURE', margin + 5, yPosition + 8);
    
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.text(`Commandant: ${report.commander}`, margin + 5, yPosition + 16);
    pdf.text(`Date de génération: ${new Date().toLocaleString('fr-FR')}`, margin + 5, yPosition + 22);
    pdf.text('Signature: ________________________', pageWidth - margin - 80, yPosition + 22);
    
    // Pied de page amélioré sur toutes les pages
    const pageCount = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      
      // Ligne de séparation
      pdf.setDrawColor(...primaryColor);
      pdf.setLineWidth(0.5);
      pdf.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20);
      
      // Informations du pied de page
      pdf.setTextColor(...secondaryColor);
      pdf.setFontSize(7);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Page ${i}/${pageCount}`, pageWidth - margin, pageHeight - 12, { align: 'right' });
      pdf.text('[CONFIDENTIEL] - USAGE MILITAIRE UNIQUEMENT', margin, pageHeight - 12);
      pdf.text(`[DATE] Genere le: ${new Date().toLocaleString('fr-FR')}`, pageWidth / 2, pageHeight - 12, { align: 'center' });
    }
    
    // Téléchargement
    const fileName = `Rapport_Mission_${report.missionId}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
  };

  // Fonction pour terminer la mission
  const completeMission = () => {
    if (window.confirm('Êtes-vous sûr de vouloir marquer cette mission comme terminée ?')) {
      setMissionCompleted(true);
      // Ici vous pourriez ajouter la logique pour mettre à jour le statut dans votre base de données
      console.log(`Mission ${missionData.id} marquée comme terminée`);
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
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack} className="p-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="command-header text-xl">{missionData.name}</h2>
            <p className="text-sm text-muted-foreground">{missionData.id}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            onClick={downloadMissionReport}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Rapport PDF
          </Button>
          <Button 
            onClick={completeMission}
            disabled={missionCompleted || missionData.status === 'completed'}
            className="bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-400"
            size="sm"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            {missionCompleted || missionData.status === 'completed' ? 'Mission Terminée' : 'Terminer Mission'}
          </Button>
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