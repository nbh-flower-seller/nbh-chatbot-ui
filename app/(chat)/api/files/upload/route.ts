import { NextResponse } from 'next/server';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import { createServerSupabaseClient } from '@/lib/supabase/server';

import { auth } from '@/app/(auth)/auth';

// Define accepted file types
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ACCEPTED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
];
const ACCEPTED_TEXT_TYPES = [
  'text/plain',
  'text/csv',
  'text/html',
  'text/markdown',
  'application/json',
  'text/javascript',
  'application/xml',
];

// Combined accepted types
const ACCEPTED_FILE_TYPES = [
  ...ACCEPTED_IMAGE_TYPES,
  ...ACCEPTED_DOCUMENT_TYPES,
  ...ACCEPTED_TEXT_TYPES,
];

// Use Blob instead of File since File is not available in Node.js environment
const FileSchema = z.object({
  file: z
    .instanceof(Blob)
    .refine((file) => file.size <= 10 * 1024 * 1024, {
      message: 'File size should be less than 10MB',
    })
    .refine((file) => ACCEPTED_FILE_TYPES.includes(file.type), {
      message: `File type not supported. Supported types: images (JPEG, PNG, GIF, WebP), documents (PDF, Word, Excel, PowerPoint), and text files (TXT, CSV, HTML, MD, JSON)`,
    }),
});

export async function POST(request: Request) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (request.body === null) {
    return new Response('Request body is empty', { status: 400 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as Blob;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const validatedFile = FileSchema.safeParse({ file });

    if (!validatedFile.success) {
      const errorMessage = validatedFile.error.errors
        .map((error) => error.message)
        .join(', ');

      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    // Get filename from formData since Blob doesn't have name property
    const originalFilename = (formData.get('file') as File).name;
    const fileExtension = originalFilename.split('.').pop();
    const uniqueFilename = `${nanoid()}.${fileExtension}`;
    const fileBuffer = await file.arrayBuffer();
    
    // Create server-side Supabase client with admin privileges
    const supabase = createServerSupabaseClient();
    
    // Get bucket name from environment variable
    const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'nbh-test-public';
    
    try {
      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(uniqueFilename, fileBuffer, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: false
        });
        
      if (error) {
        console.error('Supabase storage upload error:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
      }
      
      // Get public URL for the uploaded file
      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(uniqueFilename);
      
      // The AI SDK expects this specific format for attachments
      return NextResponse.json({
        url: publicUrlData.publicUrl,
        name: originalFilename,
        contentType: file.type
      });
    } catch (error) {
      console.error('Error uploading to Supabase:', error);
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
  } catch (error) {
    console.error('Request processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 },
    );
  }
}
