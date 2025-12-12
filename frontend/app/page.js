'use client';

import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-4">Blog & Case Study Platform</h1>
      <p className="text-lg mb-8">Welcome to the collaborative editor</p>
      
      <div className="space-x-4">
        <button
          onClick={() => router.push('/posts')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          View Posts
        </button>
      </div>
    </div>
  );
}

