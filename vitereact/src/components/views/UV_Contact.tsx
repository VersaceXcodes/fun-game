import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/store/main';
import { z } from 'zod';
import { Link } from 'react-router-dom';

// Define client-side Zod schema for form validation
const ContactFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  message: z.string().min(1, 'Message is required').max(1000),
});

type ContactFormData = {
  name: string;
  email: string;
  message: string;
};

const UV_Contact: React.FC = () => {
  // Get authentication state from global store
  const currentUser = useAppStore(state => state.authentication_state.current_user);
  const isLoadingAuth = useAppStore(state => state.authentication_state.authentication_status.is_loading);

  // Form state
  const [contactForm, setContactForm] = useState<ContactFormData>({
    name: '',
    email: '',
    message: '',
  });
  const [formErrors, setFormErrors({});
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  // Pre-fill form with user data if authenticated
  useEffect(() => {
    if (currentUser &&!isLoadingAuth) {
      setContactForm({
        name: currentUser.name || '',
        email: currentUser.email || '',
        message: '',
      });
    }
  }, [currentUser, isLoadingAuth]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setContactForm(prev => ({...prev, [name]: value }));
    // Clear errors when input changes
    setFormErrors(prev => ({...prev, [name]: null }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionStatus('submitting');
    setFormErrors({});

    try {
      // Validate form data
      const result = ContactFormSchema.safeParse(contactForm);
      if (!result.success) {
        setFormErrors(result.error.issues.reduce((acc, issue) => {
          acc[issue.path[0]] = issue.message;
          return acc;
        }, {} as Record<string, string>));
        setSubmissionStatus('idle');
        return;
      }

      // Simulate API submission (endpoint not available in OpenAPI)
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

      // In a real implementation, this would be:
      // await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/contact`, contactForm);
      
      setSubmissionStatus('success');
      // Reset form on success
      setContactForm({ name: '', email: '', message: '' });
    } catch (error) {
      setSubmissionStatus('error');
      // In real implementation, handle actual API errors
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-lg rounded-xl p-8 md:p-12 lg:p-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Contact Us
            </h2>
            
            <form 
              onSubmit={handleSubmit} 
              className="space-y-6"
              aria-label="Contact form"
            >
              {/* Name Field */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label 
                    htmlFor="name" 
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={contactForm.name}
                    onChange={handleInputChange}
                    className={`block w-full px-4 py-2 border-2 rounded-lg shadow-sm 
                      ${formErrors.name? 'border-red-500' : 'border-gray-300'} 
                      focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500`}
                    aria-invalid={!!formErrors.name}
                    aria-describedby={formErrors.name? "name-error" : undefined}
                  />
                  {formErrors.name && (
                    <div id="name-error" className="text-sm text-red-500 mt-1">
                      {formErrors.name}
                    </div>
                  )}
                </div>
                
                {/* Email Field */}
                <div>
                  <label 
                    htmlFor="email" 
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={contactForm.email}
                    onChange={handleInputChange}
                    className={`block w-full px-4 py-2 border-2 rounded-lg shadow-sm 
                      ${formErrors.email? 'border-red-500' : 'border-gray-300'} 
                      focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500`}
                    aria-invalid={!!formErrors.email}
                    aria-describedby={formErrors.email? "email-error" : undefined}
                  />
                  {formErrors.email && (
                    <div id="email-error" className="text-sm text-red-500 mt-1">
                      {formErrors.email}
                    </div>
                  )}
                </div>
              </div>

              {/* Message Field */}
              <div>
                <label 
                  htmlFor="message" 
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Your Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={contactForm.message}
                  onChange={handleInputChange}
                  className={`block w-full px-4 py-2 border-2 rounded-lg shadow-sm 
                    ${formErrors.message? 'border-red-500' : 'border-gray-300'} 
                    focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500`}
                  aria-invalid={!!formErrors.message}
                  aria-describedby={formErrors.message? "message-error" : undefined}
                />
                {formErrors.message && (
                  <div id="message-error" className="text-sm text-red-500 mt-1">
                    {formErrors.message}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submissionStatus === 'submitting'}
                  className={`px-6 py-3 rounded-lg font-medium text-white 
                    ${submissionStatus === 'submitting' 
                     ? 'bg-blue-600 opacity-70 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700 transition-all'}
                  `}
                >
                  {submissionStatus === 'submitting'? (
                    <span className="flex items-center">
                      <svg 
                        className="animate-spin h-4 w-4 text-white mr-2" 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24"
                      >
                        <circle 
                          className="opacity-25" 
                          cx="12" 
                          cy="12" 
                          r="10" 
                          stroke="currentColor" 
                          strokeWidth="4"
                        ></circle>
                        <path 
                          className="opacity-75" 
                          fill="currentColor" 
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Submitting...
                    </span>
                  ) : (
                    'Submit'
                  )}
                </button>
              </div>
            </form>

            {/* Submission Status */}
            {submissionStatus === 'success' && (
              <div 
                className="bg-green-50 border border-green-200 p-4 rounded-lg mt-8"
                role="alert"
                aria-live="polite"
              >
                <h3 className="text-lg font-bold text-green-800 mb-2">
                  Message Sent!
                </h3>
                <p className="text-sm text-green-700">
                  Thank you for contacting us. We'll respond to your message as soon as possible.
                </p>
              </div>
            )}

            {submissionStatus === 'error' && (
              <div 
                className="bg-red-50 border border-red-200 p-4 rounded-lg mt-8"
                role="alert"
                aria-live="polite"
              >
                <h3 className="text-lg font-bold text-red-800 mb-2">
                  Error
                </h3>
                <p className="text-sm text-red-700">
                  There was a problem submitting your message. Please try again later.
                </p>
              </div>
            )}

            {/* Alternative Contact Methods */}
            <div className="mt-12">
              <h3 className="text-xl font-semibold text-gray-700 mb-4">
                Alternative Contact Methods
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-6 w-6 text-blue-500" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M3 8l2.89 5.26a2 2 0 002.22 2.22l3.64-6.02A9.038 9.038 0 006.96 3C3.02 3 0 5.02 0 8c0 3.03 3.01 5.65 6.5 6.84L9.34 14.34a8.001 8.001 0 001.64 2.12l2.82 1.79C18.1 21.47 22 17.4 22 12.5 22 6.59 17.41 2 12.5 6.5 1.56 3.11-.39 3 0s-.55 1.34-.38 2M21 12a2 2 0 11-4 0 4 0 0 0 0 4 4 0 0 4 4 0 0-4-4m7-6v6m0 0v6"
                    ></path>
                  </svg>
                  <a 
                    href="mailto:support@fun-game.com" 
                    className="text-sm text-blue-600 hover:underline"
                  >
                    support@fun-game.com
                  </a>
                </div>
                
                <div className="flex items-center space-x-3">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-6 w-6 text-blue-400" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M15 17h5l-4 4V4.5a2 2 0 00-2-2V2.5c0-.276.074-.64.2-.87M4.5 3v9.5a1.5 1.5 0 001.5 1.5h8.25m-1.5-1.5l-2.5 2.5M7.5 12l2.5 2.5M7.5 12l-.75 3M17.25 12l-.75-3m0 0l.75-3M21 12a9 9 0 11-18 0 9 0 0 0 0 18 0"
                    ></path>
                  </svg>
                  <a 
                    href="https://twitter.com/fungame" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-sm text-blue-400 hover:underline"
                  >
                    @fungame (Twitter)
                  </a>
                </div>
                
                <div className="flex items-center space-x-3">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-6 w-6 text-blue-500" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M12 6.354l1.5 1.5m-6 5h.01M21 12a9 9 0 11-18 0 9 0 0 0 0 18 0m-6.5 3.5a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0z"
                    ></path>
                  </svg>
                  <a 
                    href="https://facebook.com/fungame" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-sm text-blue-500 hover:underline"
                  >
                    Facebook Page
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UV_Contact;