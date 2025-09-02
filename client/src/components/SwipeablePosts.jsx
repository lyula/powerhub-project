import React from 'react';

// Sample dummy posts with images and links
const posts = [
  {
    id: 1,
    title: 'Welcome to PowerHub!',
    content: 'Check out our new features and updates.',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
    link: 'https://powerhub.com/features',
  },
  {
    id: 2,
    title: 'Community Event',
    content: 'Join our upcoming webinar for exclusive tips.',
    image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80',
    link: 'https://powerhub.com/webinar',
  },
  {
    id: 3,
    title: 'User Story',
    content: 'Read how Jane improved her workflow with PowerHub.',
    image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
    link: 'https://powerhub.com/stories/jane',
  },
  {
    id: 4,
    title: 'Get Started',
    content: 'Explore our documentation and start building today.',
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=400&q=80',
    link: 'https://powerhub.com/docs',
  },
];

const SwipeablePosts = () => {
  return (
    <section className="w-full my-8">
      <h2 className="text-xl font-bold mb-4 text-[#0bb6bc] dark:text-[#0bb6bc]">Well Posts</h2>
      <div className="flex overflow-x-auto gap-4 pb-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
        {posts.map(post => (
          <div
            key={post.id}
            className="min-w-[300px] max-w-xs bg-white dark:bg-[#222] rounded-xl shadow-md p-4 flex-shrink-0 transition-colors duration-300 border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">{post.title}</h3>
            {post.image && (
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-40 object-cover rounded-lg mb-2"
              />
            )}
            <p className="text-gray-700 dark:text-gray-300 mb-2">{post.content}</p>
            {post.link && (
              <a
                href={post.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0bb6bc] dark:text-[#0bb6bc] font-medium underline hover:text-[#099ca1]"
              >
                Learn more
              </a>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default SwipeablePosts;
