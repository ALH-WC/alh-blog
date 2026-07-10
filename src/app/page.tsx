import { redirect } from 'next/navigation';

// The pilot only ships the blog. Root sends visitors to the guide.
export default function Home() {
  redirect('/blog');
}
