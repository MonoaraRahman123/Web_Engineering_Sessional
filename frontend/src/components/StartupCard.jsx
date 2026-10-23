import React from 'react';

export default function StartupCard({
  startup,
  rank,
  isAdmin,
  onEdit,
  onDelete,
}) {
  const formatFunding = (amount) => {
    if (typeof amount !== 'number') amount = Number(amount) || 0;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getSectorBadge = (sector) => {
    const s = (sector || '').toLowerCase();
    if (s.includes('k-12')) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (s.includes('prep')) return 'bg-purple-100 text-purple-800 border-purple-200';
    if (s.includes('upskill')) return 'bg-amber-100 text-amber-800 border-amber-200';
    if (s.includes('coding')) return 'bg-rose-100 text-rose-800 border-rose-200';
    return 'bg-slate-100 text-slate-800 border-slate-200';
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between group">
      <div>
        {/* Header: Rank + Logo + Sector */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200 bg-white p-1 flex items-center justify-center flex-shrink-0">
              <img
                src={startup.logoUrl}
                alt={startup.name}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(startup.name)}&background=10b981&color=fff&bold=true`;
                }}
                className="w-full h-full object-contain rounded-md"
              />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-slate-900 text-base group-hover:text-emerald-700 transition">
                  {startup.name}
                </span>
                {startup.website && (
                  <a
                    href={startup.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-emerald-600 transition"
                    title="Website"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
              </div>
              <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[11px] font-semibold border ${getSectorBadge(startup.sector)}`}>
                {startup.sector}
              </span>
            </div>
          </div>

          <span className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded-md border border-slate-200">
            #{rank}
          </span>
        </div>

        {/* Description */}
        {startup.description && (
          <p className="text-xs text-slate-500 line-clamp-2 mb-3">
            {startup.description}
          </p>
        )}

        {/* Details Grid */}
        <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3 mb-4">
          <div className="flex justify-between">
            <span className="text-slate-400">Founder(s):</span>
            <span className="font-medium text-slate-800 text-right">{startup.founders}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Headquarters:</span>
            <span className="font-medium text-slate-800">{startup.headquarters}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Founded:</span>
            <span className="font-semibold text-slate-800">{startup.yearFounded}</span>
          </div>
        </div>
      </div>

      {/* Footer: Funding & Actions */}
      <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Total Funding</span>
          <span className="text-base font-extrabold text-emerald-700">
            {formatFunding(startup.totalFunding)}
          </span>
        </div>

        {isAdmin && (
          <div className="flex space-x-1.5">
            <button
              onClick={() => onEdit(startup)}
              className="p-1.5 text-xs bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 rounded-md border border-slate-200 transition"
              title="Edit"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => onDelete(startup)}
              className="p-1.5 text-xs bg-slate-100 hover:bg-rose-50 hover:text-rose-600 rounded-md border border-slate-200 transition"
              title="Delete"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
