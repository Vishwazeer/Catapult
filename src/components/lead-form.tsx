"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  PROPERTY_TYPES, BHK_OPTIONS, TIMELINE_OPTIONS, SOURCE_OPTIONS,
  OCCUPANCY_OPTIONS, POSSESSION_OPTIONS, LOAN_OPTIONS, CREDIT_SCORE_OPTIONS,
  AMENITIES, FACING_OPTIONS, CITIES,
} from "@/lib/constants";
import {
  User, MapPin, Building2, IndianRupee, Calendar, MessageSquare,
  ChevronRight, ChevronLeft, Check, Loader2, Sparkles, Heart,
  Home, CreditCard, Clock, FileText,
} from "lucide-react";

interface FormData {
  name: string; email: string; phone: string; source: string;
  location: string; propertyType: string; bhkConfig: string;
  sqftMin: string; sqftMax: string; preferredFloor: string;
  facingDirection: string;
  budgetMin: string; budgetMax: string; loanReady: string;
  maxLoanAmount: string; creditScoreRange: string; downPaymentAvailable: string;
  buyingTimeline: string; occupancyType: string; possessionPreference: string;
  preferredAmenities: string[]; mustHaveFeatures: string; dealBreakers: string;
  customerMessage: string;
}

const STEPS = [
  { id: 1, title: 'Personal Info', icon: User, description: 'Basic contact details' },
  { id: 2, title: 'Property Preferences', icon: Home, description: 'What are you looking for?' },
  { id: 3, title: 'Budget & Financing', icon: CreditCard, description: 'Financial details' },
  { id: 4, title: 'Timeline & Urgency', icon: Clock, description: 'When do you need it?' },
  { id: 5, title: 'Requirements', icon: Heart, description: 'Must-haves and deal-breakers' },
  { id: 6, title: 'Customer Voice', icon: FileText, description: 'Tell us everything' },
];

