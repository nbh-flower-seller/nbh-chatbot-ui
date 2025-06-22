import { Artifact } from "@/components/create-artifact";
import { OrderEditor } from "@/components/ecomerce/order-editor";

export const orderArtifact = new Artifact({
  kind: 'order',
  description: 'Order',
  actions: [],
  toolbar: [],
  onStreamPart: ({ streamPart, setArtifact }) => {
    if (streamPart.type === 'order-delta') {
      setArtifact((draftArtifact) => ({
        ...draftArtifact,
        content: streamPart.content as string,
      }));
    }
  },
  content: ({ metadata, setMetadata, ...props }) => {
    return (
      <>
        <div className="px-1">
          <OrderEditor 
            {...props}
          />
        </div>
      </>
    );
  },
});
