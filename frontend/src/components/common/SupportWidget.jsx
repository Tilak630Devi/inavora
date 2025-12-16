import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X, Mail, MessageSquare, Phone, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SupportWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const supportOptions = [
    {
      icon: Mail,
      title: 'Email Support',
      description: 'support@inavora.com',
      action: () => {
        window.location.href = 'mailto:support@inavora.com?subject=Support Request';
        setIsOpen(false);
      }
    },
    {
      icon: MessageSquare,
      title: 'Contact Form',
      description: 'Send us a message',
      action: () => {
        navigate('/contact');
        setIsOpen(false);
      }
    },
    {
      icon: Phone,
      title: 'Call Us',
      description: '+91 9043411110',
      action: () => {
        window.location.href = 'tel:+919043411110';
        setIsOpen(false);
      }
    }
  ];

  return (
    <>
      {/* Floating Support Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-teal-500 text-white shadow-lg hover:shadow-teal-500/25 transition-all flex items-center justify-center group"
        title="Need Help?"
      >
        <HelpCircle className="w-6 h-6" />
      </motion.button>

      {/* Support Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed bottom-24 right-8 z-50 w-80 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Need Help?</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <p className="text-sm text-slate-400 mb-4">
                Get in touch with our support team
              </p>
              <div className="space-y-2">
                {supportOptions.map((option, index) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={index}
                      onClick={option.action}
                      className="w-full flex items-center gap-3 p-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors text-left group"
                    >
                      <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                        <Icon className="w-5 h-5 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-white text-sm">{option.title}</p>
                        <p className="text-xs text-slate-400">{option.description}</p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-slate-400" />
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default SupportWidget;

