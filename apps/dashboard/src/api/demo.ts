type DemoUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  _count: { trips: number; vehicles: number };
};

type DemoTrip = {
  id: string;
  startedAt: string;
  endedAt: string;
  distanceKm: number;
  durationSeconds: number;
  averageSpeedKmh: number;
  maxSpeedKmh: number;
  score: number;
  status: string;
  mode: string;
  user: { id: string; name: string; email: string };
  vehicle?: { id: string; plateNumber: string; vehicleType: string };
  _count: { events: number; points: number };
  fraud: { status: 'NORMAL' | 'SUSPICIOUS' | 'INVALID'; flags: { reason: string; detail: string }[] };
};

type DemoPoint = {
  latitude: number;
  longitude: number;
  gpsSpeedKmh: number;
  timestamp: string;
};

type DemoEvent = {
  id: string;
  tripId: string;
  type: string;
  severity: string;
  timestamp: string;
  value?: number;
  latitude?: number;
  longitude?: number;
  metadata: string;
};

const adminUser = {
  id: 'demo-admin',
  name: 'Admin DriveWise',
  email: 'admin@drivewise.si',
  role: 'ADMIN',
};

const driverUser = {
  id: 'demo-driver',
  name: 'Demo Voznik',
  email: 'voznik@drivewise.si',
  role: 'DRIVER',
};

const users: DemoUser[] = [
  {
    ...adminUser,
    createdAt: '2026-06-26T08:12:00.000Z',
    _count: { trips: 0, vehicles: 0 },
  },
  {
    ...driverUser,
    createdAt: '2026-06-27T11:40:00.000Z',
    _count: { trips: 5, vehicles: 1 },
  },
  {
    id: 'demo-family',
    name: 'Maja Novak',
    email: 'maja.novak@example.local',
    role: 'DRIVER',
    createdAt: '2026-07-01T15:05:00.000Z',
    _count: { trips: 2, vehicles: 1 },
  },
];

let trips: DemoTrip[] = [
  {
    id: 'demo-trip-safe-city',
    startedAt: '2026-07-07T06:25:00.000Z',
    endedAt: '2026-07-07T06:47:00.000Z',
    distanceKm: 12.4,
    durationSeconds: 1320,
    averageSpeedKmh: 33,
    maxSpeedKmh: 61,
    score: 96,
    status: 'COMPLETED',
    mode: 'GENERATED_SIMULATION',
    user: driverUser,
    vehicle: { id: 'seed-vehicle-1', plateNumber: 'MS AB-123', vehicleType: 'CAR' },
    _count: { events: 0, points: 28 },
    fraud: { status: 'NORMAL', flags: [] },
  },
  {
    id: 'demo-trip-highway',
    startedAt: '2026-07-06T16:12:00.000Z',
    endedAt: '2026-07-06T16:49:00.000Z',
    distanceKm: 42.8,
    durationSeconds: 2220,
    averageSpeedKmh: 69,
    maxSpeedKmh: 124,
    score: 88,
    status: 'COMPLETED',
    mode: 'GENERATED_SIMULATION',
    user: driverUser,
    vehicle: { id: 'seed-vehicle-1', plateNumber: 'MS AB-123', vehicleType: 'CAR' },
    _count: { events: 2, points: 34 },
    fraud: { status: 'NORMAL', flags: [] },
  },
  {
    id: 'demo-trip-phone',
    startedAt: '2026-07-05T21:35:00.000Z',
    endedAt: '2026-07-05T22:04:00.000Z',
    distanceKm: 18.6,
    durationSeconds: 1740,
    averageSpeedKmh: 39,
    maxSpeedKmh: 76,
    score: 74,
    status: 'COMPLETED',
    mode: 'GENERATED_SIMULATION',
    user: driverUser,
    vehicle: { id: 'seed-vehicle-1', plateNumber: 'MS AB-123', vehicleType: 'CAR' },
    _count: { events: 4, points: 31 },
    fraud: { status: 'NORMAL', flags: [] },
  },
  {
    id: 'demo-trip-aggressive',
    startedAt: '2026-07-04T13:20:00.000Z',
    endedAt: '2026-07-04T13:47:00.000Z',
    distanceKm: 21.2,
    durationSeconds: 1620,
    averageSpeedKmh: 47,
    maxSpeedKmh: 98,
    score: 62,
    status: 'COMPLETED',
    mode: 'GENERATED_SIMULATION',
    user: driverUser,
    vehicle: { id: 'seed-vehicle-1', plateNumber: 'MS AB-123', vehicleType: 'CAR' },
    _count: { events: 7, points: 33 },
    fraud: { status: 'SUSPICIOUS', flags: [{ reason: 'event_density', detail: 'High-risk event density for a short trip' }] },
  },
  {
    id: 'demo-trip-replay',
    startedAt: '2026-07-03T07:05:00.000Z',
    endedAt: '2026-07-03T07:31:00.000Z',
    distanceKm: 15.7,
    durationSeconds: 1560,
    averageSpeedKmh: 36,
    maxSpeedKmh: 84,
    score: 81,
    status: 'COMPLETED',
    mode: 'REPLAY_FILE',
    user: { id: 'demo-family', name: 'Maja Novak', email: 'maja.novak@example.local', role: 'DRIVER' },
    vehicle: { id: 'seed-vehicle-2', plateNumber: 'LJ DW-204', vehicleType: 'CAR' },
    _count: { events: 3, points: 29 },
    fraud: { status: 'NORMAL', flags: [] },
  },
];

