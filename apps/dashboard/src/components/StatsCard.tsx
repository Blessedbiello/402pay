interface StatsCardProps {
  title: string;
  value: string;
  subtitle: string;
  trend?: string;
  trendUp?: boolean;
}

export default function StatsCard({
  title,
  value,
  subtitle,
  trend,
  trendUp = true,
}: StatsCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</h3>
        {trend && (
          <span
            className={`text-sm font-medium ${
              trendUp ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}
          >
            {trend}
          </span>
        )}
      </div>
      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">{value}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
    </div>
  );
}
