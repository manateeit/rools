// Import Jest DOM extensions
import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    reload: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn()
    }
  })
}));

// Mock Next.js image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt || ''} />;
  }
}));

// Mock Next.js link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  )
}));

// Mock Supabase
jest.mock('@supabase/supabase-js', () => {
  const mockSupabase = {
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } }),
      resetPasswordForEmail: jest.fn(),
      updateUser: jest.fn()
    },
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis()
  };
  
  return {
    createClient: jest.fn().mockReturnValue(mockSupabase)
  };
});

// Mock environment variables
process.env = {
  ...process.env,
  NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'example-anon-key',
  NEXT_PUBLIC_API_URL: 'http://localhost:3000/api'
};

// Mock fetch
global.fetch = jest.fn();

// Mock console.error to avoid cluttering test output
const originalConsoleError = console.error;
console.error = (...args) => {
  // Filter out React-specific warnings that might occur during testing
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning: ReactDOM.render') ||
      args[0].includes('Warning: React.createElement') ||
      args[0].includes('Warning: Each child in a list'))
  ) {
    return;
  }
  originalConsoleError(...args);
};

// Mock IntersectionObserver
class MockIntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  
  observe() {
    return null;
  }
  
  unobserve() {
    return null;
  }
  
  disconnect() {
    return null;
  }
}

global.IntersectionObserver = MockIntersectionObserver;

// Mock ResizeObserver
class MockResizeObserver {
  constructor(callback) {
    this.callback = callback;
  }
  
  observe() {
    return null;
  }
  
  unobserve() {
    return null;
  }
  
  disconnect() {
    return null;
  }
}

global.ResizeObserver = MockResizeObserver;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  }))
});

// Mock window.scrollTo
window.scrollTo = jest.fn();

// Set up afterEach to clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});