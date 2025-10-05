const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface User {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  avatarUrl: string | null;
  coverPhotoUrl: string | null;
  isVerified: boolean;
  defaultClubId?: string | null;
  createdAt: string;
  isFollowing?: boolean;
  _count?: {
    posts: number;
    followers: number;
    following: number;
  };
}

interface UpdateProfileData {
  displayName?: string;
  bio?: string;
  location?: string;
  website?: string;
  avatarUrl?: string;
  coverPhotoUrl?: string;
  defaultClubId?: string | null;
}

interface Post {
  id: string;
  content: string;
  imageUrl: string | null;
  authorId: string;
  createdAt: string;
  author: {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
    isVerified: boolean;
  };
  club?: {
    id: string;
    name: string;
    slug: string;
  };
  _count: {
    likes: number;
    comments: number;
  };
}

interface Club {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  avatarUrl: string | null;
  coverUrl: string | null;
  isPrivate: boolean;
  creatorId: string;
  memberCount: number;
  createdAt: string;
  creator: {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
  _count: {
    members: number;
    posts: number;
  };
}

interface ClubMember {
  id: string;
  clubId: string;
  userId: string;
  role: 'OWNER' | 'ADMIN' | 'MODERATOR' | 'MEMBER';
  joinedAt: string;
  user: {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
    isVerified: boolean;
  };
}

interface CreateClubData {
  name: string;
  slug: string;
  description?: string;
  isPrivate?: boolean;
  avatarUrl?: string;
  coverUrl?: string;
}

interface ClubInvite {
  id: string;
  clubId: string;
  email: string;
  invitedBy: string;
  token: string;
  expiresAt: string;
  accepted: boolean;
  createdAt: string;
  club?: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    avatarUrl?: string;
    isPrivate: boolean;
    memberCount: number;
  };
}

interface Review {
  id: string;
  title: string;
  content: string;
  rating: number;
  category: 'PIPE_TOBACCO' | 'CIGAR' | 'PIPE' | 'ACCESSORY';
  productName: string;
  brand: string | null;
  imageUrl: string | null;
  clubId: string | null;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
    isVerified: boolean;
  };
  club?: {
    id: string;
    name: string;
    slug: string;
  };
}

interface CreateReviewData {
  title: string;
  content: string;
  rating: number;
  category: 'PIPE_TOBACCO' | 'CIGAR' | 'PIPE' | 'ACCESSORY';
  productName: string;
  brand?: string;
  imageUrl?: string;
  clubId?: string;
}

interface Report {
  id: string;
  reason: 'SPAM' | 'HARASSMENT' | 'INAPPROPRIATE_CONTENT' | 'MISINFORMATION' | 'OTHER';
  description: string | null;
  status: 'PENDING' | 'REVIEWED' | 'RESOLVED' | 'DISMISSED';
  reporterId: string;
  reportedUserId: string | null;
  reportedPostId: string | null;
  reportedCommentId: string | null;
  createdAt: string;
  updatedAt: string;
  reporter: {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
    isVerified: boolean;
  };
  reportedUser?: {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
    isVerified: boolean;
  };
  reportedPost?: Post;
  reportedComment?: any;
}

