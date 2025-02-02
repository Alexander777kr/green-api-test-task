import './App.css';
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import Default from './components/default/Default';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider>
        <Default />
        <Toaster
          position="bottom-left"
          toastOptions={{
            className: '',
            style: {
              // padding: '16px',
              background: 'var(--foreground-toast)',
              color: 'var(--text-toast)',
              alignItems: 'start',
            },
          }}
        />
      </MantineProvider>
    </QueryClientProvider>
  );
}

export default App;
