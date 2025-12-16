import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

const TestimonialCard = ({ testimonial, index = 0 }) => {
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-all h-full flex flex-col"
    >
      {/* Rating */}
      <div className="flex items-center gap-1 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= testimonial.rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-slate-600'
            }`}
          />
        ))}
      </div>

      {/* Testimonial Text */}
      <p className="text-slate-300 mb-6 flex-1 line-clamp-4">
        "{testimonial.testimonial}"
      </p>

      {/* Author Info */}
      <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
          {testimonial.avatar ? (
            <img
              src={testimonial.avatar}
              alt={testimonial.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span>{getInitials(testimonial.name)}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white truncate">{testimonial.name}</p>
          {testimonial.role && (
            <p className="text-sm text-slate-400 truncate">
              {testimonial.role}
              {testimonial.institution && ` • ${testimonial.institution}`}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TestimonialCard;

