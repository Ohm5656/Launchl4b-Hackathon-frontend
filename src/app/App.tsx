import { RouterProvider } from 'react-router';
import { router } from './routes';
import { Toaster } from 'sonner';
import { Suspense } from 'react';

export default function App() {
  return (
    <>
      <Suspense
        fallback={
          <div className="empty-state" role="status">
            Opening your workspace…
          </div>
        }
      >
        <RouterProvider router={router} />
      </Suspense>
      <Toaster position="bottom-right" closeButton richColors />
    </>
  );
}
