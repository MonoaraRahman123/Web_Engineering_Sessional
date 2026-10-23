import React from 'react';

export default function LeaderboardTable({
  startups,
  isAdmin,
  onEdit,
  onDelete,
  page = 1,
  limit = 5,
}) {
  // Format currency
  const formatFunding = (amount) => {
    if (typeof amount !== 'number') amount = Number(amount) || 0;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Sector badge color helper
  const getSectorBadge = (sector) => {
    const s = (sector || '').toLowerCase();
    if (s.includes('k-12')) {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    } else if (s.includes('prep')) {
      return 'bg-purple-100 text-purple-800 border-purple-200';
    } else if (s.includes('upskill')) {
      return 'bg-amber-100 text-amber-800 border-amber-200';
    } else if (s.includes('coding')) {
      return 'bg-rose-100 text-rose-800 border-rose-200';
    }
    return 'bg-slate-100 text-slate-800 border-slate-200';
  };

  const getRankBadge = (index) => {
    const globalRank = (page - 1) * limit + index + 1;
    if (globalRank === 1) {
      return (
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-100 text-amber-700 font-bold border border-amber-300 shadow-sm" title="Rank 1">
          🥇
        </span>
      );
    }
    if (globalRank === 2) {
      return (
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold border border-slate-300 shadow-sm" title="Rank 2">
          🥈
        </span>
      );
    }
    if (globalRank === 3) {
      return (
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-50 text-amber-800 font-bold border border-amber-400 shadow-sm" title="Rank 3">
          🥉
        </span>
      );
    }
    return (
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-slate-600 font-semibold text-xs border border-slate-200">
        #{globalRank}
      </span>
    );
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 tracking-wider">
          <tr>
            <th scope="col" className="px-4 py-3.5 text-center w-16">Rank</th>
            <th scope="col" className="px-6 py-3.5">Startup</th>
            <th scope="col" className="px-4 py-3.5">Sector</th>
            <th scope="col" className="px-4 py-3.5">Founder(s)</th>
            <th scope="col" className="px-4 py-3.5">Headquarters</th>
            <th scope="col" className="px-4 py-3.5 text-center">Founded</th>
            <th scope="col" className="px-6 py-3.5 text-right font-bold text-slate-700">Total Funding</th>
            {isAdmin && (
              <th scope="col" className="px-4 py-3.5 text-center w-32">Actions</th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {startups.map((startup, idx) => (
            <tr
              key={startup._id || idx}
              className="hover:bg-slate-50/80 transition-colors duration-150 group"
            >
              {/* Rank */}
              <td className="px-4 py-4 text-center whitespace-nowrap">
                {getRankBadge(idx)}
              </td>

              {/* Startup Name & Logo */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-3.5">
                  <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden border border-slate-200 bg-white p-1 flex items-center justify-center">
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
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 text-base group-hover:text-emerald-700 transition-colors">
                        {startup.name}
                      </span>
                      {startup.website && (
                        <a
                          href={startup.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-400 hover:text-emerald-600 transition"
                          title="Visit Website"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      )}
                    </div>
                    {startup.description && (
                      <p className="text-xs text-slate-500 line-clamp-1 max-w-xs">
                        {startup.description}
                      </p>
                    )}
                  </div>
                </div>
              </td>

              {/* Sector */}
              <td className="px-4 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${getSectorBadge(startup.sector)}`}>
                  {startup.sector}
                </span>
              </td>

              {/* Founders */}
              <td className="px-4 py-4 whitespace-nowrap text-slate-700 font-medium text-xs sm:text-sm">
                {startup.founders}
              </td>

              {/* Headquarters */}
              <td className="px-4 py-4 whitespace-nowrap text-slate-600 text-xs sm:text-sm flex items-center space-x-1 mt-4 sm:mt-0">
                <svg className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{startup.headquarters}</span>
              </td>

              {/* Year Founded */}
              <td className="px-4 py-4 whitespace-nowrap text-center text-slate-700 font-semibold text-xs sm:text-sm">
                {startup.yearFounded}
              </td>

              {/* Total Funding */}
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <span className="font-extrabold text-emerald-700 text-sm sm:text-base">
                  {formatFunding(startup.totalFunding)}
                </span>
                <span className="block text-[10px] text-slate-400 uppercase tracking-wider">USD</span>
              </td>

              {/* Admin Actions */}
              {isAdmin && (
                <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <div className="flex items-center justify-center space-x-1.5">
                    <button
                      onClick={() => onEdit(startup)}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 border border-slate-200 transition"
                      title="Edit Startup"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDelete(startup)}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition"
                      title="Delete Startup"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
