import { Artifact } from "@/components/create-artifact";
import ShopContent from "@/components/ecomerce/shop-content";

export const shopArtifact = new Artifact({
  kind: 'shop',
  description: 'Shop',
  content: ShopContent,
  actions: [],
  toolbar: [],
  onStreamPart: () => {},
});
