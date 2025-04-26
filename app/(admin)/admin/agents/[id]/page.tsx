import { Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AgentDetailPageProps {
  params: {
    id: string;
  };
}

export default function AgentDetailPage({ params }: AgentDetailPageProps) {
  const agentId = params.id;
  
  // In a real app, you would fetch agent data based on agentId
  const agent = {
    id: agentId,
    name: 'Customer Support',
    description: 'Handles customer inquiries and troubleshooting',
    prompt: 'You are a helpful customer support agent for our product.',
    documentCount: 24,
    status: 'Active',
    createdAt: 'July 15, 2023',
    updatedAt: 'August 15, 2023'
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <Link 
            href="/admin/agents" 
            className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300 mb-2 inline-block"
          >
            ← Back to Agents
          </Link>
          <h1 className="text-3xl font-bold">{agent.name}</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            {agent.description}
          </p>
        </div>
        
        <div className="space-x-3">
          <Button variant="outline">
            Update Agent
          </Button>
          <Button variant="destructive">
            Delete
          </Button>
        </div>
      </div>
      
      <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <InfoCard label="Status" value={agent.status} />
        <InfoCard label="Documents" value={agent.documentCount.toString()} />
        <InfoCard label="Created" value={agent.createdAt} />
        <InfoCard label="Last Updated" value={agent.updatedAt} />
      </div>
      
      <Tabs defaultValue="documents">
        <TabsList>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="documents" className="pt-6">
          <Suspense fallback={<div>Loading documents...</div>}>
            <DocumentsTab agentId={agentId} />
          </Suspense>
        </TabsContent>
        
        <TabsContent value="settings" className="pt-6">
          <Suspense fallback={<div>Loading settings...</div>}>
            <SettingsTab agent={agent} />
          </Suspense>
        </TabsContent>
        
        <TabsContent value="logs" className="pt-6">
          <Suspense fallback={<div>Loading logs...</div>}>
            <LogsTab agentId={agentId} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white dark:bg-zinc-800 p-4 rounded-lg shadow">
      <div className="text-sm text-zinc-500 dark:text-zinc-400">{label}</div>
      <div className="font-medium text-lg mt-1">{value}</div>
    </div>
  );
}

function DocumentsTab({ agentId }: { agentId: string }) {
  // Sample documents data - in a real app, you would fetch this
  const documents = [
    { id: '1', name: 'Product Manual.pdf', type: 'pdf', size: '2.4 MB', uploadedAt: 'Aug 10, 2023' },
    { id: '2', name: 'Troubleshooting Guide.docx', type: 'docx', size: '1.8 MB', uploadedAt: 'Aug 12, 2023' },
    { id: '3', name: 'FAQ.txt', type: 'txt', size: '245 KB', uploadedAt: 'Aug 15, 2023' },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Documents</h3>
        <Button>
          Upload Document
        </Button>
      </div>
      
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-4 font-medium text-zinc-500 dark:text-zinc-400 border-b dark:border-zinc-700">
          <div className="col-span-5">Name</div>
          <div className="col-span-2">Type</div>
          <div className="col-span-2">Size</div>
          <div className="col-span-2">Uploaded</div>
          <div className="col-span-1">Actions</div>
        </div>
        
        {documents.map((doc) => (
          <div 
            key={doc.id}
            className="grid grid-cols-12 gap-4 p-4 items-center border-b last:border-b-0 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-750"
          >
            <div className="col-span-5 font-medium">{doc.name}</div>
            <div className="col-span-2 uppercase text-xs">{doc.type}</div>
            <div className="col-span-2">{doc.size}</div>
            <div className="col-span-2">{doc.uploadedAt}</div>
            <div className="col-span-1">
              <Button variant="ghost" size="sm">
                Delete
              </Button>
            </div>
          </div>
        ))}

        {documents.length === 0 && (
          <div className="p-8 text-center text-zinc-500">
            No documents uploaded yet.
          </div>
        )}
      </div>
    </div>
  );
}

function SettingsTab({ agent }: { agent: any }) {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-6">Agent Settings</h3>
      
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6 space-y-6">
        <div>
          <label className="block mb-2 font-medium">Agent Name</label>
          <input 
            type="text" 
            defaultValue={agent.name}
            className="w-full p-2 border rounded-md dark:bg-zinc-900 dark:border-zinc-700"
          />
        </div>
        
        <div>
          <label className="block mb-2 font-medium">Description</label>
          <input 
            type="text" 
            defaultValue={agent.description}
            className="w-full p-2 border rounded-md dark:bg-zinc-900 dark:border-zinc-700"
          />
        </div>
        
        <div>
          <label className="block mb-2 font-medium">System Prompt</label>
          <textarea 
            rows={5}
            defaultValue={agent.prompt}
            className="w-full p-2 border rounded-md dark:bg-zinc-900 dark:border-zinc-700"
          />
          <p className="text-sm text-zinc-500 mt-1">
            This prompt sets the behavior and tone of your assistant.
          </p>
        </div>
        
        <div>
          <label className="block mb-2 font-medium">Status</label>
          <select 
            defaultValue={agent.status}
            className="w-full p-2 border rounded-md dark:bg-zinc-900 dark:border-zinc-700"
          >
            <option value="Active">Active</option>
            <option value="Draft">Draft</option>
            <option value="Archived">Archived</option>
          </select>
        </div>
        
        <div className="pt-4">
          <Button>Save Changes</Button>
        </div>
      </div>
    </div>
  );
}

function LogsTab({ agentId }: { agentId: string }) {
  // Sample logs - in a real app, you would fetch this
  const logs = [
    { id: '1', action: 'Document added', user: 'admin@example.com', timestamp: 'Aug 15, 2023 14:32' },
    { id: '2', action: 'Agent settings updated', user: 'admin@example.com', timestamp: 'Aug 14, 2023 11:20' },
    { id: '3', action: 'Agent created', user: 'admin@example.com', timestamp: 'Jul 15, 2023 09:45' },
  ];

  return (
    <div>
      <h3 className="text-xl font-semibold mb-6">Activity Logs</h3>
      
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow">
        <div className="grid grid-cols-12 gap-4 p-4 font-medium text-zinc-500 dark:text-zinc-400 border-b dark:border-zinc-700">
          <div className="col-span-4">Action</div>
          <div className="col-span-4">User</div>
          <div className="col-span-4">Timestamp</div>
        </div>
        
        {logs.map((log) => (
          <div 
            key={log.id}
            className="grid grid-cols-12 gap-4 p-4 items-center border-b last:border-b-0 dark:border-zinc-700"
          >
            <div className="col-span-4">{log.action}</div>
            <div className="col-span-4">{log.user}</div>
            <div className="col-span-4">{log.timestamp}</div>
          </div>
        ))}
      </div>
    </div>
  );
} 