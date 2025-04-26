import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/app/(auth)/auth';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await auth();
  
  // Check if user is authenticated and has admin role
  // You might want to add proper role-based authorization here
  if (!session?.user) {
    redirect('/login');
  }
  
  // For demo purposes we're checking a hypothetical isAdmin field
  // Replace with your actual admin role check logic
  const isAdmin = true; // TODO: Replace with real admin check
  
  if (!isAdmin) {
    redirect('/');
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-950 text-white p-6">
        <div className="mb-8">
          <h1 className="text-xl font-bold">Admin Panel</h1>
        </div>
        
        <nav className="space-y-1">
          <NavLink href="/admin" exact>Dashboard</NavLink>
          <NavLink href="/admin/agents">Agents</NavLink>
          <NavLink href="/admin/users">Users</NavLink>
          <NavLink href="/admin/usage">Usage</NavLink>
        </nav>
        
        <div className="mt-auto pt-8">
          <Link 
            href="/"
            className="text-zinc-400 hover:text-white text-sm flex items-center"
          >
            ← Back to App
          </Link>
        </div>
      </aside>
      
      {/* Main content */}
      <main className="flex-1 bg-zinc-100 dark:bg-zinc-900">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

function NavLink({ 
  href, 
  children, 
  exact = false 
}: { 
  href: string; 
  children: React.ReactNode; 
  exact?: boolean;
}) {
  return (
    <Link
      href={href}
      className="block py-2.5 px-4 rounded transition-colors hover:bg-zinc-800"
    >
      {children}
    </Link>
  );
} 