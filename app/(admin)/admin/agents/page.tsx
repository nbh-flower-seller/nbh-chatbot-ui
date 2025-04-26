import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AgentsPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Agents</h1>
        
        <Button asChild>
          <Link href="/admin/agents/create">Create New Agent</Link>
        </Button>
      </div>
      
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow">
        <div className="grid grid-cols-12 gap-4 p-4 font-medium text-zinc-500 dark:text-zinc-400 border-b dark:border-zinc-700">
          <div className="col-span-4">Agent Name</div>
          <div className="col-span-3">Last Updated</div>
          <div className="col-span-2">Documents</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-1">Actions</div>
        </div>
        
        {agents.map((agent) => (
          <div 
            key={agent.id}
            className="grid grid-cols-12 gap-4 p-4 items-center border-b last:border-b-0 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-750"
          >
            <div className="col-span-4">
              <div className="font-medium">{agent.name}</div>
              <div className="text-sm text-zinc-500">{agent.description}</div>
            </div>
            <div className="col-span-3 text-zinc-600 dark:text-zinc-300">{agent.lastUpdated}</div>
            <div className="col-span-2">{agent.documentCount}</div>
            <div className="col-span-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                agent.status === 'Active' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-500' 
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-500'
              }`}>
                {agent.status}
              </span>
            </div>
            <div className="col-span-1 flex space-x-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/agents/${agent.id}`}>Edit</Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Sample data
const agents = [
  {
    id: '1',
    name: 'Customer Support',
    description: 'Handles customer inquiries and troubleshooting',
    lastUpdated: 'Aug 15, 2023',
    documentCount: 24,
    status: 'Active'
  },
  {
    id: '2',
    name: 'Sales Assistant',
    description: 'Provides product information and handles sales inquiries',
    lastUpdated: 'Sep 2, 2023',
    documentCount: 15,
    status: 'Active'
  },
  {
    id: '3',
    name: 'HR Assistant',
    description: 'Answers questions about company policies and benefits',
    lastUpdated: 'Jul 28, 2023',
    documentCount: 8,
    status: 'Draft'
  }
]; 