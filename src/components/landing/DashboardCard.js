import React from 'react';
import styles from './DashboardCard.module.css';

const DashboardCard = () => {
    return (
        <div className={styles.parent}>
            <div className={styles.card}>
                <div className={styles.content_box}>
                    {/* Dashboard Header */}
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl md:text-2xl font-bold text-gray-900">Your Dashboard</h2>
                        <div className="flex items-center space-x-2">
                            <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                            <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full"></div>
                            <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
                        </div>
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-3 gap-4 mb-8">
                        <div className="text-center p-4 bg-blue-50 rounded-xl">
                            <div className="text-3xl font-bold text-blue-600 mb-1">5</div>
                            <div className="text-xs text-gray-500 font-medium">Active</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-xl">
                            <div className="text-3xl font-bold text-green-600 mb-1">12</div>
                            <div className="text-xs text-gray-500 font-medium">Complete</div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-xl">
                            <div className="text-3xl font-bold text-purple-600 mb-1">3</div>
                            <div className="text-xs text-gray-500 font-medium">Upcoming</div>
                        </div>
                    </div>

                    {/* Influencer List */}
                    <div className="mb-8">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">Top Influencers</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-gray-50/80 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center">
                                        <span className="text-purple-600 font-bold text-xs">SJ</span>
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900 text-sm">Sarah J.</div>
                                        <div className="text-xs text-gray-500">Fashion</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-gray-900 text-sm">150K</div>
                                    <div className="text-xs text-green-600 font-medium">5% rate</div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-gray-50/80 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center">
                                        <span className="text-blue-600 font-bold text-xs">MR</span>
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900 text-sm">Mike R.</div>
                                        <div className="text-xs text-gray-500">Tech</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-gray-900 text-sm">80K</div>
                                    <div className="text-xs text-green-600 font-medium">7% rate</div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-gray-50/80 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center">
                                        <span className="text-green-600 font-bold text-xs">AM</span>
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900 text-sm">Alex M.</div>
                                        <div className="text-xs text-gray-500">Fitness</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-gray-900 text-sm">120K</div>
                                    <div className="text-xs text-green-600 font-medium">6% rate</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Stats */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center bg-gray-50 rounded-lg p-2">
                            <div className="text-sm font-bold text-green-600">+15%</div>
                            <div className="text-[10px] text-gray-500 text-uppercase tracking-wider">VIEWS</div>
                        </div>
                        <div className="text-center bg-gray-50 rounded-lg p-2">
                            <div className="text-sm font-bold text-blue-600">+8%</div>
                            <div className="text-[10px] text-gray-500 text-uppercase tracking-wider">LIKES</div>
                        </div>
                        <div className="text-center bg-gray-50 rounded-lg p-2">
                            <div className="text-sm font-bold text-purple-600">+12%</div>
                            <div className="text-[10px] text-gray-500 text-uppercase tracking-wider">SALES</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardCard;