const routePoints: Record<string, DemoPoint[]> = {
  'demo-trip-safe-city': [
    [46.0569, 14.5058, 0],
    [46.058, 14.511, 28],
    [46.0605, 14.518, 43],
    [46.0634, 14.523, 47],
    [46.067, 14.529, 38],
    [46.071, 14.536, 31],
  ].map(([latitude, longitude, gpsSpeedKmh], index) => ({
    latitude,
    longitude,
    gpsSpeedKmh,
    timestamp: new Date(Date.UTC(2026, 6, 7, 6, 25 + index * 4)).toISOString(),
  })),
  'demo-trip-highway': [
    [46.5547, 15.6459, 0],
    [46.569, 15.623, 82],
    [46.591, 15.588, 113],
    [46.612, 15.55, 121],
    [46.638, 15.514, 117],
    [46.661, 15.486, 79],
  ].map(([latitude, longitude, gpsSpeedKmh], index) => ({
    latitude,
    longitude,
    gpsSpeedKmh,
    timestamp: new Date(Date.UTC(2026, 6, 6, 16, 12 + index * 7)).toISOString(),
  })),
};

routePoints['demo-trip-aggressive'] = [
  [46.662, 16.165, 0],
  [46.665, 16.171, 42],
  [46.669, 16.177, 69],
  [46.674, 16.184, 88],
  [46.679, 16.188, 71],
  [46.683, 16.193, 44],
].map(([latitude, longitude, gpsSpeedKmh], index) => ({
  latitude,
  longitude,
  gpsSpeedKmh,
  timestamp: new Date(Date.UTC(2026, 6, 4, 13, 20 + index * 5)).toISOString(),
}));

routePoints['demo-trip-phone'] = [
  [46.238, 15.267, 0],
  [46.241, 15.274, 32],
  [46.245, 15.281, 48],
  [46.248, 15.289, 52],
  [46.252, 15.296, 39],
  [46.256, 15.302, 27],
].map(([latitude, longitude, gpsSpeedKmh], index) => ({
  latitude,
  longitude,
  gpsSpeedKmh,
  timestamp: new Date(Date.UTC(2026, 6, 5, 21, 35 + index * 5)).toISOString(),
}));

