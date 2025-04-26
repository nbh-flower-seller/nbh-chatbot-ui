import { Button } from '@/components/ui/button';

export default function UsersPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Users</h1>
        
        <Button>Invite User</Button>
      </div>
      
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow">
        <div className="grid grid-cols-12 gap-4 p-4 font-medium text-zinc-500 dark:text-zinc-400 border-b dark:border-zinc-700">
          <div className="col-span-3">User</div>
          <div className="col-span-3">Email</div>
          <div className="col-span-2">Role</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Actions</div>
        </div>
        
        {users.map((user) => (
          <div 
            key={user.id}
            className="grid grid-cols-12 gap-4 p-4 items-center border-b last:border-b-0 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-750"
          >
            <div className="col-span-3">
              <div className="font-medium">{user.name}</div>
              <div className="text-sm text-zinc-500">Last active: {user.lastActive}</div>
            </div>
            <div className="col-span-3">{user.email}</div>
            <div className="col-span-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                user.role === 'Admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-800/20 dark:text-purple-500' : 'bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-500'
              }`}>
                {user.role}
              </span>
            </div>
            <div className="col-span-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                user.status === 'Active' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-500' 
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-500'
              }`}>
                {user.status}
              </span>
            </div>
            <div className="col-span-2 flex space-x-2">
              <Button variant="outline" size="sm">Edit</Button>
              <Button variant="ghost" size="sm">Disable</Button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-between items-center mt-6">
        <div className="text-sm text-zinc-500">
          Showing {users.length} of {users.length} users
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" disabled>Previous</Button>
          <Button variant="outline" size="sm" disabled>Next</Button>
        </div>
      </div>
    </div>
  );
}

// Sample data
const users = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Admin',
    status: 'Active',
    lastActive: '5 minutes ago'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'User',
    status: 'Active',
    lastActive: '2 hours ago'
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike@example.com',
    role: 'User',
    status: 'Inactive',
    lastActive: '1 week ago'
  },
  {
    id: '4',
    name: 'Sarah Williams',
    email: 'sarah@example.com',
    role: 'User',
    status: 'Active',
    lastActive: '1 day ago'
  },
  {
    id: '5',
    name: 'Bruce Lee',
    email: 'bruce@example.com',
    role: 'Admin',
    status: 'Active',
    lastActive: '3 hours ago'
  }
]; 