"use client";

import { useState, useEffect } from 'react';

export default function Home() {
  const [qrCode, setQrCode] = useState<string>('');
  const [status, setStatus] = useState<string>('Initialisation...');
  const [isConnected, setIsConnected] = useState(false);
  const [prospects, setProspects] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    qualified: 0,
    closed: 0,
    inProgress: 0
  });

  useEffect(() => {
    const initWhatsApp = async () => {
      try {
        const response = await fetch('/api/whatsapp/init', { method: 'POST' });
        const data = await response.json();

        if (data.qr) {
          setQrCode(data.qr);
          setStatus('Scannez le QR code avec WhatsApp');
        } else if (data.status === 'ready') {
          setIsConnected(true);
          setStatus('Connecté à WhatsApp');
        }
      } catch (error) {
        setStatus('Erreur d\'initialisation');
      }
    };

    initWhatsApp();

    const statusInterval = setInterval(async () => {
      try {
        const response = await fetch('/api/whatsapp/status');
        const data = await response.json();

        if (data.connected) {
          setIsConnected(true);
          setStatus('Connecté - Agent IA actif');
          setQrCode('');
        }
      } catch (error) {
        console.error('Status check error:', error);
      }
    }, 3000);

    const prospectsInterval = setInterval(async () => {
      if (isConnected) {
        try {
          const response = await fetch('/api/prospects');
          const data = await response.json();
          setProspects(data.prospects || []);
          setStats(data.stats || stats);
        } catch (error) {
          console.error('Prospects fetch error:', error);
        }
      }
    }, 5000);

    return () => {
      clearInterval(statusInterval);
      clearInterval(prospectsInterval);
    };
  }, [isConnected]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🤖 Agent IA WhatsApp
          </h1>
          <p className="text-xl text-gray-600">
            Qualification automatique et closing de prospects
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-700">Total Prospects</h3>
              <span className="text-3xl">👥</span>
            </div>
            <p className="text-4xl font-bold text-blue-600">{stats.total}</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-700">Qualifiés</h3>
              <span className="text-3xl">✅</span>
            </div>
            <p className="text-4xl font-bold text-green-600">{stats.qualified}</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-700">Closés</h3>
              <span className="text-3xl">🎯</span>
            </div>
            <p className="text-4xl font-bold text-purple-600">{stats.closed}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Statut de connexion
            </h2>

            <div className="flex items-center gap-3 mb-6">
              <div className={`w-4 h-4 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`}></div>
              <span className="text-lg font-medium text-gray-700">{status}</span>
            </div>

            {qrCode && !isConnected && (
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-sm text-gray-600 mb-4">
                  1. Ouvrez WhatsApp sur votre téléphone<br/>
                  2. Allez dans Paramètres → Appareils connectés<br/>
                  3. Scannez ce QR code
                </p>
                <div className="bg-white p-4 rounded-lg inline-block">
                  <img src={qrCode} alt="QR Code WhatsApp" className="w-64 h-64" />
                </div>
              </div>
            )}

            {isConnected && (
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <p className="text-green-800">
                  ✅ L'agent IA est actif et prêt à qualifier vos prospects !
                </p>
                <p className="text-sm text-green-700 mt-2">
                  Les conversations seront automatiquement analysées et les prospects qualifiés.
                </p>
              </div>
            )}
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Derniers prospects
            </h2>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {prospects.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  En attente de conversations...
                </p>
              ) : (
                prospects.slice(0, 10).map((prospect, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-800">
                        {prospect.name || prospect.number}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        prospect.stage === 'closed' ? 'bg-purple-100 text-purple-700' :
                        prospect.stage === 'qualified' ? 'bg-green-100 text-green-700' :
                        prospect.stage === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {prospect.stage === 'closed' ? '🎯 Closé' :
                         prospect.stage === 'qualified' ? '✅ Qualifié' :
                         prospect.stage === 'in_progress' ? '⏳ En cours' :
                         '📝 Nouveau'}
                      </span>
                    </div>
                    {prospect.score && (
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm text-gray-600">Score:</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${prospect.score}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-700">{prospect.score}%</span>
                      </div>
                    )}
                    <p className="text-sm text-gray-600">
                      {prospect.lastMessage || 'Conversation en cours...'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(prospect.timestamp).toLocaleString('fr-FR')}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white p-8 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            🎯 Fonctionnalités de l'Agent IA
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🤖</span>
              <div>
                <h3 className="font-semibold text-gray-800">Qualification automatique</h3>
                <p className="text-sm text-gray-600">Analyse des besoins, budget et timing</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">💬</span>
              <div>
                <h3 className="font-semibold text-gray-800">Réponses intelligentes</h3>
                <p className="text-sm text-gray-600">Conversations naturelles et contextuelles</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">📊</span>
              <div>
                <h3 className="font-semibold text-gray-800">Scoring des prospects</h3>
                <p className="text-sm text-gray-600">Évaluation automatique du potentiel</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <h3 className="font-semibold text-gray-800">Closing automatisé</h3>
                <p className="text-sm text-gray-600">Propositions personnalisées et suivi</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
