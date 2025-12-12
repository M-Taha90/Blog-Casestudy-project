'use client';

import { useState, useEffect } from 'react';
import Editor from '../../../components/Editor';
import axios from 'axios';

export default function PostPage({ params }) {
  const [content, setContent] = useState(null);
  const [post, setPost] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/posts/id/${params.id}`)
      .then(res => {
        setPost(res.data);
        setContent(res.data.content);
      })
      .catch(err => {
        console.error('Error fetching post:', err);
      });
  }, [params.id]);

  const savePost = async () => {
    await axios.put(
      `http://localhost:5000/api/posts/${params.id}`,
      { content },
      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
    );
    alert('Saved!');
  };

  const generateAI = async () => {
    const brief = prompt('Enter brief for AI generation');
    const res = await axios.post(
      `http://localhost:5000/api/posts/${params.id}/generate`,
      { brief },
      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
    );
    setContent(res.data.content);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">{post?.title}</h1>
      <Editor content={content} onUpdate={setContent} />

      <div className="mt-4 flex gap-2">
        <button onClick={savePost} className="p-2 bg-blue-500 text-white rounded">
          Save
        </button>
        <button onClick={generateAI} className="p-2 bg-green-500 text-white rounded">
          AI Generate
        </button>
      </div>
    </div>
  );
}
