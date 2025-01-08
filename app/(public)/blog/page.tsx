import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const posts = [
  {
    title: "Understanding Electronic Health Records",
    excerpt:
      "A comprehensive guide to managing your digital health information...",
    date: "2024-01-25",
    image: "/placeholder.svg?height=400&width=600",
    slug: "understanding-ehr",
  },
  {
    title: "The Future of Telemedicine",
    excerpt: "How virtual healthcare is transforming medical consultations...",
    date: "2024-01-24",
    image: "/placeholder.svg?height=400&width=600",
    slug: "future-of-telemedicine",
  },
  // Add more blog posts as needed
];

export default function BlogPage() {
  return (
    <main className="flex-1 pt-16">
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-50">
        <div className="container px-4 md:px-6">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12">
            Latest Updates
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative h-48 w-full">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle>{post.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500 mb-2">{post.excerpt}</p>
                    <time className="text-xs text-gray-400">{post.date}</time>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
