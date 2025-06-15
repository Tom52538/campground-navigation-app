export type SupportedLanguage = 'en' | 'de' | 'fr' | 'nl' | 'it' | 'es';

export const SUPPORTED_LANGUAGES: Record<SupportedLanguage, string> = {
  en: 'English',
  de: 'Deutsch',
  fr: 'Français', 
  nl: 'Nederlands',
  it: 'Italiano',
  es: 'Español'
};

export const detectBrowserLanguage = (): SupportedLanguage => {
  // Check multiple language sources for better detection
  const languages = [
    navigator.language,
    ...navigator.languages,
    (navigator as any).userLanguage,
    (navigator as any).browserLanguage,
    (navigator as any).systemLanguage
  ].filter(Boolean);

  console.log('Detected languages:', languages);
  
  for (const lang of languages) {
    const lowerLang = lang.toLowerCase();
    
    // Check for German variants
    if (lowerLang.startsWith('de') || lowerLang.includes('german')) {
      console.log('German detected:', lang);
      return 'de';
    }
    if (lowerLang.startsWith('fr') || lowerLang.includes('french')) return 'fr';
    if (lowerLang.startsWith('nl') || lowerLang.includes('dutch')) return 'nl';
    if (lowerLang.startsWith('it') || lowerLang.includes('italian')) return 'it';
    if (lowerLang.startsWith('es') || lowerLang.includes('spanish')) return 'es';
  }
  
  // Default to English
  console.log('Defaulting to English');
  return 'en';
};

