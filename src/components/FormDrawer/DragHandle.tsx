import { Drawer } from 'vaul';

export default function DragHandle() {
  return <Drawer.Handle className="flex cursor-grab items-center justify-center pt-3 active:cursor-grabbing" />;
}
