export default function ClubDetailPage() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Club Header */}
      <div className="bg-white rounded-lg shadow mb-6">
        {/* Cover Photo */}
        <div className="h-48 bg-gradient-to-r from-ember-400 to-tobacco-400 rounded-t-lg"></div>

        {/* Club Info */}
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-5 -mt-12">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="h-24 w-24 rounded-full bg-tobacco-300 border-4 border-white"></div>
            </div>

            {/* Name & Actions */}
            <div className="flex-1 mt-4 sm:mt-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-tobacco-900">Peterson Pipe Club</h1>
                  <p className="text-tobacco-600">@peterson-pipe-club</p>
                </div>
                <div className="mt-4 sm:mt-0 flex space-x-3">
                  <button className="px-4 py-2 bg-ember-600 text-white rounded-lg hover:bg-ember-700 font-medium">
                    Joined
                  </button>
                  <button className="px-4 py-2 bg-tobacco-200 text-tobacco-700 rounded-lg hover:bg-tobacco-300 font-medium">
                    Invite
                  </button>
                </div>
              </div>

              {/* Description */}
              <p className="mt-4 text-tobacco-700">
                A community for Peterson pipe collectors and enthusiasts. Share your collection,
                discuss blends, and connect with fellow Peterson lovers. Whether you're new to
                Peterson or a seasoned collector, all are welcome!
              </p>

              {/* Stats */}
              <div className="flex space-x-6 mt-4">
                <div>
                  <span className="font-bold text-tobacco-900">1.2K</span>
                  <span className="text-tobacco-600 ml-1">Members</span>
                </div>
                <div>
                  <span className="font-bold text-tobacco-900">342</span>
                  <span className="text-tobacco-600 ml-1">Posts</span>
                </div>
                <div>
                  <span className="font-bold text-tobacco-900">24</span>
                  <span className="text-tobacco-600 ml-1">Events</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="flex border-b border-tobacco-200">
          <button className="px-6 py-3 font-medium text-ember-600 border-b-2 border-ember-600">
            Feed
          </button>
          <button className="px-6 py-3 font-medium text-tobacco-600 hover:text-ember-600">
            Events
          </button>
          <button className="px-6 py-3 font-medium text-tobacco-600 hover:text-ember-600">
            Members
          </button>
          <button className="px-6 py-3 font-medium text-tobacco-600 hover:text-ember-600">
            About
          </button>
        </div>
      </div>

      {/* Create Post (for members) */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex space-x-3">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-tobacco-300"></div>
          </div>
          <div className="flex-1">
            <textarea
              placeholder="Share with the club..."
              rows={2}
              className="w-full px-3 py-2 border border-tobacco-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ember-500 resize-none"
            />
            <div className="flex justify-end mt-2">
              <button className="px-4 py-2 bg-ember-600 text-white rounded-lg hover:bg-ember-700 text-sm font-medium">
                Post
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Club Feed */}
      <div className="space-y-6">
        {/* Pinned Post */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-ember-600">
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-sm font-medium text-ember-600">📌 Pinned</span>
          </div>
          <div className="flex items-center space-x-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-tobacco-300"></div>
            <div>
              <p className="font-semibold text-tobacco-900">Club Admin</p>
              <p className="text-sm text-tobacco-600">1 week ago</p>
            </div>
          </div>
          <p className="text-tobacco-800 mb-2">
            Welcome to Peterson Pipe Club! Please read our community guidelines and introduce
            yourself in the comments below.
          </p>
          <div className="flex items-center justify-between pt-4 border-t border-tobacco-200">
            <button className="flex items-center space-x-2 text-tobacco-600">
              <span>❤️</span>
              <span className="text-sm">234</span>
            </button>
            <button className="flex items-center space-x-2 text-tobacco-600">
              <span>💬</span>
              <span className="text-sm">67 comments</span>
            </button>
          </div>
        </div>

        {/* Regular Post */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-tobacco-300"></div>
            <div>
              <p className="font-semibold text-tobacco-900">Mike Thompson</p>
              <p className="text-sm text-tobacco-600">3 hours ago</p>
            </div>
          </div>
          <p className="text-tobacco-800 mb-4">
            Just added this beauty to my collection - Peterson Sherlock Holmes Original. Breaking
            it in with some Nightcap. What's your favorite Peterson shape?
          </p>
          <div className="h-64 bg-tobacco-200 rounded-lg mb-4"></div>
          <div className="flex items-center justify-between pt-4 border-t border-tobacco-200">
            <button className="flex items-center space-x-2 text-tobacco-600 hover:text-ember-600">
              <span>🔥</span>
              <span className="text-sm">89</span>
            </button>
            <button className="flex items-center space-x-2 text-tobacco-600 hover:text-ember-600">
              <span>💬</span>
              <span className="text-sm">23 comments</span>
            </button>
            <button className="flex items-center space-x-2 text-tobacco-600 hover:text-ember-600">
              <span>🔗</span>
              <span className="text-sm">Share</span>
            </button>
          </div>
        </div>

        {/* Another Post */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-tobacco-300"></div>
            <div>
              <p className="font-semibold text-tobacco-900">Sarah O'Neill</p>
              <p className="text-sm text-tobacco-600">1 day ago</p>
            </div>
          </div>
          <p className="text-tobacco-800">
            PSA: Peterson is releasing a new limited edition System pipe next month. Pre-orders
            start Friday! 🎉
          </p>
          <div className="flex items-center justify-between pt-4 border-t border-tobacco-200 mt-4">
            <button className="flex items-center space-x-2 text-tobacco-600 hover:text-ember-600">
              <span>😍</span>
              <span className="text-sm">156</span>
            </button>
            <button className="flex items-center space-x-2 text-tobacco-600 hover:text-ember-600">
              <span>💬</span>
              <span className="text-sm">45 comments</span>
            </button>
            <button className="flex items-center space-x-2 text-tobacco-600 hover:text-ember-600">
              <span>🔗</span>
              <span className="text-sm">Share</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
