import { RouterProvider } from 'react-router';
import { router } from './routes';
import { Toaster } from 'sonner';
import { Suspense } from 'react';
import { MotionConfig } from 'motion/react';

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <Suspense
        fallback={
          <div className="empty-state" role="status">
            Opening your workspace…
          </div>
        }
      >
        <RouterProvider router={router} />
      </Suspense>
      <Toaster
        position="bottom-right"
        mobileOffset={{ bottom: 108, left: 16, right: 16 }}
        closeButton
        richColors
      />
    </MotionConfig>
  );
}