routePoints['demo-trip-replay'] = [
  [46.051, 14.469, 0],
  [46.054, 14.477, 36],
  [46.059, 14.488, 54],
  [46.064, 14.496, 63],
  [46.069, 14.501, 48],
  [46.074, 14.507, 24],
].map(([latitude, longitude, gpsSpeedKmh], index) => ({
  latitude,
  longitude,
  gpsSpeedKmh,
  timestamp: new Date(Date.UTC(2026, 6, 3, 7, 5 + index * 5)).toISOString(),
}));

let events: DemoEvent[] = [
  {
    id: 'event-speed-1',
    tripId: 'demo-trip-highway',
    type: 'SPEEDING',
    severity: 'LOW',
    timestamp: '2026-07-06T16:35:00.000Z',
    value: 124,
    latitude: 46.612,
    longitude: 15.55,
    metadata: '{}',
  },
  {
    id: 'event-brake-1',
    tripId: 'demo-trip-highway',
    type: 'HARSH_BRAKING',
    severity: 'MEDIUM',
    timestamp: '2026-07-06T16:42:00.000Z',
    value: -3.1,
    latitude: 46.638,
    longitude: 15.514,
    metadata: '{}',
  },
  {
    id: 'event-phone-1',
    tripId: 'demo-trip-phone',
    type: 'PHONE_MOVEMENT',
    severity: 'HIGH',
    timestamp: '2026-07-05T21:49:00.000Z',
    value: 2.8,
    latitude: 46.248,
    longitude: 15.289,
    metadata: '{}',
  },
  {
    id: 'event-corner-1',
    tripId: 'demo-trip-phone',
    type: 'SHARP_CORNERING',
    severity: 'MEDIUM',
    timestamp: '2026-07-05T21:54:00.000Z',
    value: 2.2,
    latitude: 46.252,
    longitude: 15.296,
    metadata: '{}',
  },
  {
    id: 'event-aggressive-speed',
    tripId: 'demo-trip-aggressive',
    type: 'SPEEDING',
    severity: 'HIGH',
    timestamp: '2026-07-04T13:32:00.000Z',
    value: 98,
    latitude: 46.674,
    longitude: 16.184,
    metadata: '{}',
  },
  {
    id: 'event-aggressive-brake',
    tripId: 'demo-trip-aggressive',
    type: 'HARSH_BRAKING',
    severity: 'HIGH',
    timestamp: '2026-07-04T13:38:00.000Z',
    value: -4.2,
    latitude: 46.679,
    longitude: 16.188,
    metadata: '{}',
  },
  {
    id: 'event-replay-accel',
    tripId: 'demo-trip-replay',
    type: 'HARSH_ACCELERATION',
    severity: 'MEDIUM',
    timestamp: '2026-07-03T07:19:00.000Z',
    value: 3.3,
    latitude: 46.059,
    longitude: 14.488,
    metadata: '{}',
  },
];

const scenarios = [
  {
    id: 'safe_city',
    label: 'Safe city',
    labelSl: 'Varna mestna vožnja',
    description: 'Umirjena vožnja z nizkimi hitrostmi in brez tveganih dogodkov.',
    durationSeconds: 1320,
  },
  {
    id: 'aggressive_driver',
    label: 'Aggressive driver',
    labelSl: 'Agresivna vožnja',
    description: 'Več sunkovitih zaviranj, pospeševanj in prekoračitev hitrosti.',
    durationSeconds: 1620,
  },
  {
    id: 'phone_movement',
    label: 'Phone movement',
    labelSl: 'Premik telefona',
    description: 'Simulira premike naprave med vožnjo in opozorila vozniku.',
    durationSeconds: 1740,
  },
  {
    id: 'night_drive',
    label: 'Night drive',
    labelSl: 'Nočna vožnja',
    description: 'Daljša vožnja v nočnem kontekstu z dodatnimi opozorili.',
    durationSeconds: 2280,
  },
];

