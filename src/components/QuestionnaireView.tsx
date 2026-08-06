import React, { useState } from 'react';
import { ServiceCategory, CleaningType, EstimateRequest } from '../types';
import { Building2, Home, Upload, X, Camera, CheckCircle2, Send, Clock, Sparkles, Shield, AlertCircle } from 'lucide-react';

interface QuestionnaireViewProps {
  initialCleaningType?: CleaningType;
  onSubmitted: (estimate: EstimateRequest) => void;
  onCancel: () => void;
}

export const QuestionnaireView: React.FC<QuestionnaireViewProps> = ({
  initialCleaningType = 'move-in-out',
  onSubmitted,
  onCancel,
}) => {
  // Step State
  const [step, setStep] = useState<number>(1);

  // Questionnaire Form Fields
  const [category, setCategory] = useState<ServiceCategory>('residential');
  const [cleaningType, setCleaningType] = useState<CleaningType>(initialCleaningType);
  const [squareFootage, setSquareFootage] = useState<number>(1800);
  const [bedrooms, setBedrooms] = useState<number>(3);
  const [bathrooms, setBathrooms] = useState<number>(2);
  const [frequencyPreference, setFrequencyPreference] = useState<'one-time' | 'weekly' | 'bi-weekly' | 'monthly'>('one-time');
  
  // Photos uploaded (base64 data URLs)
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploadError, setUploadError] = useState<string>('');

  // Contact Details
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [propertyAddress, setPropertyAddress] = useState<string>('');
  const [specialInstructions, setSpecialInstructions] = useState<string>('');
  const [preferredDate, setPreferredDate] = useState<string>('');
  const [preferredTimeSlot, setPreferredTimeSlot] = useState<string>('08:00 AM - 11:00 AM');

  // Submission Status
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<EstimateRequest | null>(null);

  // File Upload Handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError('');
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (photos.length + files.length > 8) {
      setUploadError('Maximum 8 photos allowed per estimate request.');
      return;
    }

    (Array.from(files) as File[]).forEach((file: File) => {
      if (!file.type.startsWith('image/')) {
        setUploadError('Only image files (JPG, PNG, WEBP) are supported.');
        return;
      }
      if (file.size > 8 * 1024 * 1024) {
        setUploadError('Image size must be under 8MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotos((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !customerEmail) {
      alert('Please fill out your Name, Phone Number, and Email Address.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        category,
        cleaningType,
        squareFootage,
        bedrooms,
        bathrooms,
        frequencyPreference,
        photos,
        customerName,
        customerPhone,
        customerEmail,
        propertyAddress,
        specialInstructions,
        preferredDate,
        preferredTimeSlot,
      };

      const res = await fetch('/api/estimates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setIsSubmitting(false);

      if (res.ok && data.success) {
        setSubmissionSuccess(data.estimate);
        onSubmitted(data.estimate);
      } else {
        alert(data.error || 'Failed to submit estimate. Please try again.');
      }
    } catch (err) {
      setIsSubmitting(false);
      console.error(err);
      alert('Network error submitting request.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto my-8 px-4 sm:px-6">
      <div className="bg-white rounded-2xl border-2 border-stone-300 shadow-2xl overflow-hidden">
        
        {/* Top Header */}
        <div className="bg-stone-900 text-stone-100 p-6 sm:p-8 border-b-2 border-amber-500/80">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="inline-flex items-center space-x-1.5 bg-amber-500/20 text-amber-300 font-mono text-xs px-2.5 py-0.5 rounded border border-amber-400/30">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>24-Hour SLA Estimate Response</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-100">
                Free Cleaning Estimate Questionnaire
              </h2>
              <p className="text-stone-400 text-xs sm:text-sm">
                Whistle Stop Cleaning • WE CLEAN • WE MAINTAIN • YOU ENJOY
              </p>
            </div>

            <button
              onClick={onCancel}
              className="p-2 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Indicator */}
          {!submissionSuccess && (
            <div className="grid grid-cols-3 gap-2 mt-6">
              <div className={`h-1.5 rounded-full ${step >= 1 ? 'bg-amber-400' : 'bg-stone-800'}`}></div>
              <div className={`h-1.5 rounded-full ${step >= 2 ? 'bg-amber-400' : 'bg-stone-800'}`}></div>
              <div className={`h-1.5 rounded-full ${step >= 3 ? 'bg-amber-400' : 'bg-stone-800'}`}></div>
            </div>
          )}
        </div>

        {/* Success Screen */}
        {submissionSuccess ? (
          <div className="p-8 sm:p-12 text-center space-y-6 bg-stone-50">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-4 border-emerald-500/30 shadow-lg">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            <div className="space-y-2 max-w-lg mx-auto">
              <span className="text-xs font-bold text-amber-600 tracking-wider uppercase font-mono">
                Reference ID: {submissionSuccess.id}
              </span>
              <h3 className="text-2xl font-serif font-bold text-stone-900">
                Estimate Request Sent to Administrator!
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                Thank you, <strong>{submissionSuccess.customerName}</strong>! Your questionnaire and property photos have been sent directly to our administrator (<strong>RichardAnderson697@gmail.com</strong>).
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-200 text-left max-w-md mx-auto space-y-3 text-xs sm:text-sm text-stone-700 shadow-sm">
              <div className="flex items-center justify-between pb-2 border-b border-stone-100 font-bold">
                <span>Guaranteed Response Window</span>
                <span className="text-emerald-700">Within 24 Hours</span>
              </div>
              <div>
                <span className="text-stone-500">Service Request:</span>{' '}
                <span className="font-semibold capitalize">{submissionSuccess.category} - {submissionSuccess.cleaningType.replace('-', ' ')}</span>
              </div>
              <div>
                <span className="text-stone-500">Phone & Email:</span>{' '}
                <span className="font-semibold">{submissionSuccess.customerPhone} | {submissionSuccess.customerEmail}</span>
              </div>
              <div>
                <span className="text-stone-500">Uploaded Photos:</span>{' '}
                <span className="font-semibold">{submissionSuccess.photos.length} image(s) attached</span>
              </div>
              <div className="pt-2 text-[11px] text-amber-800 bg-amber-50 p-2.5 rounded border border-amber-200">
                📱 Simulated SMS Confirmation sent to <strong>{submissionSuccess.customerPhone}</strong> with your request details.
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={onCancel}
                className="px-6 py-3 rounded-xl bg-stone-900 text-stone-100 font-bold text-sm hover:bg-stone-800 transition-colors"
              >
                Return to Services
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
            
            {/* STEP 1: Property Category & Cleaning Type */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-stone-900 uppercase tracking-wider mb-2">
                    1. Is this for a Business or Residential Property?
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setCategory('residential')}
                      className={`p-5 rounded-2xl border-2 flex items-center space-x-4 transition-all text-left ${
                        category === 'residential'
                          ? 'border-amber-500 bg-amber-50/60 shadow-md ring-2 ring-amber-500/20'
                          : 'border-stone-200 hover:border-stone-400 bg-white'
                      }`}
                    >
                      <div className={`p-3 rounded-xl ${category === 'residential' ? 'bg-amber-500 text-stone-950' : 'bg-stone-100 text-stone-600'}`}>
                        <Home className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-bold text-stone-900 text-base">Residential Home</div>
                        <div className="text-xs text-stone-500">Apartments, Single Family, Condos, Townhomes</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCategory('commercial')}
                      className={`p-5 rounded-2xl border-2 flex items-center space-x-4 transition-all text-left ${
                        category === 'commercial'
                          ? 'border-amber-500 bg-amber-50/60 shadow-md ring-2 ring-amber-500/20'
                          : 'border-stone-200 hover:border-stone-400 bg-white'
                      }`}
                    >
                      <div className={`p-3 rounded-xl ${category === 'commercial' ? 'bg-amber-500 text-stone-950' : 'bg-stone-100 text-stone-600'}`}>
                        <Building2 className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-bold text-stone-900 text-base">Commercial / Business</div>
                        <div className="text-xs text-stone-500">Offices, Retail, Clinics, Venues, Property Managers</div>
                      </div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-stone-900 uppercase tracking-wider mb-2">
                    2. Select Cleaning Service Type Needed
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[
                      { id: 'move-in-out', label: 'Move In - Move Out', desc: 'Empty home deep scrub' },
                      { id: 'construction-cleanup', label: 'Construction Clean Up', desc: 'Post-renovation dust & debris' },
                      { id: 'deep-cleaning', label: 'Deep Cleaning', desc: 'Top-to-bottom detailed refresh' },
                      { id: 'one-time', label: 'One-Time Clean', desc: 'Spring or special event' },
                      { id: 'weekly', label: 'Weekly Cleaning', desc: '15% Off recurring rate' },
                      { id: 'bi-weekly', label: 'Bi-Weekly Cleaning', desc: '10% Off recurring rate' },
                      { id: 'monthly', label: 'Monthly Cleaning', desc: '5% Off recurring rate' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setCleaningType(item.id as CleaningType)}
                        className={`p-3.5 rounded-xl border text-left transition-all ${
                          cleaningType === item.id
                            ? 'border-amber-500 bg-amber-50 text-stone-950 font-bold shadow-sm'
                            : 'border-stone-200 hover:border-stone-300 bg-white text-stone-700'
                        }`}
                      >
                        <div className="text-sm font-bold">{item.label}</div>
                        <div className="text-xs text-stone-500 font-normal">{item.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm shadow-md"
                  >
                    Next: Property Details →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Property Specs & Photo Uploads */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                      Approx. Square Footage
                    </label>
                    <input
                      type="number"
                      value={squareFootage}
                      onChange={(e) => setSquareFootage(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm font-semibold"
                      placeholder="e.g. 1800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                      Bedrooms
                    </label>
                    <select
                      value={bedrooms}
                      onChange={(e) => setBedrooms(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-amber-500 text-sm font-semibold"
                    >
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                        <option key={n} value={n}>{n} Bedroom{n !== 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                      Bathrooms
                    </label>
                    <select
                      value={bathrooms}
                      onChange={(e) => setBathrooms(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-amber-500 text-sm font-semibold"
                    >
                      {[1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((n) => (
                        <option key={n} value={n}>{n} Bathroom{n !== 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Photo Upload Section */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-bold text-stone-900 uppercase tracking-wider">
                      Provide Photos (Optional but Recommended)
                    </label>
                    <span className="text-xs text-stone-500 font-mono">
                      {photos.length} / 8 photos
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mb-3">
                    Upload photos of rooms, kitchen, bathrooms, or heavy grime areas so our administrator can provide an exact, accurate estimate!
                  </p>

                  <div className="border-2 border-dashed border-stone-300 hover:border-amber-500 rounded-2xl p-6 text-center bg-stone-50/50 transition-colors">
                    <input
                      type="file"
                      id="photo-upload-input"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="photo-upload-input"
                      className="cursor-pointer flex flex-col items-center justify-center space-y-2"
                    >
                      <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-stone-900 hover:underline">
                          Click to upload photos
                        </span>{' '}
                        <span className="text-xs text-stone-500">or drag and drop</span>
                      </div>
                      <span className="text-[11px] text-stone-400">
                        PNG, JPG, WEBP up to 8MB each
                      </span>
                    </label>
                  </div>

                  {uploadError && (
                    <div className="mt-2 text-xs text-rose-600 flex items-center space-x-1 font-semibold">
                      <AlertCircle className="w-4 h-4" />
                      <span>{uploadError}</span>
                    </div>
                  )}

                  {/* Uploaded Photos Preview Grid */}
                  {photos.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                      {photos.map((photo, index) => (
                        <div key={index} className="relative group rounded-xl overflow-hidden aspect-square bg-stone-200 border border-stone-300">
                          <img
                            src={photo}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto(index)}
                            className="absolute top-1.5 right-1.5 p-1 bg-stone-900/80 text-white rounded-full hover:bg-rose-600 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-bold text-sm hover:bg-stone-100"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm shadow-md"
                  >
                    Next: Contact Info & Time →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Contact Info & Preferred Timeline */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start space-x-3 text-xs text-emerald-900">
                  <Shield className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>24-Hour SLA Administrator Notice:</strong> This questionnaire will be routed directly to Administrator Email <strong>RichardAnderson697@gmail.com</strong>. You will receive an estimate call/email and SMS confirmation!
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-900 uppercase mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-amber-500 text-sm font-semibold"
                      placeholder="e.g. Sarah Jenkins"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-900 uppercase mb-1">
                      Phone Number (for SMS confirmation) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-amber-500 text-sm font-semibold"
                      placeholder="e.g. (555) 234-5678"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-900 uppercase mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-amber-500 text-sm font-semibold"
                      placeholder="e.g. sarah@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-900 uppercase mb-1">
                      Property Address
                    </label>
                    <input
                      type="text"
                      value={propertyAddress}
                      onChange={(e) => setPropertyAddress(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-amber-500 text-sm font-semibold"
                      placeholder="e.g. 742 Evergreen Terrace, Springfield"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-900 uppercase mb-1">
                      Target Preferred Date
                    </label>
                    <input
                      type="date"
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-amber-500 text-sm font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-900 uppercase mb-1">
                      Preferred Time Window
                    </label>
                    <select
                      value={preferredTimeSlot}
                      onChange={(e) => setPreferredTimeSlot(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-amber-500 text-sm font-semibold"
                    >
                      <option value="08:00 AM - 11:00 AM">Morning (08:00 AM - 11:00 AM)</option>
                      <option value="11:30 AM - 02:30 PM">Midday (11:30 AM - 02:30 PM)</option>
                      <option value="03:00 PM - 06:00 PM">Late Afternoon (03:00 PM - 06:00 PM)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-900 uppercase mb-1">
                    Special Notes, Focus Areas or Access Instructions
                  </label>
                  <textarea
                    rows={3}
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-amber-500 text-sm"
                    placeholder="e.g. Focus on kitchen oven, master bathroom tile, gate code 1234, pets inside."
                  ></textarea>
                </div>

                <div className="pt-4 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-bold text-sm hover:bg-stone-100"
                  >
                    ← Back
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-base shadow-lg shadow-amber-500/20 flex items-center space-x-2 transition-all disabled:opacity-50"
                  >
                    <Send className="w-5 h-5" />
                    <span>{isSubmitting ? 'Sending Request...' : 'Submit Free Estimate Request'}</span>
                  </button>
                </div>
              </div>
            )}

          </form>
        )}

      </div>
    </div>
  );
};
