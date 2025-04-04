import React, { useState, useEffect } from 'react';
import { useImageContext } from '../context/ImageContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { formatBytes, formatDate } from '../utils/formatting';
import {
  ChartBarIcon,
  DocumentTextIcon,
  PhotoIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  DocumentIcon,
} from '@heroicons/react/24/outline';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const Analytics = () => {
  const { images, analytics, activityLogs } = useImageContext();
  const [timeRange, setTimeRange] = useState('all'); // 'all', 'week', 'month'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (analytics) {
      setLoading(false);
    }
  }, [analytics]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!images || images.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No Analytics Data Available</h3>
            <p className="mt-2 text-sm text-gray-500">
              Upload and compress some images to see analytics and statistics.
            </p>
            <div className="mt-6">
              <a
                href="/"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Go to Dashboard
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Chart data for compression efficiency
  const compressionData = {
    labels: ['Excellent (≥70%)', 'Good (50-69%)', 'Moderate (30-49%)', 'Low (<30%)'],
    datasets: [
      {
        label: 'Number of Images',
        data: [
          analytics.sizeReductionStats.excellent,
          analytics.sizeReductionStats.good,
          analytics.sizeReductionStats.moderate,
          analytics.sizeReductionStats.low
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',  // green
          'rgba(59, 130, 246, 0.8)', // blue
          'rgba(234, 179, 8, 0.8)',  // yellow
          'rgba(239, 68, 68, 0.8)'   // red
        ],
      }
    ]
  };

  // Chart data for quality distribution
  const qualityData = {
    labels: ['High (≥80%)', 'Medium (50-79%)', 'Low (<50%)'],
    datasets: [
      {
        data: [
          analytics.qualityDistribution.high,
          analytics.qualityDistribution.medium,
          analytics.qualityDistribution.low
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',  // green
          'rgba(59, 130, 246, 0.8)', // blue
          'rgba(234, 179, 8, 0.8)'   // yellow
        ],
      }
    ]
  };

  // Chart data for file type distribution
  const fileTypeData = {
    labels: Object.keys(analytics.fileTypeDistribution),
    datasets: [
      {
        label: 'Number of Images',
        data: Object.values(analytics.fileTypeDistribution),
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',  // green
          'rgba(59, 130, 246, 0.8)', // blue
          'rgba(234, 179, 8, 0.8)',  // yellow
          'rgba(239, 68, 68, 0.8)'   // red
        ],
      }
    ]
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Compression Statistics',
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <div className="flex space-x-4">
            <button
              onClick={() => setTimeRange('all')}
              className={`px-4 py-2 rounded-md ${
                timeRange === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`px-4 py-2 rounded-md ${
                timeRange === 'month'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Last Month
            </button>
            <button
              onClick={() => setTimeRange('week')}
              className={`px-4 py-2 rounded-md ${
                timeRange === 'week'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Last Week
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-50">
                <PhotoIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Images</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics.totalImages}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-50">
                <ChartBarIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Original Size</p>
                <p className="text-2xl font-semibold text-gray-900">{formatBytes(analytics.totalOriginalSize)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-50">
                <ArrowTrendingDownIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Compressed Size</p>
                <p className="text-2xl font-semibold text-gray-900">{formatBytes(analytics.totalCompressedSize)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Compression Efficiency Distribution</h3>
            <div className="h-80">
              <Bar data={compressionData} options={{
                ...chartOptions,
                maintainAspectRatio: false,
                plugins: {
                  ...chartOptions.plugins,
                  legend: {
                    ...chartOptions.plugins.legend,
                    position: 'bottom'
                  }
                }
              }} />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quality Distribution</h3>
            <div className="h-80">
              <Pie data={qualityData} options={{
                ...chartOptions,
                maintainAspectRatio: false,
                plugins: {
                  ...chartOptions.plugins,
                  legend: {
                    ...chartOptions.plugins.legend,
                    position: 'bottom'
                  }
                }
              }} />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">File Type Distribution</h3>
            <div className="h-80">
              <Bar data={fileTypeData} options={{
                ...chartOptions,
                maintainAspectRatio: false,
                plugins: {
                  ...chartOptions.plugins,
                  legend: {
                    ...chartOptions.plugins.legend,
                    position: 'bottom'
                  }
                }
              }} />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Best vs Worst Compression</h3>
            <div className="space-y-6">
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">Best Compression</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Efficiency</p>
                    <p className="text-lg font-semibold text-green-700">{analytics.bestCompression.efficiency}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Quality</p>
                    <p className="text-lg font-semibold text-green-700">{analytics.bestCompression.quality}%</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Size Reduction</p>
                    <p className="text-lg font-semibold text-green-700">
                      {formatBytes(analytics.bestCompression.originalSize - analytics.bestCompression.compressedSize)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <h4 className="font-semibold text-red-800 mb-2">Worst Compression</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Efficiency</p>
                    <p className="text-lg font-semibold text-red-700">{analytics.worstCompression.efficiency}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Quality</p>
                    <p className="text-lg font-semibold text-red-700">{analytics.worstCompression.quality}%</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Size Reduction</p>
                    <p className="text-lg font-semibold text-red-700">
                      {formatBytes(analytics.worstCompression.originalSize - analytics.worstCompression.compressedSize)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Logs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Activity Logs</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activityLogs.map((log, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(log.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.action}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {log.details}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        log.status === 'success' ? 'bg-green-100 text-green-800' :
                        log.status === 'error' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics; 