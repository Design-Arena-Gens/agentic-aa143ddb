import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const mockProspects = [
  {
    id: '1',
    name: 'Jean Dupont',
    number: '+33612345678',
    stage: 'qualified',
    score: 85,
    lastMessage: 'Intéressé par une solution CRM, budget 5K€',
    timestamp: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Marie Martin',
    number: '+33623456789',
    stage: 'closed',
    score: 95,
    lastMessage: 'Deal fermé - Contrat signé pour 10K€',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: '3',
    name: 'Pierre Dubois',
    number: '+33634567890',
    stage: 'in_progress',
    score: 60,
    lastMessage: 'Besoin de plus d\'informations sur les fonctionnalités',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
  },
];

export async function GET() {
  const stats = {
    total: mockProspects.length,
    qualified: mockProspects.filter(p => p.stage === 'qualified').length,
    closed: mockProspects.filter(p => p.stage === 'closed').length,
    inProgress: mockProspects.filter(p => p.stage === 'in_progress').length,
  };

  return NextResponse.json({
    prospects: mockProspects,
    stats
  });
}
