import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import LeaderboardTable from './components/LeaderboardTable';
import StartupCard from './components/StartupCard';
import StartupModal from './components/StartupModal';
import DeleteModal from './components/DeleteModal';
import LoginModal from './components/LoginModal';
import Pagination from './components/Pagination';
import { api } from './services/api';

const SECTORS = ['All', 'K-12', 'Test Prep', 'Upskilling', 'Coding'];

export default function App() {
  // State: Data & Filter
  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState('All');
  const [sortBy, setSortBy] = useState('totalFunding');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'

  // Pagination (Optional Requirement: 5 startups per page)
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 5;

  // Authentication State
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminUser, setAdminUser] = useState(null);

  // Modals State
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isStartupModalOpen, setIsStartupModalOpen] = useState(false);
  const [editingStartup, setEditingStartup] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingStartup, setDeletingStartup] = useState(null);

  // Operation Loadings
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Check persisted auth on initial mount via AJAX
  useEffect(() => {
    const token = localStorage.getItem('edtech_token');
    const storedUser = localStorage.getItem('edtech_user');
    if (token && storedUser) {
      try {
        setAdminUser(JSON.parse(storedUser));
        setIsAdmin(true);
        // Verify with server
        api.verifyToken().catch(() => {
          localStorage.removeItem('edtech_token');
          localStorage.removeItem('edtech_user');
          setIsAdmin(false);
          setAdminUser(null);
        });
      } catch (e) {
        setIsAdmin(false);
      }
    }
  }, []);

  // Fetch Startups via AJAX (Dynamic, no page reload)
  const fetchStartups = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getStartups({
        search: searchQuery,
        sector: selectedSector,
        sortBy,
        sortOrder,
        page: currentPage,
        limit: pageSize,
      });

      if (data.success) {
        setStartups(data.startups || []);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.totalCount || 0);
      }
    } catch (err) {
      console.error('Failed to load startups:', err);
      showToast('Could not load startups. Please check your backend connection.', 'error');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedSector, sortBy, sortOrder, currentPage]);

  useEffect(() => {
    fetchStartups();
  }, [fetchStartups]);

  // Debounced search reset to page 1
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleSectorSelect = (sector) => {
    setSelectedSector(sector);
    setCurrentPage(1);
  };

  // Admin Login via AJAX
  const handleLogin = async (username, password) => {
    setActionLoading(true);
    try {
      const res = await api.login(username, password);
      if (res.success && res.token) {
        localStorage.setItem('edtech_token', res.token);
        localStorage.setItem('edtech_user', JSON.stringify(res.user));
        setIsAdmin(true);
        setAdminUser(res.user);
        setIsLoginModalOpen(false);
        showToast('Admin logged in successfully!');
      }
    } catch (err) {
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  // Admin Logout
  const handleLogout = () => {
    localStorage.removeItem('edtech_token');
    localStorage.removeItem('edtech_user');
    setIsAdmin(false);
    setAdminUser(null);
    showToast('Logged out of Admin Panel.', 'info');
  };

  // Add or Update Startup via AJAX
  const handleStartupSubmit = async (formData) => {
    setActionLoading(true);
    try {
      if (editingStartup) {
        // Edit existing startup
        const res = await api.updateStartup(editingStartup._id, formData);
        showToast(res.message || 'Startup updated successfully!');
      } else {
        // Create new startup
        const res = await api.createStartup(formData);
        showToast(res.message || 'Startup created successfully!');
      }
      setIsStartupModalOpen(false);
      setEditingStartup(null);
      fetchStartups();
    } catch (err) {
      showToast(err.message || 'Action failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Startup via AJAX
  const handleDeleteConfirm = async () => {
    if (!deletingStartup) return;
    setActionLoading(true);
    try {
      const res = await api.deleteStartup(deletingStartup._id);
      showToast(res.message || 'Startup deleted successfully!');
      setIsDeleteModalOpen(false);
      setDeletingStartup(null);
      fetchStartups();
    } catch (err) {
      showToast(err.message || 'Failed to delete startup', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Modal Triggers
  const openAddModal = () => {
    setEditingStartup(null);
    setIsStartupModalOpen(true);
  };

  const openEditModal = (startup) => {
    setEditingStartup(startup);
    setIsStartupModalOpen(true);
  };

  const openDeleteModal = (startup) => {
    setDeletingStartup(startup);
    setIsDeleteModalOpen(true);
  };

  // Ecosystem summary computation
  const totalFundingSum = startups.reduce((acc, s) => acc + (Number(s.totalFunding) || 0), 0);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center space-x-2 px-4 py-3 rounded-xl shadow-xl border text-sm font-semibold transition-all transform animate-bounce">
          {toast.type === 'error' ? (
            <div className="bg-rose-50 text-rose-800 border-rose-300 px-4 py-2.5 rounded-xl flex items-center shadow-md">
              <span className="mr-2">❌</span> {toast.message}
            </div>
          ) : toast.type === 'info' ? (
            <div className="bg-sky-50 text-sky-800 border-sky-300 px-4 py-2.5 rounded-xl flex items-center shadow-md">
              <span className="mr-2">ℹ️</span> {toast.message}
            </div>
          ) : (
            <div className="bg-emerald-50 text-emerald-900 border-emerald-300 px-4 py-2.5 rounded-xl flex items-center shadow-md">
              <span className="mr-2">✅</span> {toast.message}
            </div>
          )}
        </div>
      )}

      {/* Main App Navigation Header */}
      <Header
        isAdmin={isAdmin}
        adminUser={adminUser}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        onOpenAddModal={openAddModal}
      />

      {/* Sub-hero & Quick Stats Banner */}
      <section className="bg-gradient-to-b from-white to-slate-50 border-b border-slate-200 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold tracking-wide uppercase mb-2">
                Ecosystem Leaderboard
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Top Bangladeshi EdTech Startups
              </h2>
              <p className="text-slate-600 text-sm mt-1 max-w-2xl">
                Explore leading education technology platforms driving literacy, competitive test preparation, coding, and workforce upskilling across Bangladesh.
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm text-center">
                <span className="text-xs text-slate-500 font-semibold block uppercase">Total Startups</span>
                <span className="text-xl font-black text-slate-900">{totalCount}</span>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm text-center">
                <span className="text-xs text-slate-500 font-semibold block uppercase">Sort Order</span>
                <span className="text-xs font-bold text-emerald-700 mt-1 block">Funding (High-to-Low)</span>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm text-center col-span-2 sm:col-span-1">
                <span className="text-xs text-slate-500 font-semibold block uppercase">Admin Role</span>
                <span className={`text-xs font-bold mt-1 inline-block px-2 py-0.5 rounded ${isAdmin ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                  {isAdmin ? 'Authenticated' : 'Viewer Mode'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter, Search & Display Controls */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 mb-6 shadow-sm">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Search Input Box */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search by startup name, sector, or founders (e.g., Shikho, Coding, K-12)..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Sector Quick Pills */}
            <div className="flex items-center overflow-x-auto pb-1 lg:pb-0 space-x-1.5 scrollbar-none">
              {SECTORS.map((sector) => (
                <button
                  key={sector}
                  onClick={() => handleSectorSelect(sector)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    selectedSector === sector
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {sector}
                </button>
              ))}
            </div>

            {/* Sorting & Layout Toggle Controls */}
            <div className="flex items-center space-x-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [sb, so] = e.target.value.split('-');
                  setSortBy(sb);
                  setSortOrder(so);
                }}
                className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="totalFunding-desc">Funding: High to Low (Default)</option>
                <option value="totalFunding-asc">Funding: Low to High</option>
                <option value="yearFounded-desc">Year: Newest First</option>
                <option value="yearFounded-asc">Year: Oldest First</option>
                <option value="name-asc">Name: A to Z</option>
              </select>

              {/* View Toggle */}
              <div className="bg-slate-100 p-1 rounded-lg flex items-center space-x-1">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-md text-xs transition ${
                    viewMode === 'table' ? 'bg-white shadow text-emerald-700' : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Table View"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md text-xs transition ${
                    viewMode === 'grid' ? 'bg-white shadow text-emerald-700' : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Card Grid View"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Display: Loading / Empty / Data */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-emerald-600 mb-3"></div>
            <p className="text-slate-500 text-sm font-medium">Fetching EdTech data via AJAX...</p>
          </div>
        ) : startups.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="text-lg font-bold text-slate-800">No Startups Found</h4>
            <p className="text-slate-500 text-sm mt-1 max-w-md mx-auto">
              We couldn't find any Bangladeshi EdTech startups matching "{searchQuery}". Try adjusting your search or sector filter.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedSector('All');
              }}
              className="mt-4 px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold transition"
            >
              Reset Filters
            </button>
          </div>
        ) : viewMode === 'table' ? (
          <div>
            <LeaderboardTable
              startups={startups}
              isAdmin={isAdmin}
              onEdit={openEditModal}
              onDelete={openDeleteModal}
              page={currentPage}
              limit={pageSize}
            />
            {/* Pagination Controls */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalCount={totalCount}
              pageSize={pageSize}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {startups.map((startup, idx) => (
                <StartupCard
                  key={startup._id || idx}
                  startup={startup}
                  rank={(currentPage - 1) * pageSize + idx + 1}
                  isAdmin={isAdmin}
                  onEdit={openEditModal}
                  onDelete={openDeleteModal}
                />
              ))}
            </div>
            {/* Pagination Controls */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalCount={totalCount}
              pageSize={pageSize}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Bangladeshi EdTech Startup Leaderboard &bull; MERN Stack Lab Project</span>
          <span>Admin Credentials: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-emerald-800 font-bold">admin_edtech</code> / <code className="bg-slate-100 px-1.5 py-0.5 rounded text-emerald-800 font-bold">admin@123</code></span>
        </div>
      </footer>

      {/* Modals */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLogin}
        loading={actionLoading}
      />

      <StartupModal
        isOpen={isStartupModalOpen}
        onClose={() => {
          setIsStartupModalOpen(false);
          setEditingStartup(null);
        }}
        onSubmit={handleStartupSubmit}
        initialData={editingStartup}
        loading={actionLoading}
      />

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingStartup(null);
        }}
        onConfirm={handleDeleteConfirm}
        startup={deletingStartup}
        loading={actionLoading}
      />
    </div>
  );
}