function currentStats() {
  const completed = trips.filter((trip) => trip.status === 'COMPLETED');
  const totalDistanceKm = Math.round(completed.reduce((sum, trip) => sum + trip.distanceKm, 0) * 10) / 10;
  const averageScore = Math.round(completed.reduce((sum, trip) => sum + trip.score, 0) / completed.length);

  return {
    totalUsers: users.length,
    totalTrips: trips.length,
    totalEvents: events.length,
    roadSegments: 1864,
    trafficEvents: 4,
    averageScore,
    totalDistanceKm,
    completedTrips: completed.length,
  };
}

function getTrip(id: string) {
  const trip = trips.find((item) => item.id === id);
  if (!trip) throw new Error('Demo trip not found');
  return trip;
}

function getEventsForTrip(id: string) {
  return events.filter((event) => event.tripId === id);
}

function scoreBreakdown(id: string) {
  const trip = getTrip(id);
  const tripEvents = getEventsForTrip(id);
  const speeding = tripEvents.filter((event) => event.type === 'SPEEDING').length;
  const harsh = tripEvents.filter((event) => event.type.includes('HARSH')).length;
  const phone = tripEvents.filter((event) => event.type === 'PHONE_MOVEMENT').length;

  return {
    tripId: trip.id,
    distanceKm: trip.distanceKm,
    durationSeconds: trip.durationSeconds,
    finalScore: trip.score,
    baseScore: 100,
    penalties: [
      ...(speeding ? [{ reason: 'Prekoračitev hitrosti', points: speeding * 3, count: speeding, eventType: 'SPEEDING' }] : []),
      ...(harsh ? [{ reason: 'Sunkoviti manevri', points: harsh * 2, count: harsh, eventType: 'HARSH_BRAKING' }] : []),
      ...(phone ? [{ reason: 'Možen premik telefona', points: phone * 4, count: phone, eventType: 'PHONE_MOVEMENT' }] : []),
    ],
    bonuses: trip.score >= 90 ? [{ reason: 'Čista in tekoča vožnja', points: 3 }] : [],
    warnings: trip.score < 75 ? ['Povišana gostota tveganih dogodkov na tej relaciji.'] : [],
    topWeaknesses: trip.score < 80 ? ['Preveri hitrost pred mestnimi vpadnicami.', 'Izogibaj se uporabi telefona med vožnjo.'] : [],
    topStrengths: trip.score >= 80 ? ['Enakomerno zaviranje.', 'Stabilna hitrost glede na tip ceste.'] : ['Dobra pokritost GPS podatkov.'],
    recommendations: trip.score < 85
      ? ['Ohrani večjo varnostno razdaljo.', 'Upočasni pred ostrimi ovinki in križišči.']
      : ['Ohrani trenutni slog vožnje in preveri mesečni trend.'],
    driverLevel: {
      tier: trip.score >= 90 ? 'PLATINUM' : trip.score >= 80 ? 'GOLD' : trip.score >= 70 ? 'SILVER' : 'BRONZE',
      labelSl: trip.score >= 90 ? 'Platinasti voznik' : trip.score >= 80 ? 'Zlati voznik' : trip.score >= 70 ? 'Srebrni voznik' : 'Bronasti voznik',
      emoji: '',
      color: '#22c55e',
      progressToNext: Math.min(100, Math.max(0, trip.score)),
      nextTier: trip.score >= 90 ? undefined : 'GOLD',
      nextMinScore: trip.score >= 90 ? undefined : 80,
      minScore: trip.score >= 90 ? 90 : trip.score >= 80 ? 80 : trip.score >= 70 ? 70 : 0,
      maxScore: trip.score >= 90 ? 100 : trip.score >= 80 ? 89 : trip.score >= 70 ? 79 : 69,
    },
    explanationText: `Začetna ocena 100. Končna ocena ${trip.score}/100 temelji na ${tripEvents.length} zaznanih dogodkih, razdalji ${trip.distanceKm.toFixed(1)} km in trajanju ${Math.round(trip.durationSeconds / 60)} min.`,
  };
}

