import { useState, useEffect } from 'react';
import axios from 'axios';
import { getDynamicsAccessToken } from '../auth/authService';

const API_BASE_URL = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:7071/api';

export interface TimelineItem {
  id: string;
  type: 'post' | 'note';
  text: string;
  modifiedOn: string;
  createdBy: string;
}

export const useTimelineData = (id: string) => {
  const [loading, setLoading] = useState(true);
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const token = await getDynamicsAccessToken();
        const headers = {
          Authorization: token,
          'Content-Type': 'application/json'
        };
        
        // Fetch both posts and annotations
        const [postsResponse, annotationsResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/listPosts?regardingobjectid=${encodeURIComponent(id)}`, { headers }),
          axios.get(`${API_BASE_URL}/listAnnotations?regardingobjectid=${encodeURIComponent(id)}`, { headers })
        ]);

        // Transform posts data
        const posts = postsResponse.data.value.map((post: any) => ({
          id: post.postid,
          type: 'post' as const,
          text: post.text || post.largetext || '',
          modifiedOn: post.modifiedon,
          createdBy: post.createdby?.fullname || 'Unknown User'
        }));

        // Transform annotations data
        const annotations = annotationsResponse.data.value.map((note: any) => ({
          id: note.annotationid,
          type: 'note' as const,
          text: note.notetext || note.subject || '',
          modifiedOn: note.modifiedon,
          createdBy: note.createdby?.fullname || 'Unknown User'
        }));

        // Combine and sort by modified date
        const combined = [...posts, ...annotations]
          .sort((a, b) => new Date(b.modifiedOn).getTime() - new Date(a.modifiedOn).getTime());

        setTimelineItems(combined);
      } catch (err) {
        console.error('Timeline fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  return { timelineItems, loading };
};
