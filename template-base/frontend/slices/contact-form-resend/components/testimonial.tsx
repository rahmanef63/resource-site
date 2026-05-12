'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

const ClientTestimonials = () => {
  const testimonialsData = useQuery(api.testimonials.list);

  const testimonials = testimonialsData
    ? [...testimonialsData].sort((a, b) => a.order - b.order)
    : [];

  if (!testimonialsData) {
    return (
      <section className="w-full">
        <Card className="bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">What Our Clients Say</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-lg bg-card p-6 shadow-sm">
                  <div className="h-6 bg-gray-200 animate-pulse rounded w-32 mb-3" />
                  <div className="h-20 bg-gray-200 animate-pulse rounded" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="w-full ">
      <Card className="bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">What Our Clients Say</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.testimonialId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                  ease: "easeOut"
                }}
                className="rounded-lg bg-card p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <h3 className="text-xl font-semibold mb-3">{testimonial.name}</h3>
                <p className="text-muted-foreground leading-relaxed">{testimonial.content}</p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default ClientTestimonials;
