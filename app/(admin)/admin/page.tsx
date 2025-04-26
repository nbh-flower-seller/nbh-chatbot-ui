import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Agents Card */}
        <DashboardCard 
          title="Agents"
          description="Manage RAG chatbot agents and their documents"
          href="/admin/agents"
          count={3}
        />
        
        {/* Users Card */}
        <DashboardCard 
          title="Users"
          description="Manage user accounts and permissions"
          href="/admin/users"
          count={12}
        />
        
        {/* Usage Card */}
        <DashboardCard 
          title="Usage Analytics"
          description="View token usage and API costs"
          href="/admin/usage"
          count={null}
          metric="$24.50 spent this month"
        />
      </div>
      
      {/* Recent Activity Section */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div 
                key={index}
                className="flex items-start pb-4 border-b last:border-0 dark:border-zinc-700"
              >
                <div className="h-2 w-2 mt-2 rounded-full bg-blue-500 mr-3"></div>
                <div>
                  <p className="text-zinc-900 dark:text-zinc-100">{activity.message}</p>
                  <p className="text-sm text-zinc-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardCard({ 
  title, 
  description, 
  href, 
  count = null,
  metric = null 
}: { 
  title: string;
  description: string;
  href: string;
  count?: number | null;
  metric?: string | null;
}) {
  return (
    <Link 
      href={href}
      className="block bg-white dark:bg-zinc-800 rounded-lg shadow p-6 transition-transform hover:scale-[1.02]"
    >
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-zinc-500 dark:text-zinc-400 mb-4">{description}</p>
      
      <div className="mt-auto">
        {count !== null && (
          <span className="text-3xl font-bold">{count}</span>
        )}
        {metric && (
          <span className="text-lg font-medium text-zinc-700 dark:text-zinc-300">{metric}</span>
        )}
      </div>
    </Link>
  );
}

// Sample data
const recentActivities = [
  {
    message: "New agent 'Sales Assistant' created by admin",
    time: "2 hours ago"
  },
  {
    message: "User bruce@example.com updated their profile",
    time: "5 hours ago"
  },
  {
    message: "Monthly usage report generated",
    time: "1 day ago"
  },
  {
    message: "10 new documents uploaded to Product Support agent",
    time: "2 days ago"
  }
]; 