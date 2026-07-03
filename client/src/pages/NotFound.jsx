import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="max-w-lg mx-auto mt-24 p-8 text-center">
      <h1 className="text-6xl font-serif font-bold text-teal mb-2">404</h1>
      <p className="text-warmgray mb-6">
        The page you're looking for doesn't exist.
      </p>
      <Link
        to="/"
        className="bg-terracotta text-cream font-medium px-6 py-2.5 rounded hover:bg-terracotta-dark transition-colors inline-block"
      >
        Back to Home
      </Link>
    </div>
  );
}