'use client';
import { useState } from 'react';

export default function InfluencerScout() {
    const [filters, setFilters] = useState({
        region: '',
        niche: '',
        platform: [],
        minFollowers: 0,
        minER: 0,
    });
    const [searchTag, setSearchTag] = useState('');
    const [results, setResults] = useState([]); // Real data
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [error, setError] = useState('');

    // Filter Logic (Client-side)
    const filteredResults = results.filter(inf => {
        // Filter by Region (if data has region, currently API defaults to "Global")
        if (filters.region && inf.region !== filters.region && inf.region !== 'Global') return false;

        // Filter by Niche (rough match)
        if (filters.niche && !inf.niche.toLowerCase().includes(filters.niche.toLowerCase())) return false;

        // Filter by Platform (Logic placeholder as API currently only does Instagram)
        if (filters.platform.length > 0 && !filters.platform.includes('Instagram')) return false;

        // Filter by Followers
        if (inf.followers_count < filters.minFollowers) return false;

        // Filter by ER
        const infEr = parseFloat(inf.er.replace('%', ''));
        if (infEr < filters.minER) return false;

        return true;
    });

    const handleSearch = async () => {
        if (!searchTag) return;
        setLoading(true);
        setError('');
        setHasSearched(true);
        setResults([]);

        try {
            const res = await fetch(`/api/meta/hashtag-search?q=${encodeURIComponent(searchTag)}`);
            const data = await res.json();

            if (data.error) {
                setError(data.error);
            } else {
                setResults(data.data || []);
            }
        } catch (err) {
            setError('Failed to fetch influencers. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const togglePlatform = (p) => {
        setFilters(prev => ({
            ...prev,
            platform: prev.platform.includes(p)
                ? prev.platform.filter(x => x !== p)
                : [...prev.platform, p]
        }));
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6">
            {/* LEFT SIDEBAR: FILTERS */}
            <div className="w-full lg:w-1/4 bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-[#343C6A]">Filters</h3>
                    <button onClick={() => setFilters({ region: '', niche: '', platform: [], minFollowers: 0, minER: 0 })} className="text-xs text-blue-500 hover:underline">Reset</button>
                </div>

                {/* Region Filter */}
                <div className="mb-6">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Region</label>
                    <select
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#343C6A] outline-none"
                        value={filters.region}
                        onChange={(e) => setFilters({ ...filters, region: e.target.value })}
                    >
                        <option value="">All Regions</option>
                        <option value="Saudi Arabia">Saudi Arabia</option>
                        <option value="UAE">UAE</option>
                        <option value="Egypt">Egypt</option>
                        <option value="Qatar">Qatar</option>
                        <option value="Kuwait">Kuwait</option>
                    </select>
                </div>

                {/* Niche Filter */}
                <div className="mb-6">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Niche</label>
                    <div className="space-y-2">
                        {['Fashion', 'Tech', 'Food', 'Travel', 'Fitness', 'Gaming', 'Lifestyle'].map(niche => (
                            <label key={niche} className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="niche"
                                    checked={filters.niche === niche}
                                    onChange={() => setFilters({ ...filters, niche: niche })}
                                    className="form-radio text-[#343C6A] h-4 w-4"
                                />
                                <span className="text-sm text-gray-700">{niche}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Platform Filter */}
                <div className="mb-6">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Platform</label>
                    <div className="flex flex-wrap gap-2">
                        {['Instagram', 'TikTok', 'YouTube', 'Snapchat'].map(p => (
                            <button
                                key={p}
                                onClick={() => togglePlatform(p)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filters.platform.includes(p)
                                    ? 'bg-[#343C6A] text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Sliders */}
                <div className="mb-6">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Min Followers</label>
                    <input
                        type="range" min="0" max="1000000" step="10000"
                        value={filters.minFollowers}
                        onChange={(e) => setFilters({ ...filters, minFollowers: Number(e.target.value) })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#343C6A]"
                    />
                    <div className="text-right text-xs text-gray-500 mt-1">{filters.minFollowers.toLocaleString()}+</div>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Min Engagement Rate</label>
                    <input
                        type="range" min="0" max="10" step="0.5"
                        value={filters.minER}
                        onChange={(e) => setFilters({ ...filters, minER: Number(e.target.value) })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#343C6A]"
                    />
                    <div className="text-right text-xs text-gray-500 mt-1">{filters.minER}%+</div>
                </div>
            </div>

            {/* RIGHT MAIN: SEARCH & GRID */}
            <div className="flex-1">
                {/* Search Bar */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex items-center gap-4">
                    <div className="bg-gray-100 p-2 rounded-lg text-gray-500">#</div>
                    <input
                        type="text"
                        placeholder="Search hashtags (e.g., #saudifashion, #dubaitips)..."
                        className="flex-1 bg-transparent border-none outline-none text-gray-700 placeholder-gray-400 font-medium"
                        value={searchTag}
                        onChange={(e) => setSearchTag(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button
                        onClick={handleSearch}
                        disabled={loading}
                        className="bg-[#343C6A] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#2a3055] transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Scouting...' : 'Scout'}
                    </button>
                </div>

                {/* Results Stats */}
                <div className="flex justify-between items-center mb-4 px-1">
                    <div className="text-sm text-gray-500">Found <span className="font-bold text-[#343C6A]">{filteredResults.length}</span> matches</div>
                    <div className="text-sm text-gray-500">Sorted by: <span className="font-medium text-gray-700 cursor-pointer">Relevance</span></div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center items-center py-20">
                        <div className="h-10 w-10 border-4 border-[#343C6A] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm">
                        {error}
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && hasSearched && filteredResults.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                        <p className="text-gray-500">No influencers found for this hashtag with current filters.</p>
                    </div>
                )}

                {/* Welcome State */}
                {!hasSearched && (
                    <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                        <p className="text-gray-500">Enter a hashtag to start scouting influencers.</p>
                    </div>
                )}

                {/* Cards Grid */}
                {!loading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredResults.map(influencer => (
                            <div key={influencer.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow relative group">
                                {influencer.is_anonymous && (
                                    <div className="absolute top-2 right-2 text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity" title="User details hidden by Meta Privacy Policy">
                                        Privacy Protected
                                    </div>
                                )}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                                            {influencer.profile_picture_url ? (
                                                <img src={influencer.profile_picture_url} alt={influencer.username} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                        <div className="overflow-hidden">
                                            <h4 className="font-bold text-gray-800 text-sm truncate max-w-[120px]" title={influencer.name || "Instagram User"}>
                                                {influencer.name || <span className="italic font-normal text-gray-500">Instagram User</span>}
                                            </h4>
                                            <p className="text-xs text-gray-500 truncate">
                                                {influencer.username ? `@${influencer.username}` : <span className="text-gray-400">@hidden_user</span>}
                                            </p>
                                        </div>
                                    </div>
                                    {!influencer.is_anonymous && (
                                        <div className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide truncate max-w-[60px]">
                                            {influencer.niche}
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-2 mb-4">
                                    <div className="bg-gray-50 p-2 rounded text-center">
                                        <div className="text-xs text-gray-500">Followers</div>
                                        <div className="font-bold text-gray-800">{influencer.followers_display}</div>
                                    </div>
                                    <div className="bg-gray-50 p-2 rounded text-center">
                                        <div className="text-xs text-gray-500">{influencer.is_eng_raw ? "Engagement" : "Eng. Rate"}</div>
                                        <div className="font-bold text-green-600">
                                            {influencer.er}{influencer.is_eng_raw ? '' : '%'}
                                        </div>
                                    </div>
                                </div>

                                {/* Caption Preview for Context */}
                                {influencer.caption && (
                                    <div className="mb-4">
                                        <p className="text-xs text-gray-500 line-clamp-2 italic">"{influencer.caption}"</p>
                                    </div>
                                )}

                                <div className="mt-auto">
                                    {influencer.media_url && (
                                        <div className="mb-3 rounded-lg overflow-hidden h-32 w-full bg-gray-100">
                                            {/* Show the scouted media */}
                                            {influencer.media_url.includes('.mp4') ? (
                                                <video src={influencer.media_url} muted className="w-full h-full object-cover" />
                                            ) : (
                                                <img src={influencer.media_url} alt="Post" className="w-full h-full object-cover" />
                                            )}
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between text-xs text-gray-500 border-t pt-3 mt-2">
                                        <div className="flex items-center gap-1">
                                            <span>📍</span> {influencer.region}
                                        </div>
                                        <a
                                            href={influencer.permalink || `https://instagram.com/${influencer.username}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[#343C6A] font-semibold hover:underline flex items-center gap-1"
                                        >
                                            {influencer.is_anonymous ? "View Post" : "View Profile"}
                                            <span>→</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
