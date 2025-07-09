'use client';

import React, { useState } from 'react';


const VolunteerPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1 - Personal Info
    fullName: '',
    email: '',
    phone: '',
    country: '',
    state: '',
    district: '',
    organisation: '',

    // Step 2 - Why Volunteer
    aboutYourself: '',
    whyVolunteer: '',

    // Step 3 - Volunteering Details
    contributions: [] as string[],
    translatorLink1: '',
    translatorLink2: '',
    translateLanguage: '',
    timeCommitment: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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

  const handleNextSection = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSubmitProfile = () => {
    console.log('Final form data:', formData);
    // Handle final submission
  };

  return (
    <div className="min-h-screen bg-background py-10 md:py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left Content Section */}
          <div className="md:px-8">
            <h1 className="text-4xl font-bold text-foreground mb-6">
              Volunteer with PARI
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              Engage with today&apos;s issues
            </p>

            <div className="space-y-6 text-muted-foreground">
              <p className="text-base leading-relaxed">
                We are a small team of journalists, researchers and translators and
                are supported by a large group of volunteers who are helping PARI
                build its archive of the labour, livelihoods, histories, cultures and
                more of rural India.
              </p>

              <p className="text-base leading-relaxed">
                The PARI Library and PARI Translations Team have hundreds of
                volunteers who give their time and expertise towards building both
                these resources, and we couldn&apos;t have done it without them.
              </p>

              <p className="text-base leading-relaxed">
                If you are a researcher, a translator or have any skills that you feel
                could help PARI grow its content and reach, do get in touch by filling
                out this Volunteer Form.
              </p>
            </div>
          </div>

          {/* Right Form Section */}
          <div className="bg-popover dark:bg-popover p-8 rounded-lg shadow-sm border border-border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-card-foreground">
                Profile form
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
                    <span className="text-xs font-medium text-muted-foreground">{currentStep}/3</span>
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
                        className="w-full px-4 py-3 border border-input rounded-lg focus:ring-1 focus:ring-primary-PARI-Red focus:border-primary-PARI-Red outline-none bg-background"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-input rounded-lg focus:ring-1 focus:ring-primary-PARI-Red focus:border-primary-PARI-Red outline-none bg-background"
                      />
                      <input
                        type="tel"
                        name="phone"
                        placeholder="Phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-input rounded-lg focus:ring-1 focus:ring-primary-PARI-Red focus:border-primary-PARI-Red outline-none bg-background"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <select
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-input rounded-lg focus:ring-1 focus:ring-primary-PARI-Red focus:border-primary-PARI-Red outline-none bg-background"
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
                        className="w-full px-4 py-3 border border-input rounded-lg focus:ring-1 focus:ring-primary-PARI-Red focus:border-primary-PARI-Red outline-none bg-background"
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

                    <div>
                      <input
                        type="text"
                        name="organisation"
                        placeholder="Organisation / University / School name"
                        value={formData.organisation}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-input rounded-lg focus:ring-1 focus:ring-primary-PARI-Red focus:border-primary-PARI-Red outline-none bg-background"
                      />
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

            {/* Step 2: Why Volunteer */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wide">
                    WHY VOLUNTEER
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <textarea
                        name="aboutYourself"
                        placeholder="Tell us about yourself briefly"
                        value={formData.aboutYourself}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-4 py-3 border border-input rounded-lg focus:ring- focus:ring-primary-PARI-Red focus:border-primary-PARI-Red outline-none resize-none bg-background"
                      />
                    </div>
                    <div>
                      <textarea
                        name="whyVolunteer"
                        placeholder="Why you would like to volunteer with PARI"
                        value={formData.whyVolunteer}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-4 py-3 border border-input rounded-lg focus:ring- focus:ring-primary-PARI-Red focus:border-primary-PARI-Red outline-none resize-none bg-background"
                      />
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

            {/* Step 3: Volunteering Details */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wide">
                    VOLUNTEERING DETAILS
                  </h3>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-3">
                        How would you like to contribute to PARI?
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {[
                          'Research',
                          'Operations',
                          'Engineering',
                          'Translations',
                          'Digital media',
                          'Marketing',
                          'Editing',
                          'Photography',
                          'Other'
                        ].map((contribution) => (
                          <label key={contribution} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.contributions.includes(contribution)}
                              onChange={() => handleCheckboxChange(contribution)}
                              className="mr-2 h-4 w-4 accent-primary-PARI-Red focus:ring- focus:ring-primary-PARI-Red border-gray-300 rounded"
                            />
                            <span className="text-sm text-muted-foreground">{contribution}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-3">
                        If you have prior experience as a translator, please list examples:
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="url"
                          name="translatorLink1"
                          placeholder="Link 1"
                          value={formData.translatorLink1}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-input rounded-lg focus:ring-1 focus:ring-primary-PARI-Red focus:border-primary-PARI-Red outline-none bg-background"
                        />
                        <input
                          type="url"
                          name="translatorLink2"
                          placeholder="Link 2"
                          value={formData.translatorLink2}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-input rounded-lg focus:ring-1 focus:ring-primary-PARI-Red focus:border-primary-PARI-Red outline-none bg-background"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-3">
                        If you would like to translate for PARI, please choose the language:
                      </label>
                      <select
                        name="translateLanguage"
                        value={formData.translateLanguage}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-input rounded-lg focus:ring-none focus:ring-primary-PARI-Red focus:border-primary-PARI-Red outline-none bg-background"
                      >
                        <option value="">Select language</option>
                        <option value="hindi">Hindi</option>
                        <option value="bengali">Bengali</option>
                        <option value="tamil">Tamil</option>
                        <option value="telugu">Telugu</option>
                        <option value="marathi">Marathi</option>
                        <option value="gujarati">Gujarati</option>
                        <option value="kannada">Kannada</option>
                        <option value="malayalam">Malayalam</option>
                        <option value="punjabi">Punjabi</option>
                        <option value="urdu">Urdu</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-3">
                        Time available to commit?
                      </label>
                      <div className="flex gap-6">
                        {[
                          { value: '<16 hours/mo', label: '<16 hours / mo' },
                          { value: '<40 hours/mo', label: '<40 hours / mo' },
                          { value: '>40 hours/mo', label: '>40 hours / mo' }
                        ].map((option) => (
                          <label key={option.value} className="flex items-center">
                            <input
                              type="radio"
                              name="timeCommitment"
                              value={option.value}
                              checked={formData.timeCommitment === option.value}
                              onChange={handleInputChange}
                              className="mr-2 h-4 w-4 accent-primary-PARI-Red focus:ring-2 focus:ring-primary-PARI-Red border-input"
                            />
                            <span className="text-sm text-muted-foreground">{option.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSubmitProfile}
                  className="w-full bg-primary-PARI-Red text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-PARI-Red/90 transition-colors duration-200"
                >
                  Submit Profile
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerPage;