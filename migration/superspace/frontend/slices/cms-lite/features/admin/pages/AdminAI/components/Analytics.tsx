import { useState, useEffect } from "react";
import { useBackend } from "../../../../../shared/hooks/useBackend";
import { LoadingSpinner as Loading } from "../../../../../shared/components/Loading";
import { ErrorState } from "../../../../../shared/components/ErrorState";
import { formatDistanceToNow } from "../../../../../shared/utils/format";

export default function AdminAIAnalytics() {
  const backend = useBackend();
  const [stats, setStats] = useState<any>(null);
  const [errors, setErrors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorLimit, setErrorLimit] = useState(50);

  useEffect(() => {
    loadData();
  }, [errorLimit]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, errorsData] = await Promise.all([
        backend.ai.getStats(),
        backend.ai.getErrors({ limit: errorLimit || 50 }),
      ]);
      setStats(statsData);
      setErrors(errorsData.errors);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={loadData} />;

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">AI Analytics</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Requests</div>
            <div className="text-3xl font-bold mt-2">{stats?.totalRequests || 0}</div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
            <div className="text-sm text-gray-600 dark:text-gray-400">Rate Limited</div>
            <div className="text-3xl font-bold mt-2 text-red-600">{stats?.rateLimitedRequests || 0}</div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
            <div className="text-sm text-gray-600 dark:text-gray-400">Avg Message Length</div>
            <div className="text-3xl font-bold mt-2">{stats?.averageMessageLength || 0}</div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
            <div className="text-sm text-gray-600 dark:text-gray-400">Avg Response Length</div>
            <div className="text-3xl font-bold mt-2">{stats?.averageResponseLength || 0}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
          <h2 className="text-xl font-bold mb-4">Requests by Locale</h2>
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(stats?.requestsByLocale || {}).map(([locale, count]) => (
              <div key={locale} className="border p-4 rounded">
                <div className="text-sm text-gray-600 dark:text-gray-400">{locale.toUpperCase()}</div>
                <div className="text-2xl font-bold">{count as number}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
          <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">User</th>
                  <th className="text-left py-2">Message</th>
                  <th className="text-left py-2">Response</th>
                  <th className="text-left py-2">Refs</th>
                  <th className="text-left py-2">Locale</th>
                  <th className="text-left py-2">Limited</th>
                  <th className="text-left py-2">Time</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentActivity?.slice(0, 10).map((activity: any) => (
                  <tr key={activity.id} className="border-b">
                    <td className="py-2">{activity.userId}</td>
                    <td className="py-2">{activity.messageLength}</td>
                    <td className="py-2">{activity.responseLength}</td>
                    <td className="py-2">{activity.referencesCount}</td>
                    <td className="py-2">{activity.locale}</td>
                    <td className="py-2">{activity.rateLimited ? "Yes" : "No"}</td>
                    <td className="py-2 text-sm text-gray-600">
                      {formatDistanceToNow(new Date(activity.createdAt))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Recent Errors</h2>
            <select
              value={errorLimit}
              onChange={(e) => setErrorLimit(Number(e.target.value))}
              className="border rounded px-3 py-1"
            >
              <option value={10}>10</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
          <div className="space-y-3">
            {errors.map((err) => (
              <div key={err.id} className="border p-4 rounded">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-red-600">{err.errorType}</div>
                    <div className="text-sm mt-1">{err.errorMessage}</div>
                    {err.userMessage && (
                      <div className="text-sm text-gray-600 mt-2">
                        <strong>User message:</strong> {err.userMessage}
                      </div>
                    )}
                    <div className="text-xs text-gray-500 mt-2">
                      {err.locale} • {formatDistanceToNow(new Date(err.createdAt))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
  );
}
