export default function LandingPage() {
  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Herf Social",
    "alternateName": "Herf Social - Cigar & Pipe Tobacco Community",
    "url": "https://herf.social",
    "description": "Join the premier online community for cigar and pipe tobacco enthusiasts. Share reviews, connect with local clubs, discover new blends, and organize herf events.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://herf.social/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    },
    "sameAs": [
      "https://herf.social"
    ]
  };

  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Herf Social",
    "url": "https://herf.social",
    "logo": "https://herf.social/android-chrome-512x512.png",
    "description": "A dedicated community for cigar and pipe tobacco enthusiasts",
    "foundingDate": "2025",
    "sameAs": [
      "https://herf.social"
    ]
  };

  return (
    <div>
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(organizationData)}
      </script>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-ember-50 to-tobacco-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-tobacco-900 mb-6">
            Welcome to <span className="text-ember-600 font-script">Herf Social</span>
          </h1>
          <p className="text-xl text-tobacco-700 mb-8 max-w-2xl mx-auto">
            A dedicated community for cigar and pipe tobacco enthusiasts to connect,
            share experiences, and discover new favorites.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/register"
              className="bg-ember-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-ember-700 transition"
            >
              Join the Community
            </a>
            <a
              href="/login"
              className="bg-white text-ember-600 px-8 py-3 rounded-lg text-lg font-semibold border-2 border-ember-600 hover:bg-ember-50 transition"
            >
              Sign In
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-tobacco-900 mb-12">
            What Makes Us Special
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center p-6">
              <div className="text-5xl mb-4">👥</div>
              <h3 className="text-xl font-bold text-tobacco-900 mb-2">Private Clubs</h3>
              <p className="text-tobacco-700">
                Create and join exclusive clubs with fellow enthusiasts who share your passion.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-6">
              <div className="text-5xl mb-4">📅</div>
              <h3 className="text-xl font-bold text-tobacco-900 mb-2">Club Events</h3>
              <p className="text-tobacco-700">
                Organize and attend meetups, tastings, and social gatherings with your club members.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-6">
              <div className="text-5xl mb-4">⭐</div>
              <h3 className="text-xl font-bold text-tobacco-900 mb-2">Reviews & Ratings</h3>
              <p className="text-tobacco-700">
                Share detailed reviews of your favorite pipes, tobaccos, and cigars with the community.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="text-center p-6">
              <div className="text-5xl mb-4">💬</div>
              <h3 className="text-xl font-bold text-tobacco-900 mb-2">Direct Messaging</h3>
              <p className="text-tobacco-700">
                Connect one-on-one with other members through private messages.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="text-center p-6">
              <div className="text-5xl mb-4">📱</div>
              <h3 className="text-xl font-bold text-tobacco-900 mb-2">Mobile-First</h3>
              <p className="text-tobacco-700">
                Access the community seamlessly from any device, anywhere.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="text-center p-6">
              <div className="text-5xl mb-4">🔔</div>
              <h3 className="text-xl font-bold text-tobacco-900 mb-2">Real-Time Notifications</h3>
              <p className="text-tobacco-700">
                Stay updated with instant notifications for posts, comments, and events.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