function generateTrip(scenarioId: string) {
  const scenarioScore: Record<string, number> = {
    safe_city: 97,
    aggressive_driver: 61,
    phone_movement: 73,
    night_drive: 84,
  };
  const createdAt = new Date().toISOString();
  const tripId = `demo-generated-${Date.now()}`;
  const score = scenarioScore[scenarioId] ?? 82;
  const distanceKm = scenarioId === 'aggressive_driver' ? 22.6 : scenarioId === 'phone_movement' ? 17.8 : 13.2;

  const newTrip: DemoTrip = {
    id: tripId,
    startedAt: createdAt,
    endedAt: new Date(Date.now() + 24 * 60 * 1000).toISOString(),
    distanceKm,
    durationSeconds: 1440,
    averageSpeedKmh: Math.round((distanceKm / 1440) * 3600),
    maxSpeedKmh: scenarioId === 'aggressive_driver' ? 104 : 72,
    score,
    status: 'COMPLETED',
    mode: 'GENERATED_SIMULATION',
    user: driverUser,
    vehicle: { id: 'seed-vehicle-1', plateNumber: 'MS AB-123', vehicleType: 'CAR' },
    _count: { events: score >= 90 ? 0 : 3, points: 24 },
    fraud: { status: 'NORMAL', flags: [] },
  };

  trips = [newTrip, ...trips];
  routePoints[tripId] = routePoints['demo-trip-safe-city'];

  if (score < 90) {
    events = [
      {
        id: `event-${tripId}`,
        tripId,
        type: scenarioId === 'phone_movement' ? 'PHONE_MOVEMENT' : 'SPEEDING',
        severity: score < 70 ? 'HIGH' : 'MEDIUM',
        timestamp: createdAt,
        value: scenarioId === 'phone_movement' ? 2.7 : 91,
        latitude: 46.0634,
        longitude: 14.523,
        metadata: '{}',
      },
      ...events,
    ];
  }

  return {
    tripId,
    scenarioId,
    distanceKm,
    samplesGenerated: 720,
    eventsDetected: newTrip._count.events,
    isDemo: true,
    score: {
      finalScore: score,
      penalties: score >= 90 ? [] : [{ reason: scenarioId === 'phone_movement' ? 'Možen premik telefona' : 'Prekoračitev hitrosti', points: 100 - score, count: 1 }],
      bonuses: score >= 90 ? [{ reason: 'Čista vožnja', points: 3 }] : [],
      warnings: score < 75 ? ['Demo scenarij prikazuje povečano tveganje.'] : [],
      explanationText: `Lokalni demo je ustvaril ${distanceKm.toFixed(1)} km dolgo vožnjo z oceno ${score}/100.`,
    },
  };
}