// Voice guidance translations for navigation instructions
export const voiceInstructions = {
  en: {
    turnLeft: 'Turn left',
    turnRight: 'Turn right',
    turnSlightLeft: 'Turn slight left',
    turnSlightRight: 'Turn slight right',
    turnSharpLeft: 'Turn sharp left',
    turnSharpRight: 'Turn sharp right',
    continueAhead: 'Continue ahead',
    continueStraight: 'Continue straight',
    keepLeft: 'Keep left',
    keepRight: 'Keep right',
    headNorth: 'Head north',
    headSouth: 'Head south',
    headEast: 'Head east',
    headWest: 'Head west',
    headNortheast: 'Head northeast',
    headNorthwest: 'Head northwest',
    headSoutheast: 'Head southeast',
    headSouthwest: 'Head southwest',
    arrive: 'Arrive at your destination',
    inMeters: 'In {distance} meters',
    inKilometers: 'In {distance} kilometers',
    voiceEnabled: 'Voice navigation enabled',
    routeRecalculated: 'Route recalculated',
    offRoute: 'You are off route',
    rerouting: 'Recalculating route',
    destinationReached: 'You have arrived at your destination'
  },
  de: {
    turnLeft: 'Links abbiegen',
    turnRight: 'Rechts abbiegen',
    turnSlightLeft: 'Leicht links abbiegen',
    turnSlightRight: 'Leicht rechts abbiegen',
    turnSharpLeft: 'Scharf links abbiegen',
    turnSharpRight: 'Scharf rechts abbiegen',
    continueAhead: 'Geradeaus weiterfahren',
    continueStraight: 'Geradeaus weiterfahren',
    keepLeft: 'Links halten',
    keepRight: 'Rechts halten',
    headNorth: 'Richtung Norden',
    headSouth: 'Richtung Süden',
    headEast: 'Richtung Osten',
    headWest: 'Richtung Westen',
    headNortheast: 'Richtung Nordosten',
    headNorthwest: 'Richtung Nordwesten',
    headSoutheast: 'Richtung Südosten',
    headSouthwest: 'Richtung Südwesten',
    arrive: 'Sie haben Ihr Ziel erreicht',
    inMeters: 'In {distance} Metern',
    inKilometers: 'In {distance} Kilometern',
    voiceEnabled: 'Sprachnavigation aktiviert',
    routeRecalculated: 'Route neu berechnet',
    offRoute: 'Sie sind von der Route abgewichen',
    rerouting: 'Route wird neu berechnet',
    destinationReached: 'Sie haben Ihr Ziel erreicht'
  },
  fr: {
    turnLeft: 'Tournez à gauche',
    turnRight: 'Tournez à droite',
    turnSlightLeft: 'Tournez légèrement à gauche',
    turnSlightRight: 'Tournez légèrement à droite',
    turnSharpLeft: 'Tournez nettement à gauche',
    turnSharpRight: 'Tournez nettement à droite',
    continueAhead: 'Continuez tout droit',
    continueStraight: 'Continuez tout droit',
    keepLeft: 'Restez à gauche',
    keepRight: 'Restez à droite',
    headNorth: 'Direction nord',
    headSouth: 'Direction sud',
    headEast: 'Direction est',
    headWest: 'Direction ouest',
    headNortheast: 'Direction nord-est',
    headNorthwest: 'Direction nord-ouest',
    headSoutheast: 'Direction sud-est',
    headSouthwest: 'Direction sud-ouest',
    arrive: 'Vous êtes arrivé à destination',
    inMeters: 'Dans {distance} mètres',
    inKilometers: 'Dans {distance} kilomètres',
    voiceEnabled: 'Navigation vocale activée',
    routeRecalculated: 'Itinéraire recalculé',
    offRoute: 'Vous avez dévié de l\'itinéraire',
    rerouting: 'Recalcul de l\'itinéraire',
    destinationReached: 'Vous êtes arrivé à destination'
  },
  nl: {
    turnLeft: 'Ga linksaf',
    turnRight: 'Ga rechtsaf',
    turnSlightLeft: 'Ga licht linksaf',
    turnSlightRight: 'Ga licht rechtsaf',
    turnSharpLeft: 'Ga scherp linksaf',
    turnSharpRight: 'Ga scherp rechtsaf',
    continueAhead: 'Ga rechtdoor',
    continueStraight: 'Ga rechtdoor',
    keepLeft: 'Blijf links',
    keepRight: 'Blijf rechts',
    headNorth: 'Richting het noorden',
    headSouth: 'Richting het zuiden',
    headEast: 'Richting het oosten',
    headWest: 'Richting het westen',
    headNortheast: 'Richting het noordoosten',
    headNorthwest: 'Richting het noordwesten',
    headSoutheast: 'Richting het zuidoosten',
    headSouthwest: 'Richting het zuidwesten',
    arrive: 'U bent aangekomen op uw bestemming',
    inMeters: 'Over {distance} meter',
    inKilometers: 'Over {distance} kilometer',
    voiceEnabled: 'Spraaknavigatie ingeschakeld',
    routeRecalculated: 'Route herberekend',
    offRoute: 'U bent van de route afgeweken',
    rerouting: 'Route wordt herberekend',
    destinationReached: 'U bent aangekomen op uw bestemming'
  },
  it: {
    turnLeft: 'Gira a sinistra',
    turnRight: 'Gira a destra',
    turnSlightLeft: 'Gira leggermente a sinistra',
    turnSlightRight: 'Gira leggermente a destra',
    turnSharpLeft: 'Gira decisamente a sinistra',
    turnSharpRight: 'Gira decisamente a destra',
    continueAhead: 'Continua dritto',
    continueStraight: 'Continua dritto',
    keepLeft: 'Mantieni la sinistra',
    keepRight: 'Mantieni la destra',
    headNorth: 'Direzione nord',
    headSouth: 'Direzione sud',
    headEast: 'Direzione est',
    headWest: 'Direzione ovest',
    headNortheast: 'Direzione nord-est',
    headNorthwest: 'Direzione nord-ovest',
    headSoutheast: 'Direzione sud-est',
    headSouthwest: 'Direzione sud-ovest',
    arrive: 'Sei arrivato a destinazione',
    inMeters: 'Tra {distance} metri',
    inKilometers: 'Tra {distance} chilometri',
    voiceEnabled: 'Navigazione vocale attivata',
    routeRecalculated: 'Percorso ricalcolato',
    offRoute: 'Sei fuori percorso',
    rerouting: 'Ricalcolo del percorso',
    destinationReached: 'Sei arrivato a destinazione'
  },
  es: {
    turnLeft: 'Gira a la izquierda',
    turnRight: 'Gira a la derecha',
    turnSlightLeft: 'Gira ligeramente a la izquierda',
    turnSlightRight: 'Gira ligeramente a la derecha',
    turnSharpLeft: 'Gira bruscamente a la izquierda',
    turnSharpRight: 'Gira bruscamente a la derecha',
    continueAhead: 'Continúa recto',
    continueStraight: 'Continúa recto',
    keepLeft: 'Mantente a la izquierda',
    keepRight: 'Mantente a la derecha',
    headNorth: 'Dirección norte',
    headSouth: 'Dirección sur',
    headEast: 'Dirección este',
    headWest: 'Dirección oeste',
    headNortheast: 'Dirección noreste',
    headNorthwest: 'Dirección noroeste',
    headSoutheast: 'Dirección sureste',
    headSouthwest: 'Dirección suroeste',
    arrive: 'Has llegado a tu destino',
    inMeters: 'En {distance} metros',
    inKilometers: 'En {distance} kilómetros',
    voiceEnabled: 'Navegación por voz activada',
    routeRecalculated: 'Ruta recalculada',
    offRoute: 'Te has desviado de la ruta',
    rerouting: 'Recalculando ruta',
    destinationReached: 'Has llegado a tu destino'
  }
};

