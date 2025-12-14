'use client';

import { useState, useEffect, useRef } from 'react';
import Editor from '../../../components/Editor';
import axios from 'axios';

export default function PostPage({ params }) {
  const [content, setContent] = useState(null);
  const [post, setPost] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const editorRef = useRef(null);

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
    try {
      await axios.put(
        `http://localhost:5000/api/posts/${params.id}`,
        { content },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      alert('Saved!');
    } catch (err) {
      console.error('Error saving post:', err);
      alert('Failed to save post');
    }
  };

  const handleAIGenerate = async () => {
    const brief = prompt('Enter brief for AI generation:');
    if (!brief) return;

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login first');
      return;
    }

    setIsGenerating(true);
    try {
      const res = await axios.post(
        'http://localhost:5000/api/ai/generate',
        {
          postId: params.id,
          brief: brief,
        },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      if (res.data.ok && res.data.generatedText) {
        // TipTap can handle plain text directly - it will convert it to proper format
        const generatedText = res.data.generatedText;
        
        // Set content using editor ref (preferred method)
        if (editorRef.current && editorRef.current.editor) {
          // Use setContent with plain text - TipTap will parse it
          editorRef.current.editor.commands.setContent(generatedText);
          // Update state with the new content
          setContent(editorRef.current.editor.getJSON());
        } else {
          // Fallback: convert to simple paragraph structure
          const tipTapContent = {
            type: 'doc',
            content: generatedText.split('\n\n').filter(p => p.trim()).map(paragraph => ({
              type: 'paragraph',
              content: [{ type: 'text', text: paragraph.trim() }]
            }))
          };
          setContent(tipTapContent);
        }
      } else {
        alert('Failed to generate content');
      }
    } catch (err) {
      console.error('Error generating AI content:', err);
      alert(err.response?.data?.message || 'Failed to generate AI content');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{post?.title}</h1>
      <div className="border rounded-lg p-4 min-h-[400px]">
        <Editor ref={editorRef} content={content} onUpdate={setContent} />
      </div>

      <div className="mt-4 flex gap-2">
        <button 
          onClick={savePost} 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Save
        </button>
        <button 
          onClick={handleAIGenerate} 
          disabled={isGenerating}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {isGenerating ? 'Generating...' : 'Generate AI Content'}
        </button>
      </div>
    </div>
  );
}
