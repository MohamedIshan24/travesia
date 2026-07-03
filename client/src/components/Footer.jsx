export default function Footer() {
  return (
    <footer className="border-t border-charcoal/10 mt-auto">
      <div className="max-w-5xl mx-auto px-6 py-12 text-center">
        <p className="logo-script text-2xl text-teal mb-2">Travesía</p>
        <p className="label-caps text-warmgray">
          © {new Date().getFullYear()} Travel Archives
        </p>
      </div>
    </footer>
  );
}