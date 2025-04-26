'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function UsagePage() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Usage Analytics</h1>
        
        <div className="flex space-x-2">
          <Button 
            variant={timeRange === '7d' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setTimeRange('7d')}
          >
            Last 7 days
          </Button>
          <Button 
            variant={timeRange === '30d' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setTimeRange('30d')}
          >
            Last 30 days
          </Button>
          <Button 
            variant={timeRange === '90d' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setTimeRange('90d')}
          >
            Last 90 days
          </Button>
        </div>
      </div>
      
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Cost" 
          value={`$${timeRange === '7d' ? '8.45' : timeRange === '30d' ? '24.50' : '62.80'}`} 
          change={timeRange === '7d' ? '+12%' : timeRange === '30d' ? '+8%' : '+15%'} 
          type="currency"
        />
        <StatCard 
          title="Total Tokens" 
          value={timeRange === '7d' ? '843,250' : timeRange === '30d' ? '2,450,500' : '6,280,120'} 
          change={timeRange === '7d' ? '+15%' : timeRange === '30d' ? '+10%' : '+22%'} 
          type="number"
        />
        <StatCard 
          title="API Calls" 
          value={timeRange === '7d' ? '1,230' : timeRange === '30d' ? '5,845' : '14,560'} 
          change={timeRange === '7d' ? '+8%' : timeRange === '30d' ? '+12%' : '+18%'} 
          type="number"
        />
        <StatCard 
          title="Active Users" 
          value={timeRange === '7d' ? '45' : timeRange === '30d' ? '68' : '92'} 
          change={timeRange === '7d' ? '+5%' : timeRange === '30d' ? '+14%' : '+25%'} 
          type="number"
        />
      </div>
      
      {/* Model Usage */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Model Usage</h2>
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
          <div className="grid grid-cols-12 gap-4 font-medium text-zinc-500 border-b pb-4 mb-3 dark:border-zinc-700">
            <div className="col-span-4">Model</div>
            <div className="col-span-2">Calls</div>
            <div className="col-span-2">Tokens</div>
            <div className="col-span-2">Cost</div>
            <div className="col-span-2">% of Total</div>
          </div>
          
          {modelUsage.map((model) => (
            <div key={model.name} className="grid grid-cols-12 gap-4 py-3 border-b last:border-b-0 dark:border-zinc-700">
              <div className="col-span-4 font-medium">{model.name}</div>
              <div className="col-span-2">{model.calls}</div>
              <div className="col-span-2">{model.tokens}</div>
              <div className="col-span-2">${model.cost}</div>
              <div className="col-span-2">
                <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${model.percentage}%` }}
                  ></div>
                </div>
                <span className="text-xs mt-1 inline-block">{model.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Agent Usage */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Agent Usage</h2>
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
          <div className="grid grid-cols-12 gap-4 font-medium text-zinc-500 border-b pb-4 mb-3 dark:border-zinc-700">
            <div className="col-span-4">Agent</div>
            <div className="col-span-2">Conversations</div>
            <div className="col-span-2">API Calls</div>
            <div className="col-span-2">Tokens</div>
            <div className="col-span-2">Cost</div>
          </div>
          
          {agentUsage.map((agent) => (
            <div key={agent.name} className="grid grid-cols-12 gap-4 py-3 border-b last:border-b-0 dark:border-zinc-700">
              <div className="col-span-4 font-medium">{agent.name}</div>
              <div className="col-span-2">{agent.conversations}</div>
              <div className="col-span-2">{agent.calls}</div>
              <div className="col-span-2">{agent.tokens}</div>
              <div className="col-span-2">${agent.cost}</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Usage Trend */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Daily Usage Trend</h2>
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6 h-80 flex items-center justify-center">
          <div className="text-zinc-500 text-center">
            <p>Chart visualization would appear here</p>
            <p className="text-sm mt-2">Daily usage metrics over time</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  change,
  type = 'number'
}: { 
  title: string;
  value: string;
  change: string;
  type?: 'number' | 'currency';
}) {
  const isPositiveChange = change.startsWith('+');
  
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
      <h3 className="text-zinc-500 dark:text-zinc-400 text-sm font-medium mb-2">{title}</h3>
      <div className="flex items-end">
        <span className="text-3xl font-bold">{value}</span>
        <span className={`ml-2 text-sm ${isPositiveChange ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
          {change}
        </span>
      </div>
      <div className="text-zinc-500 text-xs mt-2">
        {type === 'currency' ? 'Compared to previous period' : 'vs. previous period'}
      </div>
    </div>
  );
}

// Sample data
const modelUsage = [
  { name: 'GPT-4o', calls: '2,450', tokens: '1,200,500', cost: '15.80', percentage: 65 },
  { name: 'Claude 3 Opus', calls: '1,200', tokens: '800,000', cost: '6.40', percentage: 26 },
  { name: 'Mistral Large', calls: '800', tokens: '450,000', cost: '2.30', percentage: 9 }
];

const agentUsage = [
  { name: 'Customer Support', conversations: '245', calls: '1,230', tokens: '820,500', cost: '10.20' },
  { name: 'Sales Assistant', conversations: '180', calls: '890', tokens: '620,000', cost: '8.30' },
  { name: 'HR Assistant', conversations: '120', calls: '580', tokens: '420,000', cost: '6.00' }
]; 