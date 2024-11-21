import { useState, useEffect, useCallback } from 'react';
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

  const fetchData = useCallback(async () => {
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
        text: note.subject ? 
          note.notetext ? 
            `${note.subject}\n\n${note.notetext}` : 
            note.subject
          : note.notetext || '',
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
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const createPost = async (text: string) => {
    try {
      const token = await getDynamicsAccessToken();
      const headers = {
        Authorization: token,
        'Content-Type': 'application/json'
      };

      const response = await axios.post(
        `${API_BASE_URL}/createPost`,
        {
          regardingobjectid: id,
          text
        },
        { headers }
      );

      // Refresh the timeline data to include the new post
      await fetchData();

      return response.data;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  };

  return { timelineItems, loading, createPost };
};
