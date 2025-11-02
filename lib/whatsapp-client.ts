interface Message {
  from: string;
  body: string;
  timestamp: number;
}

interface Prospect {
  id: string;
  name?: string;
  number: string;
  stage: 'new' | 'in_progress' | 'qualified' | 'closed';
  score: number;
  messages: Message[];
  lastMessage: string;
  timestamp: string;
}

class WhatsAppAIAgent {
  private prospects: Map<string, Prospect> = new Map();

  async analyzeMessage(from: string, message: string): Promise<string> {
    const lowerMessage = message.toLowerCase();

    let prospect = this.prospects.get(from);
    if (!prospect) {
      prospect = {
        id: from,
        number: from,
        stage: 'new',
        score: 0,
        messages: [],
        lastMessage: message,
        timestamp: new Date().toISOString()
      };
      this.prospects.set(from, prospect);
    }

    prospect.messages.push({
      from,
      body: message,
      timestamp: Date.now()
    });

    let response = '';
    let scoreIncrease = 0;

    if (prospect.stage === 'new') {
      response = `Bonjour ! 👋 Je suis l'assistant IA. Ravi de faire votre connaissance ! Pour mieux vous aider, pourriez-vous me parler de votre projet ou de vos besoins actuels ?`;
      prospect.stage = 'in_progress';
      scoreIncrease = 10;
    }
    else if (prospect.stage === 'in_progress') {
      if (lowerMessage.includes('budget') || lowerMessage.includes('prix') || lowerMessage.includes('coût')) {
        response = `Merci pour ces informations ! 💰 Pour vous proposer la meilleure solution, quel budget avez-vous prévu pour ce projet ? Cela m'aidera à vous orienter vers l'offre la plus adaptée.`;
        scoreIncrease = 20;
      }
      else if (lowerMessage.match(/\d+k|\d+\s*000|€|\$/)) {
        response = `Parfait ! Je vois que vous avez un budget défini. 📊 Quand souhaiteriez-vous démarrer ce projet ? Avez-vous une date ou une période en tête ?`;
        scoreIncrease = 25;
        prospect.stage = 'qualified';
      }
      else if (lowerMessage.includes('urgent') || lowerMessage.includes('rapidement') || lowerMessage.includes('vite')) {
        response = `Je comprends l'urgence ! ⚡ Nous pouvons démarrer rapidement. Avez-vous déjà une idée du budget que vous souhaitez allouer à ce projet ?`;
        scoreIncrease = 20;
      }
      else {
        response = `Intéressant ! 🎯 Pour que je puisse vous proposer une solution sur mesure, pourriez-vous m'en dire plus sur : 1) Vos objectifs principaux 2) Votre budget approximatif 3) Votre timeline souhaitée ?`;
        scoreIncrease = 15;
      }
    }
    else if (prospect.stage === 'qualified') {
      if (lowerMessage.includes('oui') || lowerMessage.includes('d\'accord') || lowerMessage.includes('ok')) {
        response = `Excellent ! 🎉 Je prépare une proposition personnalisée pour vous. Nous allons pouvoir avancer rapidement sur votre projet. Quel est le meilleur moment pour vous rappeler et finaliser les détails ?`;
        prospect.stage = 'closed';
        scoreIncrease = 30;
      }
      else if (lowerMessage.includes('non') || lowerMessage.includes('pas intéressé')) {
        response = `Je comprends. Pas de souci ! 😊 Si vous changez d'avis ou avez des questions, n'hésitez pas à me recontacter. Je reste disponible pour vous aider.`;
        scoreIncrease = -20;
      }
      else {
        response = `Basé sur vos besoins, je vous propose une solution qui correspond parfaitement à vos critères. 🚀 Elle inclut : ✅ Tout ce dont vous avez besoin ✅ Un accompagnement personnalisé ✅ Un démarrage rapide. Souhaitez-vous que je vous envoie une proposition détaillée ?`;
        scoreIncrease = 10;
      }
    }
    else if (prospect.stage === 'closed') {
      response = `Merci pour votre confiance ! 🙏 Notre équipe va vous recontacter très prochainement pour finaliser tous les détails. Y a-t-il autre chose que je puisse faire pour vous aujourd'hui ?`;
    }

    prospect.score = Math.min(100, Math.max(0, prospect.score + scoreIncrease));
    prospect.lastMessage = message;
    prospect.timestamp = new Date().toISOString();

    return response;
  }

  getProspects(): Prospect[] {
    return Array.from(this.prospects.values());
  }

  getStats() {
    const prospects = this.getProspects();
    return {
      total: prospects.length,
      qualified: prospects.filter(p => p.stage === 'qualified').length,
      closed: prospects.filter(p => p.stage === 'closed').length,
      inProgress: prospects.filter(p => p.stage === 'in_progress').length,
    };
  }
}

export const aiAgent = new WhatsAppAIAgent();
