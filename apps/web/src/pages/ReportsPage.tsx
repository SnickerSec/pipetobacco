import { useState, useEffect } from 'react';
import { api, Report } from '../services/api';

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    loadReports();
  }, [statusFilter]);

  const loadReports = async () => {
    try {
      setIsLoading(true);
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      const data = await api.getReports(params);
      setReports(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load reports');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (reportId: string, status: 'PENDING' | 'REVIEWED' | 'RESOLVED' | 'DISMISSED') => {
    try {
      await api.updateReportStatus(reportId, status);
      await loadReports();
    } catch (err: any) {
      alert(err.message || 'Failed to update report status');
      console.error(err);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return;

    try {
      await api.deleteReport(reportId);
      await loadReports();
    } catch (err: any) {
      alert(err.message || 'Failed to delete report');
      console.error(err);
    }
  };

  const getReasonLabel = (reason: string) => {
    switch (reason) {
      case 'SPAM': return 'Spam';
      case 'HARASSMENT': return 'Harassment';
      case 'INAPPROPRIATE_CONTENT': return 'Inappropriate Content';
      case 'MISINFORMATION': return 'Misinformation';
      case 'OTHER': return 'Other';
      default: return reason;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Pending</span>;
      case 'REVIEWED':
        return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">Reviewed</span>;
      case 'RESOLVED':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Resolved</span>;
      case 'DISMISSED':
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">Dismissed</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">{status}</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <p className="mt-2 text-gray-600">Review and manage user reports</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setStatusFilter('')}
          className={`px-4 py-2 rounded-lg ${
            statusFilter === '' ? 'bg-ember-600 text-white' : 'bg-white text-gray-700 border border-gray-300'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setStatusFilter('PENDING')}
          className={`px-4 py-2 rounded-lg ${
            statusFilter === 'PENDING' ? 'bg-ember-600 text-white' : 'bg-white text-gray-700 border border-gray-300'
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => setStatusFilter('REVIEWED')}
          className={`px-4 py-2 rounded-lg ${
            statusFilter === 'REVIEWED' ? 'bg-ember-600 text-white' : 'bg-white text-gray-700 border border-gray-300'
          }`}
        >
          Reviewed
        </button>
        <button
          onClick={() => setStatusFilter('RESOLVED')}
          className={`px-4 py-2 rounded-lg ${
            statusFilter === 'RESOLVED' ? 'bg-ember-600 text-white' : 'bg-white text-gray-700 border border-gray-300'
          }`}
        >
          Resolved
        </button>
        <button
          onClick={() => setStatusFilter('DISMISSED')}
          className={`px-4 py-2 rounded-lg ${
            statusFilter === 'DISMISSED' ? 'bg-ember-600 text-white' : 'bg-white text-gray-700 border border-gray-300'
          }`}
        >
          Dismissed
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-ember-600"></div>
          <p className="mt-2 text-gray-600">Loading reports...</p>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Reports List */}
      {!isLoading && !error && reports.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg">
          <p className="text-gray-600">No reports found</p>
        </div>
      )}

      {!isLoading && !error && reports.length > 0 && (
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report.id} className="bg-white rounded-lg shadow p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {getReasonLabel(report.reason)}
                    </h3>
                    {getStatusBadge(report.status)}
                  </div>
                  <p className="text-sm text-gray-500">
                    Reported by{' '}
                    <a href={`/u/${report.reporter.username}`} className="text-ember-600 hover:underline">
                      @{report.reporter.username}
                    </a>
                    {' '}&bull;{' '}
                    {new Date(report.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Description */}
              {report.description && (
                <div className="mb-4">
                  <p className="text-gray-700">{report.description}</p>
                </div>
              )}

              {/* Reported Content */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Reported Content:</h4>

                {/* Reported User */}
                {report.reportedUser && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <img
                      src={
                        report.reportedUser.avatarUrl ||
                        `https://ui-avatars.com/api/?name=${report.reportedUser.displayName || report.reportedUser.username}&size=40&background=ea580c&color=fff`
                      }
                      alt={report.reportedUser.displayName || report.reportedUser.username}
                      className="h-10 w-10 rounded-full"
                    />
                    <div>
                      <p className="font-medium text-gray-900">
                        {report.reportedUser.displayName || report.reportedUser.username}
                      </p>
                      <p className="text-sm text-gray-600">@{report.reportedUser.username}</p>
                    </div>
                    <a
                      href={`/u/${report.reportedUser.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto text-sm text-ember-600 hover:underline"
                    >
                      View Profile
                    </a>
                  </div>
                )}

                {/* Reported Post */}
                {report.reportedPost && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700 mb-2">{report.reportedPost.content}</p>
                    <p className="text-xs text-gray-500">
                      Posted by @{report.reportedPost.author.username}
                    </p>
                  </div>
                )}

                {/* Reported Comment */}
                {report.reportedComment && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700 mb-2">{report.reportedComment.content}</p>
                    <p className="text-xs text-gray-500">
                      Comment by @{report.reportedComment.author.username}
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4">
                {report.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(report.id, 'REVIEWED')}
                      className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Mark as Reviewed
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(report.id, 'RESOLVED')}
                      className="px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Resolve
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(report.id, 'DISMISSED')}
                      className="px-3 py-1.5 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
                    >
                      Dismiss
                    </button>
                  </>
                )}
                {report.status === 'REVIEWED' && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(report.id, 'RESOLVED')}
                      className="px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Resolve
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(report.id, 'DISMISSED')}
                      className="px-3 py-1.5 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
                    >
                      Dismiss
                    </button>
                  </>
                )}
                {(report.status === 'RESOLVED' || report.status === 'DISMISSED') && (
                  <button
                    onClick={() => handleUpdateStatus(report.id, 'PENDING')}
                    className="px-3 py-1.5 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700"
                  >
                    Reopen
                  </button>
                )}
                <button
                  onClick={() => handleDeleteReport(report.id)}
                  className="px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700 ml-auto"
                >
                  Delete Report
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
