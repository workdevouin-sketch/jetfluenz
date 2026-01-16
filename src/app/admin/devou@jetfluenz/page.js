'use client'

import { useState, useEffect } from 'react';
import { Instagram, Globe, Phone, Mail, Eye, Edit2, Trash2 } from 'lucide-react';
import { getWaitlistUsers, updateWaitlistUser, deleteWaitlistUser, addUserFromAdmin } from '../../../lib/waitlist';

export default function AdminWaitlist() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    influencers: 0,
    businesses: 0
  });

  // CRUD state management
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    role: 'influencer',
    instagram: '',
    phone: '',
    status: 'waitlist'
  });
  const [formErrors, setFormErrors] = useState({});
  const [actionLoading, setActionLoading] = useState(false);

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'jetfluenz2026') {
      setIsAuthenticated(true);
      setAuthError('');
      localStorage.setItem('adminAuthenticated', 'true'); // Persist login
      fetchWaitlistUsers();
    } else {
      setAuthError('Incorrect password');
    }
  };

  useEffect(() => {
    // Check local storage on mount
    const isAuth = localStorage.getItem('adminAuthenticated');
    if (isAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchWaitlistUsers();
    }
  }, [isAuthenticated]);

  const fetchWaitlistUsers = async () => {
    setLoading(true);
    try {
      const result = await getWaitlistUsers();

      if (result.success) {
        setUsers(result.users);

        // Calculate stats
        const total = result.users.length;
        const influencers = result.users.filter(user => user.role === 'influencer').length;
        const businesses = result.users.filter(user => user.role === 'business').length;

        setStats({ total, influencers, businesses });
      } else {
        setError(result.error || 'Failed to fetch data');
      }
    } catch (err) {
      setError('An error occurred while fetching data');
    } finally {
      setLoading(false);
    }
  };

  // Form validation
  const validateForm = () => {
    const errors = {};

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }

    if (!formData.role) {
      errors.role = 'Role is required';
    }

    // Instagram URL validation (optional but if provided, should be valid)
    if (formData.instagram && !formData.instagram.match(/^https?:\/\/.+/)) {
      errors.instagram = 'Please enter a valid URL';
    }

    // Phone number validation (optional but if provided, should be valid)
    if (formData.phone && !formData.phone.match(/^[\+]?[1-9][\d]{0,15}$/)) {
      errors.phone = 'Please enter a valid phone number';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      email: '',
      role: 'influencer',
      instagram: '',
      phone: '',
      status: 'waitlist'
    });
    setFormErrors({});
    setEditingUser(null);
    setShowAddForm(false);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Add new user
  const handleAddUser = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setActionLoading(true);
    try {
      const result = await addUserFromAdmin(formData);

      if (result.success) {
        await fetchWaitlistUsers();
        resetForm();
        setError('');
      } else {
        setError(result.error || 'Failed to add user');
      }
    } catch (err) {
      setError('An error occurred while adding user');
    } finally {
      setActionLoading(false);
    }
  };

  // Edit user
  const handleEditUser = (user) => {
    setEditingUser(user);
    setFormData({
      email: user.email || '',
      role: user.role || 'influencer',
      instagram: user.instagram || '',
      phone: user.phone || '',
      status: user.status || 'waitlist'
    });
    setShowAddForm(true);
  };

  // Update user
  const handleUpdateUser = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setActionLoading(true);
    try {
      const result = await updateWaitlistUser(editingUser.id, formData);

      if (result.success) {
        await fetchWaitlistUsers();
        resetForm();
        setError('');
      } else {
        setError(result.error || 'Failed to update user');
      }
    } catch (err) {
      setError('An error occurred while updating user');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete user
  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    setActionLoading(true);
    try {
      const result = await deleteWaitlistUser(userId);

      if (result.success) {
        await fetchWaitlistUsers();
        setError('');
      } else {
        setError(result.error || 'Failed to delete user');
      }
    } catch (err) {
      setError('An error occurred while deleting user');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return 'N/A';

    // Handle Firestore Timestamp (has seconds property)
    if (dateValue?.seconds) {
      return new Date(dateValue.seconds * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }

    // Handle standard string/date
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return 'Invalid Date';

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Details Modal State
  const [viewingUser, setViewingUser] = useState(null);

  const exportToCSV = () => {
    // Define all possible headers
    const headers = [
      'Email', 'Role', 'Status', 'Submitted At',
      // Influencer Fields
      'Name', 'Phone', 'Instagram', 'Followers', 'Engagement', 'Niche', 'Age', 'Location', 'Portfolio', 'Campaign Types',
      // Business Fields
      'Company Name', 'Contact Person', 'Industry', 'Website', 'Social/LinkedIn'
    ];

    const csvContent = [
      headers,
      ...users.map(user => [
        user.email || 'N/A',
        user.role,
        user.status,
        user.submittedAt || 'N/A',
        // Influencer
        user.name || 'N/A',
        user.phone || 'N/A',
        user.instagram || 'N/A',
        user.followers || 'N/A',
        user.engagement || 'N/A',
        user.niche || 'N/A',
        user.age || 'N/A',
        user.location || 'N/A',
        user.portfolio || 'N/A',
        user.campaignTypes || 'N/A',
        // Business
        user.companyName || 'N/A',
        user.contactPerson || 'N/A',
        user.industry || 'N/A',
        user.website || 'N/A',
        user.social || 'N/A'
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n'); // Quote cells to handle commas

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jetfluenz-waitlist-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Admin Login</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Enter admin password"
                autoFocus
              />
            </div>
            {authError && (
              <p className="text-red-500 text-sm">{authError}</p>
            )}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Access Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading waitlist data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Jetfluenz Admin</h1>
              <p className="text-gray-600">Waitlist Management Dashboard</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add User</span>
              </button>
              <button
                onClick={exportToCSV}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Export CSV</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Influencers</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.influencers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Businesses</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.businesses}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Waitlist Users</h2>
          </div>

          {users.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No users on the waitlist yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Identity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{user.email || 'N/A'}</div>
                        <div className="text-xs text-gray-500">
                          {user.role === 'influencer' ? user.name : user.companyName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.role === 'influencer'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-green-100 text-green-800'
                          }`}>
                          {user.role === 'influencer' ? 'Influencer' : 'Business'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.phone ? (
                          <a
                            href={`tel:${user.phone}`}
                            className="text-gray-600 hover:text-blue-600 flex items-center transition-colors"
                          >
                            <Phone size={14} className="mr-2" />
                            {user.phone}
                          </a>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          {user.status || 'Waitlist'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.submittedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setViewingUser(user)}
                            className="text-blue-600 hover:text-blue-900 transition-colors p-1"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleEditUser(user)}
                            className="text-indigo-600 hover:text-indigo-900 transition-colors p-1"
                            disabled={actionLoading}
                            title="Edit"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-900 transition-colors p-1"
                            disabled={actionLoading}
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Refresh Button */}
        <div className="mt-6 text-center">
          <button
            onClick={fetchWaitlistUsers}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Refresh Data
          </button>
        </div>
      </div>

      {/* View Details Modal */}
      {viewingUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6 border-b pb-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">User Details</h3>
                  <p className="text-sm text-gray-500">Submitted: {formatDate(viewingUser.submittedAt)}</p>
                </div>
                <button onClick={() => setViewingUser(null)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Core Info */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-blue-600 border-b border-blue-100 pb-1">Identity</h4>
                  <DetailRow label="Role" value={viewingUser.role} />
                  <DetailRow label="Email" value={viewingUser.email} />
                  {viewingUser.role === 'influencer' ? (
                    <>
                      <DetailRow label="Full Name" value={viewingUser.name} />
                      <DetailRow label="Phone" value={viewingUser.phone} />
                      <DetailRow label="Location" value={viewingUser.location} />
                      <DetailRow label="Age Group" value={viewingUser.age} />
                    </>
                  ) : (
                    <>
                      <DetailRow label="Company" value={viewingUser.companyName} />
                      <DetailRow label="Contact Person" value={viewingUser.contactPerson} />
                      <DetailRow label="Phone" value={viewingUser.phone} />
                    </>
                  )}
                </div>

                {/* Profile Info */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-purple-600 border-b border-purple-100 pb-1">Profile & Social</h4>
                  {viewingUser.role === 'influencer' ? (
                    <>
                      <DetailRow label="Instagram" value={viewingUser.instagram} isLink />
                      <DetailRow label="Followers" value={viewingUser.followers} />
                      <DetailRow label="Engagement" value={viewingUser.engagement} />
                      <DetailRow label="Niche" value={viewingUser.niche} />
                      <DetailRow label="Portfolio" value={viewingUser.portfolio} isLink />
                      <DetailRow label="Campaign Types" value={viewingUser.campaignTypes} />
                    </>
                  ) : (
                    <>
                      <DetailRow label="Industry" value={viewingUser.industry} />
                      <DetailRow label="Website" value={viewingUser.website} isLink />
                      <DetailRow label="Social/LinkedIn" value={viewingUser.social} isLink />
                    </>
                  )}
                </div>
              </div>

              <div className="mt-8 pt-4 border-t flex justify-end">
                <button
                  onClick={() => setViewingUser(null)}
                  className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit User Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4 text-black">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingUser ? 'Edit User' : 'Add New User'}
                </h3>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={editingUser ? handleUpdateUser : handleAddUser} className="space-y-4">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm text-black focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${formErrors.email ? 'border-red-300' : 'border-gray-300'
                      }`}
                    placeholder="user@example.com"
                  />
                  {formErrors.email && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                  )}
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role *</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className={`mt-1 block text-black  w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${formErrors.role ? 'border-red-300' : 'border-gray-300'
                      }`}
                  >
                    <option value="influencer">Influencer</option>
                    <option value="business">Business</option>
                  </select>
                  {formErrors.role && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.role}</p>
                  )}
                </div>

                {/* Instagram URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Instagram URL</label>
                  <input
                    type="url"
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleInputChange}
                    className={`mt-1 block text-black  w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${formErrors.instagram ? 'border-red-300' : 'border-gray-300'
                      }`}
                    placeholder="https://instagram.com/username"
                  />
                  {formErrors.instagram && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.instagram}</p>
                  )}
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`mt-1 block text-black w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${formErrors.phone ? 'border-red-300' : 'border-gray-300'
                      }`}
                    placeholder="+1234567890"
                  />
                  {formErrors.phone && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>
                  )}
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 ">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="mt-1 block w-full text-black px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="waitlist">Waitlist</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {actionLoading ? 'Processing...' : (editingUser ? 'Update User' : 'Add User')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper component for detail rows
const DetailRow = ({ label, value, isLink }) => {
  if (!value) return null;
  return (
    <div className="flex flex-col">
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</span>
      {isLink ? (
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm truncate">
          {value}
        </a>
      ) : (
        <span className="text-gray-900 text-sm">{value}</span>
      )}
    </div>
  );
};
