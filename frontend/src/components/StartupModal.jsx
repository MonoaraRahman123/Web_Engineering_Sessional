import React, { useState, useEffect, useRef } from 'react';

export default function StartupModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  loading = false,
}) {
  const [formData, setFormData] = useState({
    name: '',
    sector: 'K-12',
    founders: '',
    headquarters: 'Dhaka, Bangladesh',
    yearFounded: new Date().getFullYear(),
    totalFunding: '',
    logoUrl: '',
    website: '',
    description: '',
  });

  const [uploadMode, setUploadMode] = useState('file'); // 'file' or 'url'
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [formError, setFormError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        sector: initialData.sector || 'K-12',
        founders: initialData.founders || '',
        headquarters: initialData.headquarters || 'Dhaka, Bangladesh',
        yearFounded: initialData.yearFounded || new Date().getFullYear(),
        totalFunding: initialData.totalFunding ?? '',
        logoUrl: initialData.logoUrl || '',
        website: initialData.website || '',
        description: initialData.description || '',
      });
      // Detect if existing logo is base64 or URL
      if (initialData.logoUrl && initialData.logoUrl.startsWith('data:')) {
        setUploadMode('file');
        setFileName('Uploaded Local Image');
      } else if (initialData.logoUrl) {
        setUploadMode('url');
        setFileName('');
      } else {
        setUploadMode('file');
        setFileName('');
      }
    } else {
      setFormData({
        name: '',
        sector: 'K-12',
        founders: '',
        headquarters: 'Dhaka, Bangladesh',
        yearFounded: new Date().getFullYear(),
        totalFunding: '',
        logoUrl: '',
        website: '',
        description: '',
      });
      setUploadMode('file');
      setFileName('');
      setFileSize('');
    }
    setFormError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle Local Device File Selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFormError('Please select a valid image file (PNG, JPG, SVG, WebP).');
      return;
    }

    // Limit to 5MB to ensure fast loading
    if (file.size > 5 * 1024 * 1024) {
      setFormError('File size is too large. Please select an image under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64Data = uploadEvent.target?.result;
      setFormData((prev) => ({
        ...prev,
        logoUrl: base64Data,
      }));
      setFileName(file.name);
      setFileSize((file.size / 1024).toFixed(1) + ' KB');
      setFormError('');
    };
    reader.onerror = () => {
      setFormError('Failed to read file from your device.');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, logoUrl: '' }));
    setFileName('');
    setFileSize('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    // Form validation
    if (!formData.name.trim()) return setFormError('Startup name is required.');
    if (!formData.sector.trim()) return setFormError('Sector is required.');
    if (!formData.founders.trim()) return setFormError('Founder name(s) is required.');
    if (!formData.headquarters.trim()) return setFormError('Headquarters is required.');
    if (!formData.yearFounded) return setFormError('Year founded is required.');
    if (formData.totalFunding === '' || isNaN(Number(formData.totalFunding))) {
      return setFormError('Valid total funding (numeric USD) is required.');
    }
    if (!formData.logoUrl || !formData.logoUrl.trim()) {
      return setFormError('Startup Logo is required. Please upload an image from your device or provide a URL.');
    }

    onSubmit({
      ...formData,
      yearFounded: Number(formData.yearFounded),
      totalFunding: Number(formData.totalFunding),
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all my-8">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-800">
              {initialData ? 'Edit Startup Details' : 'Add New EdTech Startup'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {formError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center space-x-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Startup Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Startup Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. 10 Minute School"
                required
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            {/* Sector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Sector *
              </label>
              <select
                name="sector"
                value={formData.sector}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
              >
                <option value="K-12">K-12</option>
                <option value="Test Prep">Test Prep</option>
                <option value="Upskilling">Upskilling</option>
                <option value="Coding">Coding</option>
                <option value="Higher Education">Higher Education</option>
                <option value="Language Learning">Language Learning</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Founder(s) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Founder(s) *
              </label>
              <input
                type="text"
                name="founders"
                value={formData.founders}
                onChange={handleChange}
                placeholder="e.g. Ayman Sadiq"
                required
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            {/* Headquarters */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Headquarters *
              </label>
              <input
                type="text"
                name="headquarters"
                value={formData.headquarters}
                onChange={handleChange}
                placeholder="e.g. Dhaka, Bangladesh"
                required
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            {/* Year Founded */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Year Founded *
              </label>
              <input
                type="number"
                name="yearFounded"
                value={formData.yearFounded}
                onChange={handleChange}
                min="1990"
                max="2030"
                placeholder="2015"
                required
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            {/* Total Funding (USD) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Total Funding (USD) *
              </label>
              <input
                type="number"
                name="totalFunding"
                value={formData.totalFunding}
                onChange={handleChange}
                min="0"
                placeholder="e.g. 7500000"
                required
                className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Logo Upload Section */}
          <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Startup Logo *
              </label>
              {/* Toggle: Upload from Device vs Image URL */}
              <div className="flex items-center space-x-1 bg-slate-200/80 p-0.5 rounded-lg text-[11px] font-semibold">
                <button
                  type="button"
                  onClick={() => setUploadMode('file')}
                  className={`px-2.5 py-1 rounded-md transition ${
                    uploadMode === 'file'
                      ? 'bg-white text-emerald-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  📁 Device Upload
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode('url')}
                  className={`px-2.5 py-1 rounded-md transition ${
                    uploadMode === 'url'
                      ? 'bg-white text-emerald-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  🔗 Image URL
                </button>
              </div>
            </div>

            {uploadMode === 'file' ? (
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
                  className="hidden"
                />

                {formData.logoUrl ? (
                  /* Image Preview Card */
                  <div className="flex items-center justify-between bg-white border border-slate-200 p-3 rounded-xl shadow-xs">
                    <div className="flex items-center space-x-3">
                      <div className="w-14 h-14 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 p-1 flex items-center justify-center">
                        <img
                          src={formData.logoUrl}
                          alt="Uploaded Logo Preview"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 line-clamp-1">
                          {fileName || 'Logo Selected'}
                        </p>
                        {fileSize && (
                          <p className="text-[11px] text-slate-400 font-medium">
                            {fileSize}
                          </p>
                        )}
                        <span className="inline-flex items-center text-[10px] text-emerald-600 font-semibold mt-0.5">
                          ✓ Ready to save
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-2.5 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition"
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Remove image"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Upload Dropzone */
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-5 text-center cursor-pointer transition bg-white hover:bg-emerald-50/20 group"
                  >
                    <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-xs font-semibold text-slate-700">
                      Click to choose logo from your device
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Supports PNG, JPG, WebP, SVG (Up to 5MB)
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* URL Input Mode */
              <div className="space-y-2">
                <input
                  type="url"
                  name="logoUrl"
                  value={formData.logoUrl.startsWith('data:') ? '' : formData.logoUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/logo.png"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                />
                {formData.logoUrl && !formData.logoUrl.startsWith('data:') && (
                  <div className="flex items-center space-x-2 pt-1">
                    <img
                      src={formData.logoUrl}
                      alt="Preview"
                      className="w-8 h-8 rounded border border-slate-200 object-contain bg-white"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <span className="text-[11px] text-slate-500">Live URL preview</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Website URL */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Official Website (Optional)
            </label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://startup-website.com"
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          {/* Short Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Description (Optional)
            </label>
            <textarea
              name="description"
              rows="2"
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief summary of edtech platform activities..."
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
            ></textarea>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow-sm hover:shadow transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <span>{initialData ? 'Update Startup' : 'Add Startup'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
