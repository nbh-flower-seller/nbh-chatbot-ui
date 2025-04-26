'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function CreateAgentPage() {
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState<Array<{
    id: string;
    name: string;
    size: string;
    type: string;
  }>>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;
    
    setUploading(true);
    
    try {
      // Handle upload for each file
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch('/api/files/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Upload failed');
        }
        
        return {
          id: Date.now().toString() + Math.random().toString(36).substring(2),
          name: file.name,
          size: formatFileSize(file.size),
          type: file.type.split('/').pop() || 'unknown',
        };
      });
      
      const uploadedDocs = await Promise.all(uploadPromises);
      setDocuments((prev) => [...prev, ...uploadedDocs]);
      toast.success(`${files.length} file${files.length === 1 ? '' : 's'} uploaded successfully`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file(s)');
    } finally {
      setUploading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const removeDocument = (id: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
  };
  
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };
  
  return (
    <div>
      <div className="mb-8">
        <Link 
          href="/admin/agents" 
          className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300 mb-2 inline-block"
        >
          ← Back to Agents
        </Link>
        <h1 className="text-3xl font-bold">Create New Agent</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Agent Details Form */}
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Agent Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block mb-2 font-medium">Agent Name</label>
                <input 
                  type="text" 
                  placeholder="e.g., Sales Assistant" 
                  className="w-full p-2 border rounded-md dark:bg-zinc-900 dark:border-zinc-700"
                />
              </div>
              
              <div>
                <label className="block mb-2 font-medium">Description</label>
                <input 
                  type="text" 
                  placeholder="e.g., Handles sales inquiries and provides product information" 
                  className="w-full p-2 border rounded-md dark:bg-zinc-900 dark:border-zinc-700"
                />
              </div>
              
              <div>
                <label className="block mb-2 font-medium">System Prompt</label>
                <textarea 
                  rows={5}
                  placeholder="You are a helpful sales assistant..."
                  className="w-full p-2 border rounded-md dark:bg-zinc-900 dark:border-zinc-700"
                />
                <p className="text-sm text-zinc-500 mt-1">
                  This prompt sets the behavior and tone of your assistant.
                </p>
              </div>
            </div>
          </div>
          
          {/* Document Upload */}
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Knowledge Base</h2>
            <p className="text-zinc-500 mb-4">
              Upload documents to build your agent's knowledge base. Supported formats include PDF, DOCX, TXT, CSV, and more.
            </p>
            
            <div className="mb-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                multiple
              />
              
              <Button 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full py-8 border-dashed border-2"
                variant="outline"
              >
                {uploading ? 'Uploading...' : 'Click to upload or drag and drop files'}
              </Button>
            </div>
            
            {documents.length > 0 && (
              <div className="border rounded-md dark:border-zinc-700 overflow-hidden">
                <div className="grid grid-cols-12 gap-4 p-3 font-medium text-zinc-500 dark:text-zinc-400 border-b dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900">
                  <div className="col-span-6">Name</div>
                  <div className="col-span-2">Type</div>
                  <div className="col-span-2">Size</div>
                  <div className="col-span-2">Actions</div>
                </div>
                
                {documents.map((doc) => (
                  <div 
                    key={doc.id}
                    className="grid grid-cols-12 gap-4 p-3 items-center border-b last:border-b-0 dark:border-zinc-700"
                  >
                    <div className="col-span-6 font-medium truncate">{doc.name}</div>
                    <div className="col-span-2 uppercase text-xs">{doc.type}</div>
                    <div className="col-span-2">{doc.size}</div>
                    <div className="col-span-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => removeDocument(doc.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Right sidebar */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
            <h3 className="font-medium mb-4">Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium">Language Model</label>
                <select className="w-full p-2 border rounded-md dark:bg-zinc-900 dark:border-zinc-700">
                  <option value="gpt-4">GPT-4o</option>
                  <option value="claude">Claude 3 Opus</option>
                  <option value="mistral">Mistral Large</option>
                </select>
              </div>
              
              <div>
                <label className="block mb-2 text-sm font-medium">Status</label>
                <select className="w-full p-2 border rounded-md dark:bg-zinc-900 dark:border-zinc-700">
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2 pt-2">
                <input type="checkbox" id="retrievalEnabled" className="rounded" />
                <label htmlFor="retrievalEnabled" className="text-sm">
                  Enable RAG retrieval
                </label>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
            <Button className="w-full mb-2">Create Agent</Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/admin/agents">Cancel</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 