interface CreateReportData {
  reason: 'SPAM' | 'HARASSMENT' | 'INAPPROPRIATE_CONTENT' | 'MISINFORMATION' | 'OTHER';
  description?: string;
  reportedUserId?: string;
  reportedPostId?: string;
  reportedCommentId?: string;
}

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async handleResponse(response: Response) {
    if (response.status === 401) {
      // Clear invalid token and redirect to login
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
      throw new Error('Authentication required. Please log in.');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'An error occurred' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth
  async getCurrentUser(): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/api/users/me`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // User Search
  async searchUsers(query: string): Promise<User[]> {
    const response = await fetch(`${API_BASE_URL}/api/users/search?q=${encodeURIComponent(query)}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // User Profile
  async getUserProfile(username: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/api/users/${username}`, {
      headers: this.getAuthHeaders(),
    });
    const data = await this.handleResponse(response);
    console.log('=== API getUserProfile Response ===');
    console.log('Username:', username);
    console.log('Response data:', data);
    console.log('isFollowing in response:', data.isFollowing);
    console.log('==================================');
    return data;
  }

  async updateProfile(data: UpdateProfileData): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/api/users/me`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update profile');
    }

    return response.json();
  }

  // User Posts
  async getUserPosts(username: string, limit = 20, offset = 0): Promise<Post[]> {
    const response = await fetch(
      `${API_BASE_URL}/api/users/${username}/posts?limit=${limit}&offset=${offset}`,
      {
        headers: this.getAuthHeaders(),
      }
    );
    return this.handleResponse(response);
  }

  // Follow/Unfollow
  async followUser(username: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/users/${username}/follow`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to follow user' }));
      throw new Error(error.error || 'Failed to follow user');
    }
  }

  async unfollowUser(username: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/users/${username}/follow`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to unfollow user' }));
      throw new Error(error.error || 'Failed to unfollow user');
    }
  }

  // Followers/Following
  async getFollowers(username: string, limit = 20, offset = 0): Promise<User[]> {
    const response = await fetch(
      `${API_BASE_URL}/api/users/${username}/followers?limit=${limit}&offset=${offset}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch followers');
    }

    return response.json();
  }

  async getFollowing(username: string, limit = 20, offset = 0): Promise<User[]> {
    const response = await fetch(
      `${API_BASE_URL}/api/users/${username}/following?limit=${limit}&offset=${offset}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch following');
    }

    return response.json();
  }

  // Posts
  async getFeed(limit = 20, offset = 0): Promise<Post[]> {
    const response = await fetch(
      `${API_BASE_URL}/api/posts/feed?limit=${limit}&offset=${offset}`,
      {
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch feed');
    }

    return response.json();
  }

  async getPost(postId: string): Promise<Post> {
    const response = await fetch(`${API_BASE_URL}/api/posts/${postId}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Post not found');
      }
      throw new Error('Failed to fetch post');
    }

    return response.json();
  }

  async createPost(content: string, imageUrl?: string, clubId?: string): Promise<Post> {
    const response = await fetch(`${API_BASE_URL}/api/posts`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ content, imageUrl, clubId }),
    });

    if (!response.ok) {
      throw new Error('Failed to create post');
    }

    return response.json();
  }

  async deletePost(postId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/posts/${postId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    await this.handleResponse(response);
  }

  async likePost(postId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/like`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    await this.handleResponse(response);
  }

  async unlikePost(postId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/like`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    await this.handleResponse(response);
  }

  async getComments(postId: string, limit = 20, offset = 0) {
    const response = await fetch(
      `${API_BASE_URL}/api/posts/${postId}/comments?limit=${limit}&offset=${offset}`,
      {
        headers: this.getAuthHeaders(),
      }
    );

    return this.handleResponse(response);
  }

  async createComment(postId: string, content: string) {
    const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/comments`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      throw new Error('Failed to create comment');
    }

    return response.json();
  }

  // Clubs
  async getClubs(): Promise<Club[]> {
    const response = await fetch(`${API_BASE_URL}/api/clubs`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch clubs');
    }

    return response.json();
  }

  async getMyClubs(): Promise<Club[]> {
    const response = await fetch(`${API_BASE_URL}/api/clubs/my-clubs`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch your clubs');
    }

    return response.json();
  }

  async getClub(slug: string): Promise<Club & { members: ClubMember[]; userMembership: ClubMember | null }> {
    const response = await fetch(`${API_BASE_URL}/api/clubs/${slug}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch club');
    }

    return response.json();
  }

  async createClub(data: CreateClubData): Promise<Club> {
    const response = await fetch(`${API_BASE_URL}/api/clubs`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create club');
    }

    return response.json();
  }

  async updateClub(slug: string, data: Partial<CreateClubData>): Promise<Club> {
    const response = await fetch(`${API_BASE_URL}/api/clubs/${slug}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update club');
    }

    return response.json();
  }

  async deleteClub(slug: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/clubs/${slug}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete club');
    }
  }

  async joinClub(slug: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/clubs/${slug}/join`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to join club');
    }
  }

  async leaveClub(slug: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/clubs/${slug}/leave`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to leave club');
    }
  }

  async getClubPosts(slug: string, limit = 20, offset = 0): Promise<Post[]> {
    const response = await fetch(
      `${API_BASE_URL}/api/clubs/${slug}/posts?limit=${limit}&offset=${offset}`,
      {
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch club posts');
    }

    return response.json();
  }

  async updateMemberRole(slug: string, memberId: string, role: 'ADMIN' | 'MODERATOR' | 'MEMBER'): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/clubs/${slug}/members/${memberId}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ role }),
    });

    if (!response.ok) {
      throw new Error('Failed to update member role');
    }
  }

  // Club Invitations
  async createClubInvite(slug: string, email: string): Promise<ClubInvite> {
    const response = await fetch(`${API_BASE_URL}/api/clubs/${slug}/invites`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create invitation');
    }

    return response.json();
  }

  async getClubInvites(slug: string): Promise<ClubInvite[]> {
    const response = await fetch(`${API_BASE_URL}/api/clubs/${slug}/invites`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch invitations');
    }

    return response.json();
  }

  async getInviteByToken(token: string): Promise<ClubInvite> {
    const response = await fetch(`${API_BASE_URL}/api/clubs/invites/${token}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch invitation');
    }

    return response.json();
  }

  async acceptClubInvite(token: string): Promise<{ message: string; club: Club }> {
    const response = await fetch(`${API_BASE_URL}/api/clubs/invites/${token}/accept`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to accept invitation');
    }

    return response.json();
  }

  async revokeClubInvite(slug: string, inviteId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/clubs/${slug}/invites/${inviteId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to revoke invitation');
    }
  }

  // File Upload
  async uploadFile(file: File): Promise<{ url: string; filename: string; mimetype: string; size: number }> {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_BASE_URL}/api/upload`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload file');
    }

    return response.json();
  }

  // Messaging
  async getConversations(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/api/messages/conversations`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch conversations');
    }

    return response.json();
  }

  async getClubConversation(slug: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/messages/clubs/${slug}/conversation`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch club conversation');
    }

    return response.json();
  }

  async sendClubMessage(slug: string, content: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/messages/clubs/${slug}/conversation/messages`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      throw new Error('Failed to send club message');
    }

    return response.json();
  }

  async markClubMessagesRead(slug: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/messages/clubs/${slug}/conversation/read`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to mark club messages as read');
    }
  }

  async getConversation(username: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/messages/conversations/${username}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch conversation');
    }

    return response.json();
  }

  async sendMessage(username: string, content: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/messages/conversations/${username}/messages`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      throw new Error('Failed to send message');
    }

    return response.json();
  }

  async markConversationRead(conversationId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/messages/conversations/${conversationId}/read`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to mark conversation as read');
    }
  }

  // Events
  async getClubEvents(slug: string): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/api/clubs/${slug}/events`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch events');
    }

    return response.json();
  }

  async getEvent(id: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/events/${id}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch event');
    }

    return response.json();
  }

  async createEvent(slug: string, data: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/clubs/${slug}/events`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create event');
    }

    return response.json();
  }

  async updateEvent(id: string, data: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/events/${id}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update event');
    }

    return response.json();
  }

  async deleteEvent(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/events/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete event');
    }
  }

  async rsvpToEvent(id: string, status: 'GOING' | 'MAYBE' | 'NOT_GOING'): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/events/${id}/rsvp`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error('Failed to RSVP to event');
    }

    return response.json();
  }

  async getUserRsvp(id: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/events/${id}/rsvp/me`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null; // No RSVP yet
      }
      throw new Error('Failed to fetch RSVP');
    }

    return response.json();
  }

  async removeRsvp(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/events/${id}/rsvp`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to remove RSVP');
    }
  }

  async getMyRsvp(id: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/events/${id}/rsvp/me`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  }

  // Notifications
  async getNotifications(limit: number = 20, offset: number = 0): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/api/notifications?limit=${limit}&offset=${offset}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch notifications');
    }

    return response.json();
  }

  async getUnreadNotificationCount(): Promise<{ count: number }> {
    const response = await fetch(`${API_BASE_URL}/api/notifications/unread-count`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch unread count');
    }

    return response.json();
  }

  async markNotificationAsRead(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/notifications/${id}/read`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to mark notification as read');
    }
  }

  async markAllNotificationsAsRead(): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/notifications/mark-all-read`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to mark all notifications as read');
    }
  }

  async getNotificationPreferences(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/notifications/preferences`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch notification preferences');
    }

    return response.json();
  }

  async updateNotificationPreferences(preferences: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/notifications/preferences`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(preferences),
    });

    if (!response.ok) {
      throw new Error('Failed to update notification preferences');
    }

    return response.json();
  }

  async subscribeToPushNotifications(subscription: PushSubscription): Promise<void> {
    const subscriptionData = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
        auth: arrayBufferToBase64(subscription.getKey('auth')!),
      },
      userAgent: navigator.userAgent,
    };

    const response = await fetch(`${API_BASE_URL}/api/notifications/push/subscribe`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(subscriptionData),
    });

    if (!response.ok) {
      throw new Error('Failed to subscribe to push notifications');
    }
  }

  async unsubscribeFromPushNotifications(endpoint: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/notifications/push/unsubscribe`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ endpoint }),
    });

    if (!response.ok) {
      throw new Error('Failed to unsubscribe from push notifications');
    }
  }

  async getVapidPublicKey(): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/api/notifications/vapid-public-key`);

    if (!response.ok) {
      throw new Error('Failed to fetch VAPID public key');
    }

    const data = await response.json();
    return data.publicKey;
  }

  // Reviews
  async getReviews(params?: { category?: string; clubSlug?: string; limit?: number; offset?: number }): Promise<Review[]> {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category);
    if (params?.clubSlug) queryParams.append('clubSlug', params.clubSlug);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const response = await fetch(
      `${API_BASE_URL}/api/reviews?${queryParams.toString()}`,
      {
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch reviews');
    }

    return response.json();
  }

  async getReview(reviewId: string): Promise<Review> {
    const response = await fetch(`${API_BASE_URL}/api/reviews/${reviewId}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch review');
    }

    return response.json();
  }

  async createReview(data: CreateReviewData): Promise<Review> {
    const response = await fetch(`${API_BASE_URL}/api/reviews`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create review');
    }

    return response.json();
  }

  async updateReview(reviewId: string, data: Partial<CreateReviewData>): Promise<Review> {
    const response = await fetch(`${API_BASE_URL}/api/reviews/${reviewId}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update review');
    }

    return response.json();
  }

  async deleteReview(reviewId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/reviews/${reviewId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete review');
    }
  }

  async getUserReviews(username: string, limit?: number, offset?: number): Promise<Review[]> {
    const queryParams = new URLSearchParams();
    if (limit) queryParams.append('limit', limit.toString());
    if (offset) queryParams.append('offset', offset.toString());

    const response = await fetch(
      `${API_BASE_URL}/api/reviews/user/${username}?${queryParams.toString()}`,
      {
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch user reviews');
    }

    return response.json();
  }

  // Reports
  async createReport(data: CreateReportData): Promise<Report> {
    const response = await fetch(`${API_BASE_URL}/api/reports`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create report');
    }

    return response.json();
  }

  async getReports(params?: { status?: string; limit?: number; offset?: number }): Promise<Report[]> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const response = await fetch(
      `${API_BASE_URL}/api/reports?${queryParams.toString()}`,
      {
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch reports');
    }

    return response.json();
  }

  async getReport(reportId: string): Promise<Report> {
    const response = await fetch(`${API_BASE_URL}/api/reports/${reportId}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch report');
    }

    return response.json();
  }

  async updateReportStatus(reportId: string, status: 'PENDING' | 'REVIEWED' | 'RESOLVED' | 'DISMISSED'): Promise<Report> {
    const response = await fetch(`${API_BASE_URL}/api/reports/${reportId}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update report');
    }

    return response.json();
  }

  async deleteReport(reportId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/reports/${reportId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete report');
    }
  }
}

// Helper function to convert ArrayBuffer to base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export const api = new ApiService();
export type { User, UpdateProfileData, Post, Club, ClubMember, CreateClubData, ClubInvite, Review, CreateReviewData, Report, CreateReportData };
