export default function Custom404() {
  return (
    <div className="min-h-screen bg-primary flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-6xl font-bold text-primary mb-4">404</div>
        <h1 className="text-2xl font-bold text-primary mb-4">Page Not Found</h1>
        <p className="text-secondary mb-8 max-w-md mx-auto">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <a 
          href="/" 
          className="inline-block px-6 py-3 bg-black hover:bg-gray-800 text-white rounded-lg transition-colors duration-200 dark:bg-white dark:text-black dark:hover:bg-gray-100"
        >
          Go Back Home
        </a>
      </div>
    </div>
  )
}