export default function LeadForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<FormData>({
    name: "", email: "", phone: "", source: "",
    location: "", propertyType: "", bhkConfig: "",
    sqftMin: "", sqftMax: "", preferredFloor: "",
    facingDirection: "",
    budgetMin: "", budgetMax: "", loanReady: "",
    maxLoanAmount: "", creditScoreRange: "", downPaymentAvailable: "",
    buyingTimeline: "", occupancyType: "", possessionPreference: "",
    preferredAmenities: [], mustHaveFeatures: "", dealBreakers: "",
    customerMessage: "",
  });

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (step === 1) {
      if (!formData.name.trim()) {
        newErrors.name = "Name is required";
        isValid = false;
      }
    } else if (step === 2) {
      if (!formData.location) {
        newErrors.location = "Location is required";
        isValid = false;
      }
      if (!formData.propertyType) {
        newErrors.propertyType = "Property type is required";
        isValid = false;
      }
    } else if (step === 3) {
      if (!formData.budgetMax) {
        newErrors.budgetMax = "Maximum budget is required";
        isValid = false;
      }
    } else if (step === 4) {
      if (!formData.buyingTimeline) {
        newErrors.buyingTimeline = "Buying timeline is required";
        isValid = false;
      }
    } else if (step === 6) {
      if (!formData.customerMessage.trim()) {
        newErrors.customerMessage = "Please tell us about your requirements";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setDirection(1);
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
    }
  };

  const handleBack = () => {
    setDirection(-1);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        const data = await response.json();
        router.push(`/leads/${data.id}`);
      } else {
        console.error("Submission failed");
      }
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateForm = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const toggleAmenity = (amenity: string) => {
    setFormData((prev) => {
      const isSelected = prev.preferredAmenities.includes(amenity);
      return {
        ...prev,
        preferredAmenities: isSelected
          ? prev.preferredAmenities.filter((a) => a !== amenity)
          : [...prev.preferredAmenities, amenity],
      };
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto pb-12">
      {/* Progress Bar and Header */}
      <div className="mb-8">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h2 className="text-2xl font-semibold text-ink">Lead Intake</h2>
            <p className="text-ink-subtle text-sm mt-1">Step {currentStep} of {STEPS.length}</p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="h-2 w-full bg-surface-1 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep / STEPS.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Step Indicator */}
        <div className="flex justify-between mt-6 relative">
          {STEPS.map((step) => {
            const Icon = step.icon;
            const isCompleted = step.id < currentStep;
            const isCurrent = step.id === currentStep;
            
            return (
              <div key={step.id} className="flex flex-col items-center gap-2 relative z-10">
                <div 
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors",
                    isCompleted ? "bg-primary border-primary text-white" : 
                    isCurrent ? "border-primary text-primary" : 
                    "border-hairline text-ink-subtle bg-surface-1"
                  )}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <span className={cn("text-xs font-medium hidden sm:block", 
                  isCurrent ? "text-primary" : "text-ink-subtle"
                )}>
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-surface glass-card rounded-2xl p-6 md:p-8 shadow-sm border border-hairline overflow-hidden min-h-[400px] relative">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            initial={{ opacity: 0, x: direction * 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -50 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-ink">{STEPS[currentStep - 1].title}</h3>
              <p className="text-ink-subtle text-sm mt-1">{STEPS[currentStep - 1].description}</p>
            </div>

            <div className="space-y-6">
              {currentStep === 1 && (
                <>
                  <div>
                    <label className="text-sm font-medium text-ink mb-1.5 block">Name <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-4 w-4 text-ink-subtle" />
                      </div>
                      <input
                        type="text"
                        className="input-dark w-full pl-10 bg-surface-1 border border-hairline rounded-md px-3 py-2.5 text-ink"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => updateForm("name", e.target.value)}
                      />
                    </div>
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-ink mb-1.5 block">Email <span className="text-xs text-ink-subtle">(Optional)</span></label>
                    <input
                      type="email"
                      className="input-dark w-full bg-surface-1 border border-hairline rounded-md px-3 py-2.5 text-ink"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => updateForm("email", e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-ink mb-1.5 block">Phone <span className="text-xs text-ink-subtle">(Optional)</span></label>
                    <input
                      type="tel"
                      className="input-dark w-full bg-surface-1 border border-hairline rounded-md px-3 py-2.5 text-ink"
                      placeholder="+91 9876543210"
                      value={formData.phone}
                      onChange={(e) => updateForm("phone", e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-ink mb-1.5 block">Source <span className="text-xs text-ink-subtle">(Optional)</span></label>
                    <select
                      className="w-full bg-surface-1 border border-hairline rounded-md px-3 py-2.5 text-ink appearance-none"
                      value={formData.source}
                      onChange={(e) => updateForm("source", e.target.value)}
                    >
                      <option value="">Select Source</option>
                      {SOURCE_OPTIONS?.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {currentStep === 2 && (
                <>
                  <div>
                    <label className="text-sm font-medium text-ink mb-1.5 block">Location/City <span className="text-red-500">*</span></label>
                    <select
                      className="w-full bg-surface-1 border border-hairline rounded-md px-3 py-2.5 text-ink appearance-none"
                      value={formData.location}
                      onChange={(e) => updateForm("location", e.target.value)}
                    >
                      <option value="">Select City</option>
                      {CITIES?.map((city) => (
                        <option key={city} value={city}>{city}</option>
                      )) || <option value="Mumbai">Mumbai</option>}
                    </select>
                    {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-ink mb-1.5 block">Property Type <span className="text-red-500">*</span></label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {PROPERTY_TYPES?.map((type) => (
                        <div
                          key={type.value}
                          onClick={() => updateForm("propertyType", type.value)}
                          className={cn(
                            "glass-card p-4 cursor-pointer border-2 rounded-lg text-center transition-all",
                            formData.propertyType === type.value
                              ? "border-primary bg-primary/10"
                              : "border-transparent hover:border-hairline-strong bg-surface-1"
                          )}
                        >
                          <Building2 className={cn("w-6 h-6 mx-auto mb-2", formData.propertyType === type.value ? "text-primary" : "text-ink-subtle")} />
                          <span className="text-sm font-medium">{type.label}</span>
                        </div>
                      ))}
                    </div>
                    {errors.propertyType && <p className="text-red-500 text-xs mt-1">{errors.propertyType}</p>}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-ink mb-1.5 block">BHK Configuration <span className="text-xs text-ink-subtle">(Optional)</span></label>
                    <div className="flex flex-wrap gap-2">
                      {BHK_OPTIONS?.map((bhk) => (
                        <button
                          key={bhk.value}
                          type="button"
                          onClick={() => updateForm("bhkConfig", bhk.value)}
                          className={cn(
                            "px-4 py-2 rounded-full border text-sm font-medium transition-colors",
                            formData.bhkConfig === bhk.value
                              ? "bg-primary/15 border-primary text-primary"
                              : "border-hairline bg-surface-1 text-ink hover:border-hairline-strong"
                          )}
                        >
                          {bhk.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-ink mb-1.5 block">Min Sq.ft</label>
                      <input
                        type="number"
                        className="input-dark w-full bg-surface-1 border border-hairline rounded-md px-3 py-2.5 text-ink"
                        placeholder="e.g. 500"
                        value={formData.sqftMin}
                        onChange={(e) => updateForm("sqftMin", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-ink mb-1.5 block">Max Sq.ft</label>
                      <input
                        type="number"
                        className="input-dark w-full bg-surface-1 border border-hairline rounded-md px-3 py-2.5 text-ink"
                        placeholder="e.g. 1500"
                        value={formData.sqftMax}
                        onChange={(e) => updateForm("sqftMax", e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-ink mb-1.5 block">Preferred Floor</label>
                      <input
                        type="text"
                        className="input-dark w-full bg-surface-1 border border-hairline rounded-md px-3 py-2.5 text-ink"
                        placeholder="e.g. Higher floors"
                        value={formData.preferredFloor}
                        onChange={(e) => updateForm("preferredFloor", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-ink mb-1.5 block">Facing Direction</label>
                      <select
                        className="w-full bg-surface-1 border border-hairline rounded-md px-3 py-2.5 text-ink appearance-none"
                        value={formData.facingDirection}
                        onChange={(e) => updateForm("facingDirection", e.target.value)}
                      >
                        <option value="">Any</option>
                        {FACING_OPTIONS?.map((dir) => (
                          <option key={dir.value} value={dir.value}>{dir.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}

              {currentStep === 3 && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-ink mb-1.5 block">Min Budget (Lakhs)</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <IndianRupee className="h-4 w-4 text-ink-subtle" />
                        </div>
                        <input
                          type="number"
                          className="input-dark w-full pl-9 bg-surface-1 border border-hairline rounded-md px-3 py-2.5 text-ink"
                          placeholder="50"
                          value={formData.budgetMin}
                          onChange={(e) => updateForm("budgetMin", e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-ink mb-1.5 block">Max Budget (Lakhs) <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <IndianRupee className="h-4 w-4 text-ink-subtle" />
                        </div>
                        <input
                          type="number"
                          className="input-dark w-full pl-9 bg-surface-1 border border-hairline rounded-md px-3 py-2.5 text-ink"
                          placeholder="150"
                          value={formData.budgetMax}
                          onChange={(e) => updateForm("budgetMax", e.target.value)}
                        />
                      </div>
                      {errors.budgetMax && <p className="text-red-500 text-xs mt-1">{errors.budgetMax}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-ink mb-1.5 block">Ready for Loan?</label>
                    <div className="grid grid-cols-3 gap-3">
                      {LOAN_OPTIONS?.map((opt) => (
                        <div
                          key={opt.value}
                          onClick={() => updateForm("loanReady", opt.value)}
                          className={cn(
                            "glass-card py-3 px-2 cursor-pointer border-2 rounded-lg text-center transition-all",
                            formData.loanReady === opt.value
                              ? "border-primary bg-primary/10"
                              : "border-transparent hover:border-hairline-strong bg-surface-1"
                          )}
                        >
                          <span className="text-sm font-medium">{opt.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {(formData.loanReady === "yes" || formData.loanReady === "maybe") && (
                    <div>
                      <label className="text-sm font-medium text-ink mb-1.5 block">Max Loan Amount (Lakhs)</label>
                      <input
                        type="number"
                        className="input-dark w-full bg-surface-1 border border-hairline rounded-md px-3 py-2.5 text-ink"
                        placeholder="e.g. 100"
                        value={formData.maxLoanAmount}
                        onChange={(e) => updateForm("maxLoanAmount", e.target.value)}
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-ink mb-1.5 block">Credit Score</label>
                      <select
                        className="w-full bg-surface-1 border border-hairline rounded-md px-3 py-2.5 text-ink appearance-none"
                        value={formData.creditScoreRange}
                        onChange={(e) => updateForm("creditScoreRange", e.target.value)}
                      >
                        <option value="">Select Range</option>
                        {CREDIT_SCORE_OPTIONS?.map((score) => (
                          <option key={score.value} value={score.value}>{score.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-ink mb-1.5 block">Down Payment (Lakhs)</label>
                      <input
                        type="number"
                        className="input-dark w-full bg-surface-1 border border-hairline rounded-md px-3 py-2.5 text-ink"
                        placeholder="e.g. 20"
                        value={formData.downPaymentAvailable}
                        onChange={(e) => updateForm("downPaymentAvailable", e.target.value)}
                      />
                    </div>
                  </div>
                </>
              )}

              {currentStep === 4 && (
                <>
                  <div>
                    <label className="text-sm font-medium text-ink mb-1.5 block">Buying Timeline <span className="text-red-500">*</span></label>
                    <div className="space-y-2">
                      {TIMELINE_OPTIONS?.map((time) => (
                        <div
                          key={time.value}
                          onClick={() => updateForm("buyingTimeline", time.value)}
                          className={cn(
                            "glass-card p-3 cursor-pointer border-2 rounded-lg transition-all flex items-center gap-3",
                            formData.buyingTimeline === time.value
                              ? "border-primary bg-primary/10"
                              : "border-transparent hover:border-hairline-strong bg-surface-1"
                          )}
                        >
                          <Calendar className={cn("w-5 h-5", formData.buyingTimeline === time.value ? "text-primary" : "text-ink-subtle")} />
                          <span className="text-sm font-medium">{time.label}</span>
                        </div>
                      ))}
                    </div>
                    {errors.buyingTimeline && <p className="text-red-500 text-xs mt-1">{errors.buyingTimeline}</p>}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-ink mb-1.5 block">Occupancy Type</label>
                    <div className="grid grid-cols-3 gap-3">
                      {OCCUPANCY_OPTIONS?.map((opt) => (
                        <div
                          key={opt.value}
                          onClick={() => updateForm("occupancyType", opt.value)}
                          className={cn(
                            "glass-card py-3 px-2 cursor-pointer border-2 rounded-lg text-center transition-all",
                            formData.occupancyType === opt.value
                              ? "border-primary bg-primary/10"
                              : "border-transparent hover:border-hairline-strong bg-surface-1"
                          )}
                        >
                          <span className="text-sm font-medium">{opt.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-ink mb-1.5 block">Possession Preference</label>
                    <div className="grid grid-cols-3 gap-3">
                      {POSSESSION_OPTIONS?.map((opt) => (
                        <div
                          key={opt.value}
                          onClick={() => updateForm("possessionPreference", opt.value)}
                          className={cn(
                            "glass-card py-3 px-2 cursor-pointer border-2 rounded-lg text-center transition-all",
                            formData.possessionPreference === opt.value
                              ? "border-primary bg-primary/10"
                              : "border-transparent hover:border-hairline-strong bg-surface-1"
                          )}
                        >
                          <span className="text-sm font-medium">{opt.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {currentStep === 5 && (
                <>
                  <div>
                    <label className="text-sm font-medium text-ink mb-1.5 block">Preferred Amenities</label>
                    <div className="flex flex-wrap gap-2">
                      {AMENITIES?.map((amenity) => {
                        const isSelected = formData.preferredAmenities.includes(amenity);
                        return (
                          <button
                            key={amenity}
                            type="button"
                            onClick={() => toggleAmenity(amenity)}
                            className={cn(
                              "px-3 py-1.5 rounded-full border text-sm cursor-pointer transition-colors",
                              isSelected
                                ? "bg-primary/15 border-primary text-primary hover:bg-primary/20"
                                : "border-hairline bg-surface-1 text-ink hover:border-hairline-strong"
                            )}
                          >
                            {amenity}
                          </button>
                        );
                      }) || <button type="button" onClick={() => toggleAmenity("Pool")}>Pool</button>}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-ink mb-1.5 block">Must-have Features</label>
                    <textarea
                      className="input-dark w-full bg-surface-1 border border-hairline rounded-md px-3 py-2.5 text-ink resize-none"
                      rows={3}
                      placeholder="e.g. Balcony, Vaastu compliant..."
                      value={formData.mustHaveFeatures}
                      onChange={(e) => updateForm("mustHaveFeatures", e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-ink mb-1.5 block">Deal-breakers</label>
                    <textarea
                      className="input-dark w-full bg-surface-1 border border-hairline rounded-md px-3 py-2.5 text-ink resize-none"
                      rows={2}
                      placeholder="e.g. No ground floor, no busy roads..."
                      value={formData.dealBreakers}
                      onChange={(e) => updateForm("dealBreakers", e.target.value)}
                    />
                  </div>
                </>
              )}

              {currentStep === 6 && (
                <>
                  <div>
                    <label className="text-sm font-medium text-ink mb-1.5 block flex items-center gap-2">
                      Your Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      className="input-dark w-full bg-surface-1 border border-hairline rounded-md px-4 py-3 text-ink resize-none text-base"
                      rows={6}
                      placeholder="Tell us everything about your dream property. What matters most to you? Any specific areas, builders, or features you're set on? The more detail you provide, the better we can help."
                      value={formData.customerMessage}
                      onChange={(e) => updateForm("customerMessage", e.target.value)}
                    />
                    {errors.customerMessage && <p className="text-red-500 text-xs mt-1">{errors.customerMessage}</p>}
                    
                    <div className="flex items-center gap-2 mt-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                      <Sparkles className="w-4 h-4 text-primary shrink-0" />
                      <p className="text-xs text-ink-subtle">
                        This message will be analyzed by AI to deeply understand your preferences.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mt-8 pt-4 border-t border-hairline">
        <button
          onClick={handleBack}
          disabled={currentStep === 1 || isSubmitting}
          className={cn(
            "flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all",
            currentStep === 1 
              ? "opacity-0 pointer-events-none" 
              : "text-ink hover:bg-surface-1 border border-hairline"
          )}
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        {currentStep < STEPS.length ? (
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity ml-auto"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-8 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity ml-auto"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                Submit
                <Check className="w-4 h-4" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
