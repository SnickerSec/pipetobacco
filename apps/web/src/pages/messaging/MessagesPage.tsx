export default function MessagesPage() {
  return (
    <div className="bg-white rounded-lg shadow h-[calc(100vh-12rem)]">
      <div className="flex h-full">
        {/* Conversations List (Left Sidebar) */}
        <div className="w-full md:w-80 border-r border-tobacco-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-tobacco-200">
            <h2 className="text-xl font-bold text-tobacco-900">Messages</h2>
            <input
              type="text"
              placeholder="Search messages..."
              className="mt-3 w-full px-3 py-2 border border-tobacco-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ember-500 text-sm"
            />
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {/* Active Conversation */}
            <div className="p-4 hover:bg-tobacco-50 cursor-pointer border-l-4 border-ember-600 bg-ember-50">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="h-12 w-12 rounded-full bg-tobacco-300"></div>
                  <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-tobacco-900 truncate">Mike Thompson</p>
                    <span className="text-xs text-tobacco-600">2m</span>
                  </div>
                  <p className="text-sm text-tobacco-700 truncate">
                    That sounds great! Let me know when...
                  </p>
                </div>
              </div>
            </div>

            {/* Unread Conversation */}
            <div className="p-4 hover:bg-tobacco-50 cursor-pointer bg-blue-50">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="h-12 w-12 rounded-full bg-tobacco-300"></div>
                  <div className="absolute -top-1 -right-1 h-5 w-5 bg-ember-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    3
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-tobacco-900 truncate">Sarah O'Neill</p>
                    <span className="text-xs text-tobacco-600">1h</span>
                  </div>
                  <p className="text-sm text-tobacco-900 font-medium truncate">
                    Did you see the new Peterson release?
                  </p>
                </div>
              </div>
            </div>

            {/* Other Conversations */}
            <div className="p-4 hover:bg-tobacco-50 cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-full bg-tobacco-300"></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-tobacco-900 truncate">John Doe</p>
                    <span className="text-xs text-tobacco-600">3h</span>
                  </div>
                  <p className="text-sm text-tobacco-700 truncate">
                    Thanks for the recommendation!
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 hover:bg-tobacco-50 cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-full bg-tobacco-300"></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-tobacco-900 truncate">Alex Chen</p>
                    <span className="text-xs text-tobacco-600">1d</span>
                  </div>
                  <p className="text-sm text-tobacco-700 truncate">
                    See you at the event tomorrow!
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 hover:bg-tobacco-50 cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-full bg-tobacco-300"></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-tobacco-900 truncate">Emma Wilson</p>
                    <span className="text-xs text-tobacco-600">2d</span>
                  </div>
                  <p className="text-sm text-tobacco-700 truncate">
                    What blend are you smoking today?
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Area (Right Side) */}
        <div className="hidden md:flex flex-1 flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-tobacco-200 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-tobacco-300"></div>
              <div>
                <p className="font-semibold text-tobacco-900">Mike Thompson</p>
                <p className="text-xs text-green-600">● Online</p>
              </div>
            </div>
            <button className="text-tobacco-600 hover:text-tobacco-900">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Received Message */}
            <div className="flex items-start space-x-3">
              <div className="h-8 w-8 rounded-full bg-tobacco-300 flex-shrink-0"></div>
              <div>
                <div className="bg-tobacco-100 rounded-lg p-3 max-w-md">
                  <p className="text-tobacco-900">
                    Hey! Are you coming to the pipe social this weekend?
                  </p>
                </div>
                <p className="text-xs text-tobacco-600 mt-1">10:30 AM</p>
              </div>
            </div>

            {/* Sent Message */}
            <div className="flex items-start space-x-3 justify-end">
              <div>
                <div className="bg-ember-600 text-white rounded-lg p-3 max-w-md">
                  <p>Absolutely! I'll bring my Peterson Sherlock.</p>
                </div>
                <p className="text-xs text-tobacco-600 mt-1 text-right">10:32 AM</p>
              </div>
            </div>

            {/* Received Message */}
            <div className="flex items-start space-x-3">
              <div className="h-8 w-8 rounded-full bg-tobacco-300 flex-shrink-0"></div>
              <div>
                <div className="bg-tobacco-100 rounded-lg p-3 max-w-md">
                  <p className="text-tobacco-900">
                    Nice! What tobacco are you planning to smoke?
                  </p>
                </div>
                <p className="text-xs text-tobacco-600 mt-1">10:33 AM</p>
              </div>
            </div>

            {/* Sent Message */}
            <div className="flex items-start space-x-3 justify-end">
              <div>
                <div className="bg-ember-600 text-white rounded-lg p-3 max-w-md">
                  <p>Probably some Nightcap. It's my go-to lately.</p>
                </div>
                <p className="text-xs text-tobacco-600 mt-1 text-right">10:35 AM</p>
              </div>
            </div>

            {/* Received Message */}
            <div className="flex items-start space-x-3">
              <div className="h-8 w-8 rounded-full bg-tobacco-300 flex-shrink-0"></div>
              <div>
                <div className="bg-tobacco-100 rounded-lg p-3 max-w-md">
                  <p className="text-tobacco-900">
                    That sounds great! Let me know when you arrive. See you Saturday!
                  </p>
                </div>
                <p className="text-xs text-tobacco-600 mt-1">Just now</p>
              </div>
            </div>
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-tobacco-200">
            <div className="flex items-center space-x-3">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border border-tobacco-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ember-500"
              />
              <button className="px-4 py-2 bg-ember-600 text-white rounded-lg hover:bg-ember-700 font-medium">
                Send
              </button>
            </div>
          </div>
        </div>

        {/* Mobile: Show message to select conversation */}
        <div className="md:hidden flex-1 flex items-center justify-center text-tobacco-600">
          <p>Select a conversation to view messages</p>
        </div>
      </div>
    </div>
  );
}
