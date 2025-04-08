import RoomProvider from '@/components/RoomProvider';
import { auth } from '@clerk/nextjs/server';

export default async function DocLayout(props: {
  children: React.ReactNode;
  params: Promise<{ id: string }>; // 👈 Mark as Promise
}) {
  const { id } = await props.params; // 👈 Await params
  await auth.protect();

  return (
    <RoomProvider roomId={id}>
      {props.children}
    </RoomProvider>
  );
}