export const translations = {
  en: {
    navigation: {
      search: 'Search',
      kamperland: 'Kamperland',
      zuhause: 'Zuhause',
      clearPOIs: 'Clear POIs',
      filter: 'Filter',
      map: 'Map',
      navigate: 'Navigation',
      settings: 'Settings',
      startNavigation: 'Start Navigation',
      endNavigation: 'End Navigation',
      voiceOn: 'Voice On',
      voiceOff: 'Voice Off',
      rerouting: 'Rerouting...',
      offRoute: 'Off Route',
      complete: 'complete',
      eta: 'ETA',
      next: 'Next',
      speed: 'Speed',
      avg: 'Avg'
    },
    categories: {
      'campsites': 'Campsites',
      'restrooms': 'Restrooms', 
      'fire-pits': 'Fire Pits',
      'trails': 'Trails',
      'services': 'Services',
      'waste': 'Waste Disposal'
    },
    weather: {
      condition: 'Condition',
      humidity: 'Humidity',
      windSpeed: 'Wind Speed',
      loading: 'Loading weather...',
      conditions: {
        'Clear': 'Clear',
        'Clouds': 'Clouds',
        'Rain': 'Rain',
        'Snow': 'Snow',
        'Thunderstorm': 'Thunderstorm',
        'Drizzle': 'Drizzle',
        'Mist': 'Mist',
        'Fog': 'Fog',
        'Haze': 'Haze'
      },
      alerts: {
        cold: 'Cold weather - check gear',
        rain: 'Rain expected - secure equipment',
        wind: 'High winds - secure tents',
        heat: 'Hot weather - stay hydrated',
        coldTitle: 'Cold Weather Alert',
        rainTitle: 'Rain Expected',
        windTitle: 'High Wind Alert',
        heatTitle: 'High Temperature Alert'
      }
    },
    search: {
      placeholder: 'Search facilities, restaurants, activities...'
    },
    poi: {
      navigate: 'Navigate',
      close: 'Close',
      distance: 'Distance',
      category: 'Category'
    },
    status: {
      loading: 'Loading campground map...',
      gpsAccuracy: 'GPS Accuracy',
      simulatedGPS: 'Simulated GPS',
      realGPS: 'Real GPS'
    },
    alerts: {
      siteChanged: 'Site Changed',
      siteSwitched: 'Switched to',
      poisCleared: 'POIs Cleared',
      poisHidden: 'All POI markers have been hidden',
      routeStarted: 'Navigation Started',
      routeEnded: 'Navigation Ended'
    }
  },
  de: {
    navigation: {
      search: 'Suchen',
      kamperland: 'Kamperland',
      zuhause: 'Zuhause',
      clearPOIs: 'POIs löschen',
      filter: 'Filter',
      map: 'Karte',
      navigate: 'Navigation',
      settings: 'Einstellungen',
      startNavigation: 'Navigation starten',
      endNavigation: 'Navigation beenden',
      voiceOn: 'Sprache ein',
      voiceOff: 'Sprache aus',
      rerouting: 'Neuberechnung...',
      offRoute: 'Abseits der Route',
      complete: 'abgeschlossen',
      eta: 'Ankunft',
      next: 'Nächste',
      speed: 'Geschwindigkeit',
      avg: 'Durchschn.',
      distance: 'Entfernung',
      duration: 'Dauer',
      approaching: 'Abbiegen in',
      meters: 'm',
      minutes: 'Min',
      headNorthOn: 'Richtung Norden auf',
      headSouthOn: 'Richtung Süden auf',
      headEastOn: 'Richtung Osten auf',
      headWestOn: 'Richtung Westen auf',
      turnLeftOn: 'Links abbiegen auf',
      turnRightOn: 'Rechts abbiegen auf',
      continueOn: 'Weiter auf',
      end: 'Beenden'
    },
    categories: {
      'campsites': 'Campingplätze',
      'restrooms': 'Sanitäranlagen',
      'fire-pits': 'Feuerstellen',
      'trails': 'Wanderwege',
      'services': 'Dienstleistungen',
      'waste': 'Abfallentsorgung'
    },
    weather: {
      condition: 'Bedingung',
      humidity: 'Luftfeuchtigkeit',
      windSpeed: 'Windgeschwindigkeit',
      loading: 'Wetter wird geladen...',
      conditions: {
        'Clear': 'Klar',
        'Clouds': 'Wolken',
        'Rain': 'Regen',
        'Snow': 'Schnee',
        'Thunderstorm': 'Gewitter',
        'Drizzle': 'Nieselregen',
        'Mist': 'Nebel',
        'Fog': 'Nebel',
        'Haze': 'Dunst'
      },
      alerts: {
        cold: 'Kaltes Wetter - Ausrüstung prüfen',
        rain: 'Regen erwartet - Ausrüstung sichern',
        wind: 'Starke Winde - Zelte sichern',
        heat: 'Heißes Wetter - viel trinken',
        coldTitle: 'Kältealarm',
        rainTitle: 'Regen erwartet',
        windTitle: 'Starker Wind',
        heatTitle: 'Hitzewarnung'
      }
    },
    search: {
      placeholder: 'Einrichtungen, Restaurants, Aktivitäten suchen...'
    },
    poi: {
      navigate: 'Navigieren',
      close: 'Schließen',
      distance: 'Entfernung',
      category: 'Kategorie'
    },
    status: {
      loading: 'Campingplatz-Karte wird geladen...',
      gpsAccuracy: 'GPS-Genauigkeit',
      simulatedGPS: 'Simuliertes GPS',
      realGPS: 'Echtes GPS'
    },
    alerts: {
      siteChanged: 'Standort geändert',
      siteSwitched: 'Gewechselt zu',
      poisCleared: 'POIs gelöscht',
      poisHidden: 'Alle POI-Markierungen wurden ausgeblendet',
      routeStarted: 'Navigation gestartet',
      routeEnded: 'Navigation beendet'
    }
  },
  fr: {
    navigation: {
      search: 'Rechercher',
      kamperland: 'Kamperland',
      zuhause: 'Zuhause',
      clearPOIs: 'Effacer POIs',
      filter: 'Filtrer',
      map: 'Carte',
      navigate: 'Navigation',
      settings: 'Paramètres'
    },
    categories: {
      'campsites': 'Campings',
      'restrooms': 'Sanitaires',
      'fire-pits': 'Foyers',
      'trails': 'Sentiers',
      'services': 'Services',
      'waste': 'Déchets'
    },
    weather: {
      condition: 'Condition',
      humidity: 'Humidité',
      windSpeed: 'Vitesse du vent',
      loading: 'Chargement météo...',
      alerts: {
        cold: 'Temps froid - vérifier équipement',
        rain: 'Pluie attendue - sécuriser équipement',
        wind: 'Vents forts - sécuriser tentes',
        heat: 'Temps chaud - rester hydraté',
        coldTitle: 'Alerte froid',
        rainTitle: 'Pluie attendue',
        windTitle: 'Vents forts',
        heatTitle: 'Alerte chaleur'
      }
    },
    search: {
      placeholder: 'Rechercher installations, restaurants, activités...'
    },
    poi: {
      navigate: 'Naviguer',
      close: 'Fermer',
      distance: 'Distance',
      category: 'Catégorie'
    },
    status: {
      loading: 'Chargement de la carte du camping...',
      gpsAccuracy: 'Précision GPS',
      simulatedGPS: 'GPS simulé',
      realGPS: 'GPS réel'
    },
    alerts: {
      siteChanged: 'Site changé',
      siteSwitched: 'Basculé vers',
      poisCleared: 'POIs effacés',
      poisHidden: 'Tous les marqueurs POI ont été masqués',
      routeStarted: 'Navigation démarrée',
      routeEnded: 'Navigation terminée'
    }
  },
  nl: {
    navigation: {
      search: 'Zoeken',
      kamperland: 'Kamperland',
      zuhause: 'Zuhause',
      clearPOIs: 'POIs wissen',
      filter: 'Filter',
      map: 'Kaart',
      navigate: 'Navigatie',
      settings: 'Instellingen'
    },
    categories: {
      'campsites': 'Campings',
      'restrooms': 'Sanitair',
      'fire-pits': 'Vuurplaatsen',
      'trails': 'Wandelpaden',
      'services': 'Diensten',
      'waste': 'Afvalverwijdering'
    },
    weather: {
      condition: 'Conditie',
      humidity: 'Luchtvochtigheid',
      windSpeed: 'Windsnelheid',
      loading: 'Weer laden...',
      alerts: {
        cold: 'Koud weer - uitrusting controleren',
        rain: 'Regen verwacht - spullen vastzetten',
        wind: 'Harde wind - tenten beveiligen',
        heat: 'Heet weer - gehydrateerd blijven',
        coldTitle: 'Koudewaarschuwing',
        rainTitle: 'Regen verwacht',
        windTitle: 'Harde wind',
        heatTitle: 'Hittewaarschuwing'
      }
    },
    search: {
      placeholder: 'Zoek faciliteiten, restaurants, activiteiten...'
    },
    poi: {
      navigate: 'Navigeren',
      close: 'Sluiten',
      distance: 'Afstand',
      category: 'Categorie'
    },
    status: {
      loading: 'Campingkaart laden...',
      gpsAccuracy: 'GPS-nauwkeurigheid',
      simulatedGPS: 'Gesimuleerde GPS',
      realGPS: 'Echte GPS'
    },
    alerts: {
      siteChanged: 'Locatie gewijzigd',
      siteSwitched: 'Overgeschakeld naar',
      poisCleared: 'POIs gewist',
      poisHidden: 'Alle POI-markeringen zijn verborgen',
      routeStarted: 'Navigatie gestart',
      routeEnded: 'Navigatie beëindigd'
    }
  },
  it: {
    navigation: {
      search: 'Trova campeggi, sentieri, servizi...',
      kamperland: 'Kamperland',
      zuhause: 'Zuhause',
      clearPOIs: 'Cancella POI',
      filter: 'Filtro',
      map: 'Mappa',
      navigation: 'Navigazione',
      settings: 'Impostazioni'
    },
    categories: {
      'campsites': 'Campeggi',
      'restrooms': 'Servizi igienici',
      'fire-pits': 'Focolari',
      'trails': 'Sentieri',
      'services': 'Servizi',
      'waste': 'Smaltimento rifiuti'
    },
    weather: {
      condition: 'Condizione',
      humidity: 'Umidità',
      windSpeed: 'Velocità del vento',
      alerts: 'avviso',
      alertsPlural: 'avvisi'
    },
    poi: {
      navigate: 'Naviga',
      close: 'Chiudi',
      distance: 'Distanza',
      category: 'Categoria'
    },
    status: {
      loading: 'Caricamento mappa campeggio...',
      gpsAccuracy: 'Precisione GPS',
      simulatedGPS: 'GPS simulato',
      realGPS: 'GPS reale'
    },
    alerts: {
      siteChanged: 'Sito cambiato',
      siteSwitched: 'Passato a',
      poisCleared: 'POI cancellati',
      poisHidden: 'Tutti i marcatori POI sono stati nascosti',
      routeStarted: 'Navigazione avviata',
      routeEnded: 'Navigazione terminata'
    }
  },
  es: {
    navigation: {
      search: 'Buscar campings, senderos, servicios...',
      kamperland: 'Kamperland',
      zuhause: 'Zuhause',
      clearPOIs: 'Limpiar POIs',
      filter: 'Filtro',
      map: 'Mapa',
      navigation: 'Navegación',
      settings: 'Ajustes'
    },
    categories: {
      'campsites': 'Campings',
      'restrooms': 'Aseos',
      'fire-pits': 'Fogatas',
      'trails': 'Senderos',
      'services': 'Servicios',
      'waste': 'Eliminación de residuos'
    },
    weather: {
      condition: 'Condición',
      humidity: 'Humedad',
      windSpeed: 'Velocidad del viento',
      alerts: 'alerta',
      alertsPlural: 'alertas'
    },
    poi: {
      navigate: 'Navegar',
      close: 'Cerrar',
      distance: 'Distancia',
      category: 'Categoría'
    },
    status: {
      loading: 'Cargando mapa del camping...',
      gpsAccuracy: 'Precisión GPS',
      simulatedGPS: 'GPS simulado',
      realGPS: 'GPS real'
    },
    alerts: {
      siteChanged: 'Sitio cambiado',
      siteSwitched: 'Cambiado a',
      poisCleared: 'POIs limpiados',
      poisHidden: 'Todos los marcadores POI han sido ocultados',
      routeStarted: 'Navegación iniciada',
      routeEnded: 'Navegación terminada'
    }
  }
};

