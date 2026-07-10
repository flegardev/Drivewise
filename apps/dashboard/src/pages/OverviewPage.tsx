import React, { useEffect, useState } from 'react';
import { adminApi } from '../api/client';
import { StatCard, ScoreRing, LoadingState, ErrorState, Badge, SectionHeader } from '../components/ui';

interface Stats {
  totalUsers: number;
  totalTrips: number;
  totalEvents: number;
  roadSegments: number;
  averageScore: number | null;
  totalDistanceKm: number;
  completedTrips: number;
}

export default function OverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi.stats()
      .then((r) => setStats(r.data))
      .catch(() => setError('Napaka pri nalaganju statistike.'));
  }, []);

  if (error) return <div className="p-8"><ErrorState message={error} /></div>;
  if (!stats) return <LoadingState />;

  const riskyTripsPercent = stats.completedTrips > 0
    ? Math.round((stats.totalEvents / stats.completedTrips) * 10) / 10
    : 0;
  const scoreLabel = stats.averageScore == null
    ? 'Ni podatkov'
    : stats.averageScore >= 90
      ? 'Odlično'
      : stats.averageScore >= 80
        ? 'Stabilno'
        : stats.averageScore >= 70
          ? 'Potreben nadzor'
          : 'Visoko tveganje';

  return (
    <div className="p-8">
      <div className="mb-8 grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="card flex flex-col justify-between overflow-hidden bg-surface-800">
          <div className="mb-8 flex items-start justify-between gap-5">
            <div>
              <Badge variant="green">Lokalni demo pripravljen</Badge>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-white">DriveWise nadzor voženj</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-surface-300">
                Operativni pregled voznikov, tveganih dogodkov, cestnih podatkov in simuliranih telematičnih voženj.
              </p>
            </div>
            {stats.averageScore != null && (
              <div className="hidden shrink-0 rounded-2xl border border-surface-600 bg-surface-900/60 p-4 md:block">
                <ScoreRing score={stats.averageScore} size={92} />
              </div>
            )}
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-surface-600 bg-surface-900/45 p-4">
              <div className="text-xs uppercase tracking-wide text-surface-400">Povprečna ocena</div>
              <div className="mt-1 text-2xl font-bold text-white">{stats.averageScore ?? '-'}</div>
              <div className="mt-1 text-xs text-brand-400">{scoreLabel}</div>
            </div>
            <div className="rounded-xl border border-surface-600 bg-surface-900/45 p-4">
              <div className="text-xs uppercase tracking-wide text-surface-400">Tveganje na vožnjo</div>
              <div className="mt-1 text-2xl font-bold text-white">{riskyTripsPercent}</div>
              <div className="mt-1 text-xs text-surface-400">dogodkov / zaključeno vožnjo</div>
            </div>
            <div className="rounded-xl border border-surface-600 bg-surface-900/45 p-4">
              <div className="text-xs uppercase tracking-wide text-surface-400">Razdalja</div>
              <div className="mt-1 text-2xl font-bold text-white">{stats.totalDistanceKm} km</div>
              <div className="mt-1 text-xs text-surface-400">v demo podatkih</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="mb-5">
            <div className="text-sm font-semibold text-white">Sistemski status</div>
            <div className="mt-1 text-xs text-surface-400">Pregled lokalnega okolja za demonstracijo</div>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between border-b border-surface-700 pb-3">
              <span className="text-surface-300">Dashboard</span>
              <Badge variant="green">Aktiven</Badge>
            </div>
            <div className="flex items-center justify-between border-b border-surface-700 pb-3">
              <span className="text-surface-300">Demo auth</span>
              <Badge variant="green">Pripravljen</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-surface-300">Backend fallback</span>
              <Badge variant="blue">Samodejen</Badge>
            </div>
          </div>
        </div>
      </div>

      <SectionHeader title="Operativne metrike" sub="Splošna statistika sistema DriveWise" />
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Uporabniki" value={stats.totalUsers} sub="admini in vozniki" />
        <StatCard label="Vožnje skupaj" value={stats.totalTrips} sub="zadnjih 200 prikazov" />
        <StatCard label="Tvegani dogodki" value={stats.totalEvents} sub="hitrost, zaviranje, telefon" />
        <StatCard label="Cestni odseki" value={stats.roadSegments} sub="OSM inteligenca" />
      </div>
      <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <StatCard label="Zaključene vožnje" value={stats.completedTrips} />
        <StatCard label="Skupna razdalja" value={`${stats.totalDistanceKm} km`} />
        <div className="card">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wider text-surface-400">Povprečna ocena</div>
              <div className="mt-1 text-sm text-surface-300">{scoreLabel}</div>
            </div>
            {stats.averageScore != null
              ? <ScoreRing score={stats.averageScore} size={66} />
              : <div className="text-sm text-surface-400">Ni podatkov</div>}
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-surface-700">
            <div
              className="h-full rounded-full bg-brand-500"
              style={{ width: `${stats.averageScore ?? 0}%` }}
            />
          </div>
        </div>
      </div>

      <div className="card border-surface-600 text-xs leading-5 text-surface-400">
        <strong className="text-surface-300">Opomba:</strong> DriveWise je MVP demonstracija. Ocene vožnje so ocenjevalne in niso primerne za zavarovalniško ali pravno presojo.
      </div>
    </div>
  );
}
