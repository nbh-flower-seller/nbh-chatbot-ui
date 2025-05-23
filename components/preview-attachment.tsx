import type { Attachment } from 'ai';

import { LoaderIcon, FileIcon, ImageIcon, CodeIcon, FileIcon as TextFileIcon } from './icons';

export const PreviewAttachment = ({
  attachment,
  isUploading = false,
}: {
  attachment: Attachment;
  isUploading?: boolean;
}) => {
  const { name, url, contentType } = attachment;

  // Helper function to render the appropriate icon based on content type
  const renderFileTypeIcon = () => {
    if (!contentType) return <FileIcon size={18} />;

    if (contentType.startsWith('image/')) {
      return <ImageIcon size={18} />;
    } else if (
      contentType.includes('pdf') || 
      contentType.includes('word') || 
      contentType.includes('excel') || 
      contentType.includes('powerpoint') ||
      contentType.includes('document')
    ) {
      return <FileIcon size={18} />;
    } else if (
      contentType.startsWith('text/') ||
      contentType.includes('json') ||
      contentType.includes('javascript') ||
      contentType.includes('xml')
    ) {
      return <CodeIcon size={18} />;
    }
    
    return <FileIcon size={18} />;
  };

  return (
    <div data-testid="input-attachment-preview" className="flex flex-col gap-2">
      <div className="w-20 h-16 aspect-video bg-muted rounded-md relative flex flex-col items-center justify-center">
        {contentType ? (
          contentType.startsWith('image') && url ? (
            // NOTE: it is recommended to use next/image for images
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={url}
              src={url}
              alt={name ?? 'An image attachment'}
              className="rounded-md size-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center">
              {renderFileTypeIcon()}
            </div>
          )
        ) : (
          <div className="flex items-center justify-center">
            <FileIcon size={18} />
          </div>
        )}

        {isUploading && (
          <div
            data-testid="input-attachment-loader"
            className="animate-spin absolute text-zinc-500"
          >
            <LoaderIcon />
          </div>
        )}
      </div>
      <div className="text-xs text-zinc-500 max-w-16 truncate">{name}</div>
    </div>
  );
};