export const getTranslation = (lang: SupportedLanguage, key: string): string => {
  const keys = key.split('.');
  let current: any = translations[lang];
  
  for (const k of keys) {
    if (current && typeof current === 'object' && k in current) {
      current = current[k];
    } else {
      // Fallback to English
      current = translations.en;
      for (const fallbackKey of keys) {
        if (current && typeof current === 'object' && fallbackKey in current) {
          current = current[fallbackKey];
        } else {
          return key; // Return key if translation not found
        }
      }
      break;
    }
  }
  
  return typeof current === 'string' ? current : key;
};

// Function to translate routing instructions from English to German
export const translateInstruction = (instruction: string, lang: SupportedLanguage): string => {
  if (lang === 'en') return instruction;
  
  const lowerInstruction = instruction.toLowerCase();
  
  // German translation mappings
  const translations: Record<string, string> = {
    'head north': 'Richtung Norden',
    'head south': 'Richtung Süden', 
    'head east': 'Richtung Osten',
    'head west': 'Richtung Westen',
    'turn left': 'Links abbiegen',
    'turn right': 'Rechts abbiegen',
    'continue straight': 'Geradeaus weiter',
    'arrive at': 'Ankunft bei',
    'distance:': 'Entfernung:',
    'duration:': 'Dauer:',
    'approaching turn in': 'Abbiegen in',
    'next:': 'Nächste:',
    ' on ': ' auf '
  };
  
  let translatedInstruction = instruction;
  
  for (const [english, german] of Object.entries(translations)) {
    const regex = new RegExp(english, 'gi');
    translatedInstruction = translatedInstruction.replace(regex, german);
  }
  
  return translatedInstruction;
};