'use client';

import React, { useState } from 'react';
import { useEZForm } from '@/hooks/useEZForm';
import { FormSuccessMessage, FormErrorMessage, FormLoadingSpinner } from '@/components/forms/EZFormWrapper';
import { useInternBrevo } from '@/hooks/useBrevo';

const InternPage = () => {
  const [currentStep, setCurrentStep] = useState(1);

  // Brevo integration for intern applications
  const { submitApplication: submitToBrevo } = useInternBrevo();

  // EZForms hook for handling form submission
  const { isSubmitting, isSuccess, error, submitForm } = useEZForm({
    formName: 'Internship Application',
    requiredFields: ['fullName', 'email', 'phone', 'collegeName', 'course', 'startDate', 'endDate'],
    onSuccess: async () => {
      console.log('##Rohit_Rocks## Intern Page - Form Success, submitting to Brevo:', {
        email: formData.email,
        fullName: formData.fullName,
        hasPhone: !!formData.phone,
        hasCollegeName: !!formData.collegeName,
        hasCourse: !!formData.course,
        timestamp: new Date().toISOString()
      });

      // Submit to Brevo for email automation
      try {
        console.log('##Rohit_Rocks## Intern Page - Calling submitToBrevo');
        const brevoResult = await submitToBrevo(
          formData.email,
          formData.fullName,
          formData.phone || undefined,
          formData.collegeName || undefined,
          formData.course || undefined
        );
        console.log('##Rohit_Rocks## Intern Page - Brevo submission result:', brevoResult);
      } catch (error) {
        console.error('##Rohit_Rocks## Intern Page - Brevo submission error:', error);
        console.error('Brevo submission error:', error);
      }

      // Reset form and go back to step 1 on success
      setCurrentStep(1);
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        collegeName: '',
        course: '',
        degree: '',
        startDate: '',
        endDate: '',
        country: '',
        state: '',
        district: '',
        contributions: [],
        statementOfPurpose: null,
        cvResume: null,
        writingSamples: null
      });
    }
  });

  const [formData, setFormData] = useState({
    // Step 1 - Personal Info
    fullName: '',
    email: '',
    phone: '',
    collegeName: '',
    course: '',
    degree: '',

    // Step 2 - Internship Details
    startDate: '',
    endDate: '',
    country: '',
    state: '',
    district: '',
    contributions: [] as string[],

    // Step 3 - Upload Documents
    statementOfPurpose: null as File | null,
    cvResume: null as File | null,
    writingSamples: null as File | null
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      contributions: prev.contributions.includes(value)
        ? prev.contributions.filter(item => item !== value)
        : [...prev.contributions, value]
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    setFormData(prev => ({
      ...prev,
      [fieldName]: file
    }));
  };

  const handleNextSection = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSubmitApplication = async () => {
    // Prepare form data for submission (excluding file uploads for now)
    const submissionData = {
      ...formData,
      // Convert file objects to file names for now
      // In a real implementation, you'd upload files separately
      statementOfPurpose: formData.statementOfPurpose?.name || null,
      cvResume: formData.cvResume?.name || null,
      writingSamples: formData.writingSamples?.name || null,
      contributions: formData.contributions.join(', ')
    };

    await submitForm(submissionData);
  };

  return (
    <div className="min-h-screen bg-background py-10 md:py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left Content Section */}
          <div className=" md:px-8 ">
            <h1 className="text-4xl font-bold text-foreground mb-6">
            Intern with PARI
            </h1>
            <p className="text-xl text-muted-foreground mb-2">
             We need your support
            </p>

            <div className="space-y-6 text-muted-foreground">
              <p className="text-base leading-relaxed">
               An internship with PARI will get you to explore and engage with the issues of our times – inequalities in socio, economic, cultural, legal and other areas. Internships include researching, reviewing, interviewing, writing, documenting, verifying, photographing, filming and illustrating stories on rural and marginalised communities.
              </p>
              
              <p className="text-base leading-relaxed">
                An internship with PARI will get you to explore and engage with the issues of our times – inequalities in socio, economic, cultural, legal and other areas. Internships include researching, reviewing, interviewing, writing, documenting, verifying, photographing, filming and illustrating stories on rural and marginalised communities.
              </p>
              
              <p className="text-base leading-relaxed">
                PARI offers rolling internships through the year, so you can apply anytime. The minimum period for an internship with PARI is 2-3 months. 
              </p>

              <p className="text-base leading-relaxed">
              We encourage all interns to spend time in the field – in rural India, and or among marginalised communities in urban spaces. You can start by filling the following internship form, and we will reach out to you.
              </p>
            </div>
          </div>

          {/* Right Form Section */}
          <div className="bg-popover dark:bg-popover p-8 rounded-lg shadow-sm border border-border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-card-foreground">
                {currentStep === 1 && 'Internship form'}
                {currentStep === 2 && 'Internship form'}
                {currentStep === 3 && 'Profile form'}
              </h2>
              <div className="flex items-center space-x-3">
               
                <div className="relative w-10 h-10">
                  <svg className="w-10 h-10 transform font-extrabold -rotate-90" viewBox="0 0 36 36">
                    {/* Background circle */}
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="4"
                    />
                    {/* Progress circle */}
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#B82929"
                      strokeWidth="4"
                      strokeDasharray={`${(currentStep / 3) * 100}, 100`}
                      className="transition-all duration-300 ease-in-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-medium text-muted-foreground">{currentStep}</span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-muted-foreground mb-8">
              Help us best assess your skills for PARI
            </p>

            {/* Step 1: Personal Info */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wide">
                    PERSONAL INFO
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <input
                        type="text"
                        name="fullName"
                        placeholder="Full name"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary-PARI-Red focus:border-primary-PARI-Red outline-none bg-background"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary-PARI-Red focus:border-primary-PARI-Red outline-none bg-background"
                      />
                      <input
                        type="tel"
                        name="phone"
                        placeholder="Phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary-PARI-Red focus:border-primary-PARI-Red outline-none bg-background"
                      />
                    </div>

                    <div>
                      <input
                        type="text"
                        name="collegeName"
                        placeholder="College/University Name"
                        value={formData.collegeName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary-PARI-Red focus:border-primary-PARI-Red outline-none bg-background"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        name="course"
                        placeholder="Course"
                        value={formData.course}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary-PARI-Red focus:border-primary-PARI-Red outline-none bg-background"
                      />
                      <select
                        name="degree"
                        value={formData.degree}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary-PARI-Red focus:border-primary-PARI-Red outline-none bg-background"
                      >
                        <option value="">BA</option>
                        <option value="ba">BA</option>
                        <option value="bsc">BSc</option>
                        <option value="bcom">BCom</option>
                        <option value="ma">MA</option>
                        <option value="msc">MSc</option>
                        <option value="mcom">MCom</option>
                        <option value="phd">PhD</option>
                      </select>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleNextSection}
                  className="w-full bg-primary-PARI-Red text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-PARI-Red/90 transition-colors duration-200"
                >
                  Next Section
                </button>
              </div>
            )}

            {/* Step 2: Internship Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wide">
                    INTERNSHIP DETAILS
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Proposed Dates of internship (minimum period is 2 months)*
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="date"
                          name="startDate"
                          placeholder="Start date"
                          value={formData.startDate}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary-PARI-Red focus:border-primary-PARI-Red outline-none bg-background"
                        />
                        <input
                          type="date"
                          name="endDate"
                          placeholder="End date"
                          value={formData.endDate}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary-PARI-Red focus:border-primary-PARI-Red outline-none bg-background"
                        />
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Where will you be located during the internship?
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <select
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary-PARI-Red focus:border-primary-PARI-Red outline-none bg-background"
                        >
                          <option value="">Country</option>
                          <option value="india">India</option>
                          <option value="usa">USA</option>
                          <option value="uk">UK</option>
                          <option value="canada">Canada</option>
                          <option value="australia">Australia</option>
                        </select>

                        <select
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary-PARI-Red focus:border-primary-PARI-Red outline-none bg-background"
                        >
                          <option value="">State</option>
                          <option value="maharashtra">Maharashtra</option>
                          <option value="delhi">Delhi</option>
                          <option value="karnataka">Karnataka</option>
                          <option value="tamil-nadu">Tamil Nadu</option>
                          <option value="gujarat">Gujarat</option>
                        </select>

                        <select
                          name="district"
                          value={formData.district}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary-PARI-Red focus:border-primary-PARI-Red outline-none bg-background"
                        >
                          <option value="">District</option>
                          <option value="mumbai">Mumbai</option>
                          <option value="pune">Pune</option>
                          <option value="nashik">Nashik</option>
                          <option value="nagpur">Nagpur</option>
                          <option value="aurangabad">Aurangabad</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-3">
                        How would you like to contribute to PARI?
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <label className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={formData.contributions.includes('report-story')}
                              onChange={() => handleCheckboxChange('report-story')}
                              className="w-4 h-4 accent-primary-PARI-Red  focus:ring-primary-PARI-Red border-gray-300 rounded"
                            />
                            <span className="text-sm text-muted-foreground">Report and write a story</span>
                          </label>

                          <label className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={formData.contributions.includes('library-research')}
                              onChange={() => handleCheckboxChange('library-research')}
                              className="w-4 h-4 accent-primary-PARI-Red  focus:ring-primary-PARI-Red border-gray-300 rounded"
                            />
                            <span className="text-sm text-muted-foreground">Write and research with Library</span>
                          </label>

                          <label className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={formData.contributions.includes('faces')}
                              onChange={() => handleCheckboxChange('faces')}
                              className="w-4 h-4 accent-primary-PARI-Red focus:ring-primary-PARI-Red border-gray-300 rounded"
                            />
                            <span className="text-sm text-muted-foreground">Contribute to FACES</span>
                          </label>
                        </div>

                        <div className="space-y-3">
                          <label className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={formData.contributions.includes('social-media')}
                              onChange={() => handleCheckboxChange('social-media')}
                              className="w-4 h-4 accent-primary-PARI-Red  focus:ring-primary-PARI-Red border-gray-300 rounded"
                            />
                            <span className="text-sm text-muted-foreground">Social media</span>
                          </label>

                          <label className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={formData.contributions.includes('film-video')}
                              onChange={() => handleCheckboxChange('film-video')}
                              className="w-4 h-4 accent-primary-PARI-Red  focus:ring-primary-PARI-Red border-gray-300 rounded"
                            />
                            <span className="text-sm text-muted-foreground">Make a film/video</span>
                          </label>

                          <label className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={formData.contributions.includes('translations')}
                              onChange={() => handleCheckboxChange('translations')}
                              className="w-4 h-4 accent-primary-PARI-Red focus:ring-primary-PARI-Red border-gray-300 rounded"
                            />
                            <span className="text-sm text-muted-foreground">Translations</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleNextSection}
                  className="w-full bg-primary-PARI-Red text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-PARI-Red/90 transition-colors duration-200"
                >
                  Next Section
                </button>
              </div>
            )}

            {/* Step 3: Upload Documents */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wide">
                    UPLOAD DOCUMENTS
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Upload a statement of purpose indicating why you wish to intern with PARI, and how you would like to contribute. (300-500 words)
                      </p>
                      <div className="border-2 border-dashed border-input rounded-lg p-6 text-center hover:border-primary-PARI-Red transition-colors">
                        <input
                          type="file"
                          id="statement"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => handleFileUpload(e, 'statementOfPurpose')}
                          className="hidden"
                        />
                        <label htmlFor="statement" className="cursor-pointer">
                          <div className="text-gray-500">
                            <svg className="mx-auto h-8 w-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <span className="text-sm">Upload a statement of purpose (300-500 words)</span>
                          </div>
                        </label>
                        {formData.statementOfPurpose && (
                          <p className="text-sm text-green-600 mt-2">
                            File uploaded: {formData.statementOfPurpose.name}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="border-2 border-dashed border-input rounded-lg p-6 text-center hover:border-primary-PARI-Red transition-colors">
                        <input
                          type="file"
                          id="cv"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => handleFileUpload(e, 'cvResume')}
                          className="hidden"
                        />
                        <label htmlFor="cv" className="cursor-pointer">
                          <div className="text-gray-500">
                            <svg className="mx-auto h-8 w-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <span className="text-sm">Upload your CV / Resume here*</span>
                          </div>
                        </label>
                        {formData.cvResume && (
                          <p className="text-sm text-green-600 mt-2">
                            File uploaded: {formData.cvResume.name}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="border-2 border-dashed border-input rounded-lg p-6 text-center hover:border-primary-PARI-Red transition-colors">
                        <input
                          type="file"
                          id="writing"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => handleFileUpload(e, 'writingSamples')}
                          className="hidden"
                        />
                        <label htmlFor="writing" className="cursor-pointer">
                          <div className="text-gray-500">
                            <svg className="mx-auto h-8 w-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <span className="text-sm">Upload writing samples (published or unpublished)*</span>
                          </div>
                        </label>
                        {formData.writingSamples && (
                          <p className="text-sm text-green-600 mt-2">
                            File uploaded: {formData.writingSamples.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Success Message */}
                {isSuccess && (
                  <FormSuccessMessage
                    message="Thank you! Your internship application has been submitted successfully. We'll review it and get back to you soon."
                    className="mb-4"
                  />
                )}

                {/* Error Message */}
                {error && (
                  <FormErrorMessage
                    error={error}
                    className="mb-4"
                  />
                )}

                <button
                  onClick={handleSubmitApplication}
                  disabled={isSubmitting}
                  className="w-full bg-primary-PARI-Red text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-PARI-Red/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <FormLoadingSpinner className="mr-2" />
                      Submitting Application...
                    </>
                  ) : (
                    'Submit Application'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InternPage;