export const demoApi = {
  login(email: string, password: string) {
    if (email === 'admin@drivewise.si' && password === 'admin1234') {
      return { accessToken: 'demo-local-admin-token' };
    }
    if (email === 'voznik@drivewise.si' && password === 'driver1234') {
      return { accessToken: 'demo-local-driver-token' };
    }
    throw new Error('Invalid demo credentials');
  },
  register(name: string, email: string) {
    return { accessToken: `demo-local-${name}-${email}` };
  },
  me() {
    return adminUser;
  },
  stats: currentStats,
  users: () => users,
  trips: () => trips,
  events: () => events,
  heatmap: () => events.filter((event) => event.latitude && event.longitude).map((event) => ({
    lat: Math.round(event.latitude! * 1000) / 1000,
    lng: Math.round(event.longitude! * 1000) / 1000,
    type: event.type,
    severity: event.severity,
  })),
  roadIntelligence: () => ({
    totalSegments: 1864,
    withSpeedLimit: 742,
    missingSpeedLimitPercent: 60,
    byRoadType: [
      { roadType: 'residential', _count: { id: 812 } },
      { roadType: 'tertiary', _count: { id: 384 } },
      { roadType: 'primary', _count: { id: 215 } },
      { roadType: 'service', _count: { id: 198 } },
      { roadType: 'motorway', _count: { id: 73 } },
    ],
  }),
  dataSources: () => ({
    statuses: [
      { provider: 'OSM_OVERPASS', status: 'OK', lastSuccessAt: '2026-07-07T07:10:00.000Z' },
      { provider: 'PROMET', status: 'UNKNOWN', message: 'Local demo mode uses static sample traffic data.' },
      { provider: 'OPENWEATHER', status: 'UNKNOWN', message: 'No API key configured for local demo.' },
    ],
    recentLogs: [
      { id: 'log-1', provider: 'OSM_OVERPASS', status: 'SUCCESS', startedAt: '2026-07-07T07:10:00.000Z', finishedAt: '2026-07-07T07:11:00.000Z', recordsImported: 1864 },
      { id: 'log-2', provider: 'PROMET', status: 'SKIPPED', startedAt: '2026-07-07T07:12:00.000Z', recordsImported: 0 },
    ],
  }),
  trafficEvents: () => [
    {
      id: 'traffic-1',
      source: 'PROMET_DEMO',
      type: 'congestion',
      title: 'Zastoj na ljubljanski obvoznici',
      description: 'Počasnejši promet med priključkoma Bežigrad in Tomačevo.',
      severity: 'MEDIUM',
      roadName: 'A1',
      importedAt: '2026-07-07T07:12:00.000Z',
    },
    {
      id: 'traffic-2',
      source: 'PROMET_DEMO',
      type: 'roadwork',
      title: 'Dela na regionalni cesti',
      description: 'Zožanje ceste in izmenično enosmerni promet.',
      severity: 'LOW',
      roadName: 'R2-430',
      importedAt: '2026-07-07T07:18:00.000Z',
    },
  ],
  logs: () => [],
  providerStatus: () => demoApi.dataSources().statuses,
  importOsm: () => ({ status: 'SUCCESS', recordsImported: 1864 }),
  importTraffic: () => ({ status: 'SUCCESS', recordsImported: 2 }),
  scenarios: () => scenarios,
  generate: generateTrip,
  tripList: () => trips,
  trip: getTrip,
  points: (id: string) => routePoints[id] ?? routePoints['demo-trip-safe-city'],
  tripEvents: getEventsForTrip,
  scoreBreakdown,
  scoreSummary: () => ({ averageScore: currentStats().averageScore, tripCount: trips.length }),
  monthly: () => [
    { month: '2026-07', averageScore: 84, tripCount: 5, distanceKm: 110.7 },
    { month: '2026-06', averageScore: 81, tripCount: 18, distanceKm: 392.4 },
    { month: '2026-05', averageScore: 78, tripCount: 22, distanceKm: 438.6 },
    { month: '2026-04', averageScore: 83, tripCount: 20, distanceKm: 401.2 },
  ],
  achievements: () => [],
  weeklyReport: () => ({
    period: '2026-07-01/2026-07-07',
    tripCount: trips.length,
    totalKm: currentStats().totalDistanceKm,
    totalSeconds: trips.reduce((sum, trip) => sum + trip.durationSeconds, 0),
    averageScore: currentStats().averageScore,
    previousAverageScore: 81,
    improvement: currentStats().averageScore - 81,
    bestTrip: trips.reduce((best, trip) => (trip.score > best.score ? trip : best), trips[0]),
    worstTrip: trips.reduce((worst, trip) => (trip.score < worst.score ? trip : worst), trips[0]),
    harshEvents: events.filter((event) => event.type.includes('HARSH')).length,
    speedingEvents: events.filter((event) => event.type === 'SPEEDING').length,
    phoneEvents: events.filter((event) => event.type === 'PHONE_MOVEMENT').length,
    eventByType: events.reduce<Record<string, number>>((acc, event) => {
      acc[event.type] = (acc[event.type] ?? 0) + 1;
      return acc;
    }, {}),
  }),
};
