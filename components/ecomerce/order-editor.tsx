import { memo } from "react";

interface OrderEditorProps {
  content: string;
}

function PureOrderEditor({
  content,
}: OrderEditorProps) {
  return <div>{content}</div>;
}

function areEqual(prevProps: OrderEditorProps, nextProps: OrderEditorProps) {
  return prevProps.content === nextProps.content;
}

export const OrderEditor = memo(PureOrderEditor, areEqual);
