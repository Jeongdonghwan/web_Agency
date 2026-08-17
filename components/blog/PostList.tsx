import Link from 'next/link';
import type { Post } from '../../lib/posts';

const PostList = ({ posts }: { posts: Post[] }) => {
  if (posts.length === 0) {
    return <p style={{ color: 'var(--text-light)' }}>아직 발행된 글이 없습니다.</p>;
  }
  return (
    <div className="post-list">
      {posts.map((post) => (
        <Link key={post.slug} href={`/blog/${post.slug}/`} className="post-card">
          <h2>{post.title}</h2>
          <p>{post.description}</p>
          <div className="post-meta">
            <time dateTime={post.date}>{post.date}</time>
            {post.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="post-tag">{tag}</span>
            ))}
          </div>
        </Link>
      ))}
    </div>
  );
};

export default PostList;
