export default function ClubsPage() {
  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-tobacco-900">Clubs</h1>
          <p className="text-tobacco-600 mt-1">Discover and join communities</p>
        </div>
        <button className="mt-4 sm:mt-0 px-4 py-2 bg-ember-600 text-white rounded-lg hover:bg-ember-700 font-medium">
          + Create Club
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search clubs..."
              className="w-full px-4 py-2 border border-tobacco-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ember-500"
            />
          </div>
          <div className="flex space-x-2">
            <button className="px-4 py-2 bg-ember-600 text-white rounded-lg text-sm font-medium">
              All
            </button>
            <button className="px-4 py-2 bg-white text-tobacco-700 border border-tobacco-300 rounded-lg hover:bg-tobacco-50 text-sm font-medium">
              My Clubs
            </button>
            <button className="px-4 py-2 bg-white text-tobacco-700 border border-tobacco-300 rounded-lg hover:bg-tobacco-50 text-sm font-medium">
              Public
            </button>
          </div>
        </div>
      </div>

      {/* Clubs Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Club Card 1 */}
        <div className="bg-white rounded-lg shadow hover:shadow-lg transition">
          <div className="h-32 bg-gradient-to-r from-ember-400 to-tobacco-400 rounded-t-lg"></div>
          <div className="p-6">
            <div className="flex items-center space-x-3 -mt-16 mb-4">
              <div className="h-16 w-16 rounded-full bg-tobacco-300 border-4 border-white"></div>
              <div className="mt-12">
                <h3 className="font-bold text-tobacco-900">Peterson Pipe Club</h3>
              </div>
            </div>
            <p className="text-tobacco-700 text-sm mb-4 line-clamp-2">
              A community for Peterson pipe collectors and enthusiasts. Share your collection,
              discuss blends, and connect with fellow Peterson lovers.
            </p>
            <div className="flex items-center justify-between">
              <div className="text-sm text-tobacco-600">
                <span className="font-semibold">1.2K</span> members
              </div>
              <button className="px-4 py-2 bg-ember-600 text-white rounded-lg hover:bg-ember-700 text-sm font-medium">
                Join
              </button>
            </div>
          </div>
        </div>

        {/* Club Card 2 */}
        <div className="bg-white rounded-lg shadow hover:shadow-lg transition">
          <div className="h-32 bg-gradient-to-r from-tobacco-400 to-tobacco-600 rounded-t-lg"></div>
          <div className="p-6">
            <div className="flex items-center space-x-3 -mt-16 mb-4">
              <div className="h-16 w-16 rounded-full bg-tobacco-300 border-4 border-white"></div>
              <div className="mt-12">
                <h3 className="font-bold text-tobacco-900">Cigar Aficionados</h3>
              </div>
            </div>
            <p className="text-tobacco-700 text-sm mb-4 line-clamp-2">
              Premium cigar lovers unite! Discuss your favorite brands, share reviews, and
              organize local herf sessions.
            </p>
            <div className="flex items-center justify-between">
              <div className="text-sm text-tobacco-600">
                <span className="font-semibold">856</span> members
              </div>
              <button className="px-4 py-2 bg-ember-600 text-white rounded-lg hover:bg-ember-700 text-sm font-medium">
                Join
              </button>
            </div>
          </div>
        </div>

        {/* Club Card 3 */}
        <div className="bg-white rounded-lg shadow hover:shadow-lg transition">
          <div className="h-32 bg-gradient-to-r from-ember-500 to-ember-700 rounded-t-lg"></div>
          <div className="p-6">
            <div className="flex items-center space-x-3 -mt-16 mb-4">
              <div className="h-16 w-16 rounded-full bg-tobacco-300 border-4 border-white"></div>
              <div className="mt-12">
                <h3 className="font-bold text-tobacco-900">English Blends Only</h3>
              </div>
            </div>
            <p className="text-tobacco-700 text-sm mb-4 line-clamp-2">
              For those who love Latakia, Oriental, and all things English. Share your favorite
              blends and tasting notes.
            </p>
            <div className="flex items-center justify-between">
              <div className="text-sm text-tobacco-600">
                <span className="font-semibold">432</span> members
              </div>
              <button className="px-4 py-2 bg-ember-600 text-white rounded-lg hover:bg-ember-700 text-sm font-medium">
                Join
              </button>
            </div>
          </div>
        </div>

        {/* Club Card 4 */}
        <div className="bg-white rounded-lg shadow hover:shadow-lg transition">
          <div className="h-32 bg-gradient-to-r from-tobacco-300 to-tobacco-500 rounded-t-lg"></div>
          <div className="p-6">
            <div className="flex items-center space-x-3 -mt-16 mb-4">
              <div className="h-16 w-16 rounded-full bg-tobacco-300 border-4 border-white"></div>
              <div className="mt-12">
                <h3 className="font-bold text-tobacco-900">NYC Pipe Smokers</h3>
                <span className="text-xs bg-tobacco-200 text-tobacco-700 px-2 py-1 rounded">Private</span>
              </div>
            </div>
            <p className="text-tobacco-700 text-sm mb-4 line-clamp-2">
              Local New York City pipe smoking community. Regular meetups in Manhattan and Brooklyn.
            </p>
            <div className="flex items-center justify-between">
              <div className="text-sm text-tobacco-600">
                <span className="font-semibold">89</span> members
              </div>
              <button className="px-4 py-2 bg-tobacco-200 text-tobacco-700 rounded-lg hover:bg-tobacco-300 text-sm font-medium">
                Request
              </button>
            </div>
          </div>
        </div>

        {/* Club Card 5 */}
        <div className="bg-white rounded-lg shadow hover:shadow-lg transition">
          <div className="h-32 bg-gradient-to-r from-ember-400 to-ember-600 rounded-t-lg"></div>
          <div className="p-6">
            <div className="flex items-center space-x-3 -mt-16 mb-4">
              <div className="h-16 w-16 rounded-full bg-tobacco-300 border-4 border-white"></div>
              <div className="mt-12">
                <h3 className="font-bold text-tobacco-900">Pipe Restoration</h3>
              </div>
            </div>
            <p className="text-tobacco-700 text-sm mb-4 line-clamp-2">
              Learn the art of pipe restoration and repair. Share your projects and get advice
              from experienced restorers.
            </p>
            <div className="flex items-center justify-between">
              <div className="text-sm text-tobacco-600">
                <span className="font-semibold">267</span> members
              </div>
              <button className="px-4 py-2 bg-ember-600 text-white rounded-lg hover:bg-ember-700 text-sm font-medium">
                Join
              </button>
            </div>
          </div>
        </div>

        {/* Club Card 6 */}
        <div className="bg-white rounded-lg shadow hover:shadow-lg transition">
          <div className="h-32 bg-gradient-to-r from-tobacco-500 to-ember-500 rounded-t-lg"></div>
          <div className="p-6">
            <div className="flex items-center space-x-3 -mt-16 mb-4">
              <div className="h-16 w-16 rounded-full bg-tobacco-300 border-4 border-white"></div>
              <div className="mt-12">
                <h3 className="font-bold text-tobacco-900">Virginia Blends</h3>
              </div>
            </div>
            <p className="text-tobacco-700 text-sm mb-4 line-clamp-2">
              Dedicated to Virginia tobacco lovers. Discuss straight Virginias, VaPers, and
              everything in between.
            </p>
            <div className="flex items-center justify-between">
              <div className="text-sm text-tobacco-600">
                <span className="font-semibold">534</span> members
              </div>
              <button className="px-4 py-2 bg-ember-600 text-white rounded-lg hover:bg-ember-700 text-sm font-medium">
                Join
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
