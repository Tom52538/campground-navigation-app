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
  const browserLang = navigator.language.toLowerCase();
  
  // Check for exact matches first
  if (browserLang.startsWith('de')) return 'de';
  if (browserLang.startsWith('fr')) return 'fr';
  if (browserLang.startsWith('nl')) return 'nl';
  if (browserLang.startsWith('it')) return 'it';
  if (browserLang.startsWith('es')) return 'es';
  
  // Default to English
  return 'en';
};

export const translations = {
  en: {
    navigation: {
      search: 'Find campsites, trails, amenities...',
      kamperland: 'Kamperland',
      zuhause: 'Zuhause',
      clearPOIs: 'Clear POIs',
      filter: 'Filter',
      map: 'Map',
      navigation: 'Navigation',
      settings: 'Settings'
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
      settings: 'Einstellungen'
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
      search: 'Trouver campings, sentiers, équipements...',
      kamperland: 'Kamperland',
      zuhause: 'Zuhause',
      clearPOIs: 'Effacer POIs',
      filter: 'Filtrer',
      map: 'Carte',
      navigation: 'Navigation',
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
      alerts: 'alerte',
      alertsPlural: 'alertes'
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
      search: 'Campings, paden, voorzieningen zoeken...',
      kamperland: 'Kamperland',
      zuhause: 'Zuhause',
      clearPOIs: 'POIs wissen',
      filter: 'Filter',
      map: 'Kaart',
      navigation: 'Navigatie',
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
      alerts: 'waarschuwing',
      alertsPlural: 'waarschuwingen'
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