"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SubmitSuccess } from "./SubmitSuccess";
import { UploadCloudIcon, FileIcon, Loader2Icon, ArrowRightIcon, CheckCircleIcon, CalculatorIcon, XIcon } from "lucide-react";
import { uploadFiles } from "@/lib/uploadthing";
import { submitPrintJob, getLastOrderByContact } from "@/app/actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PAPER_SIZES, PRINT_TYPES, FINISHING_OPTIONS, calculateEstimate } from "@/lib/pricing";
import { PricingConfig } from "@/src/generated/prisma";

interface FormData {
  name: string;
  contact: string;
  email: string;
  description: string;
  files: File[];
  paperSize: string | null;
  quantity: number;
  printType: string | null;
  finishing: string | null;
  isRush: boolean;
}

interface FormErrors {
  name?: string;
  contact?: string;
  description?: string;
  paperSize?: string;
  printType?: string;
}

export function SubmitForm({ pricingConfig }: { pricingConfig: PricingConfig }) {
  const [form, setForm] = useState<FormData>({
    name: "",
    contact: "",
    email: "",
    description: "",
    files: [],
    paperSize: null,
    quantity: 1,
    printType: null,
    finishing: "NONE",
    isRush: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const [trackingCode, setTrackingCode] = useState<string | null>(null);
  const [prefillBanner, setPrefillBanner] = useState(false);
  const [prefillLoading, setPrefillLoading] = useState(false);
  const lastPrefillContactRef = useRef<string | null>(null);

  const applyLastOrderPrefill = useCallback(async (contact: string) => {
    const trimmed = contact.trim();
    if (trimmed.length < 7) {
      setPrefillBanner(false);
      return;
    }
    if (lastPrefillContactRef.current === trimmed) return;

    setPrefillLoading(true);
    try {
      const result = await getLastOrderByContact(trimmed);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      if (!result.data) {
        lastPrefillContactRef.current = trimmed;
        setPrefillBanner(false);
        return;
      }

      const { data } = result;
      lastPrefillContactRef.current = trimmed;

      setForm((prev) => ({
        ...prev,
        name: prev.name.trim() ? prev.name : data.name,
        email: prev.email.trim() ? prev.email : data.email ?? "",
        paperSize: data.paperSize ?? prev.paperSize,
        printType: data.printType ?? prev.printType,
        finishing: data.finishing ?? prev.finishing ?? "NONE",
        quantity: data.quantity,
        isRush: data.isRush,
      }));
      setErrors((prev) => ({
        ...prev,
        paperSize: undefined,
        printType: undefined,
      }));
      setPrefillBanner(true);
      toast.success("Loaded print options from your last order");
    } finally {
      setPrefillLoading(false);
    }
  }, []);

  function handleContactBlur() {
    void applyLastOrderPrefill(form.contact);
  }

  function handleContactChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    handleChange(e);
    const value = e.target.value;
    if (lastPrefillContactRef.current && value.trim() !== lastPrefillContactRef.current) {
      lastPrefillContactRef.current = null;
      setPrefillBanner(false);
    }
  }

  const estimatedPrice = useMemo(() => {
    return calculateEstimate(pricingConfig, form.paperSize, form.printType, form.finishing, form.quantity, form.isRush);
  }, [pricingConfig, form.paperSize, form.printType, form.finishing, form.quantity, form.isRush]);

  function validate(): FormErrors {
    const errs: FormErrors = {};
    if (!form.name.trim()) errs.name = "Full name is required";
    if (!form.contact.trim()) errs.contact = "Contact number is required";
    if (!form.description.trim()) errs.description = "Job description is required";
    if (!form.paperSize) errs.paperSize = "Paper size is required";
    if (!form.printType) errs.printType = "Print type is required";
    return errs;
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  function processFiles(newFiles: File[]) {
    setForm((prev) => {
      const combined = [...prev.files, ...newFiles];
      if (combined.length > 5) {
        toast.error("You can only upload up to 5 files per job.");
        return { ...prev, files: combined.slice(0, 5) };
      }
      return { ...prev, files: combined };
    });
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      processFiles(Array.from(e.target.files));
    }
    // Reset input so you can select the same file again if needed
    e.target.value = "";
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  }

  function removeFile(index: number) {
    setForm((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setLoading(true);

    try {
      let filesData: { url: string; originalName: string; fileType: string }[] = [];
      
      if (form.files.length > 0) {
        toast.loading(`Uploading ${form.files.length} file(s)...`, { id: "submit-toast" });
        const res = await uploadFiles("printJobFile", {
          files: form.files,
        });
        
        if (res && res.length > 0) {
          filesData = res.map((r) => ({
            url: r.ufsUrl || r.url,
            originalName: r.name,
            fileType: r.type,
          }));
        }
      } else {
        toast.loading("Submitting your order...", { id: "submit-toast" });
      }

      const result = await submitPrintJob({
        name: form.name,
        contact: form.contact,
        email: form.email || null,
        description: form.description,
        files: filesData,
        paperSize: form.paperSize,
        quantity: form.quantity,
        printType: form.printType,
        finishing: form.finishing,
        estimatedPrice,
        isRush: form.isRush,
      });

      if (result.success) {
        toast.success("Order submitted successfully!", { id: "submit-toast" });
        setTrackingCode(result.trackingCode || null);
        setSubmitted(true);
      } else {
        toast.error(result.error || "Something went wrong.", { id: "submit-toast" });
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload file. Please try again or check the file size.", { id: "submit-toast" });
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <SubmitSuccess 
        name={form.name} 
        trackingCode={trackingCode || undefined}
        onReset={() => {
          setForm({ name: "", contact: "", email: "", description: "", files: [], paperSize: null, quantity: 1, printType: null, finishing: "NONE", isRush: false });
          setErrors({});
          setSubmitted(false);
          setTrackingCode(null);
          setPrefillBanner(false);
          lastPrefillContactRef.current = null;
        }} 
      />
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl shadow-zinc-200/40 dark:shadow-none rounded-2xl p-8 lg:p-12 w-full">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">Submit a Print Job</h2>
        <p className="text-zinc-500 text-sm mt-2">Fill out the details below and attach your file. We'll handle the rest.</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        
        {/* Name & Contact Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-zinc-700 dark:text-zinc-300 font-medium">
              Full Name <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g. Maria Santos"
              value={form.name}
              onChange={handleChange}
              className={cn(
                "h-11 bg-zinc-50/50 dark:bg-zinc-950/50 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-300 transition-all border-zinc-200 dark:border-zinc-800",
                errors.name && "border-rose-500 focus-visible:ring-rose-500 bg-rose-50/50 dark:bg-rose-950/20"
              )}
            />
            {errors.name && <p className="text-xs text-rose-500 font-medium">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact" className="text-zinc-700 dark:text-zinc-300 font-medium">
              Contact Number <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="contact"
              name="contact"
              type="tel"
              placeholder="e.g. 0917 123 4567"
              value={form.contact}
              onChange={handleContactChange}
              onBlur={handleContactBlur}
              className={cn(
                "h-11 bg-zinc-50/50 dark:bg-zinc-950/50 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-300 transition-all border-zinc-200 dark:border-zinc-800",
                errors.contact && "border-rose-500 focus-visible:ring-rose-500 bg-rose-50/50 dark:bg-rose-950/20"
              )}
            />
            <p className="text-xs text-zinc-500">
              Returning customer? Tab out after your number — we&apos;ll fill in your last print settings.
            </p>
            {prefillLoading && (
              <p className="text-xs text-zinc-500 flex items-center gap-1.5">
                <Loader2Icon className="w-3 h-3 animate-spin" />
                Looking up your last order…
              </p>
            )}
            {errors.contact && <p className="text-xs text-rose-500 font-medium">{errors.contact}</p>}
          </div>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-zinc-700 dark:text-zinc-300 font-medium flex justify-between">
            <span>Email Address</span>
            <span className="text-zinc-400 font-normal">Optional</span>
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="maria@example.com"
            value={form.email}
            onChange={handleChange}
            className="h-11 bg-zinc-50/50 dark:bg-zinc-950/50 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-300 transition-all border-zinc-200 dark:border-zinc-800"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-zinc-700 dark:text-zinc-300 font-medium">
            Job Instructions <span className="text-rose-500">*</span>
          </Label>
          <Textarea
            id="description"
            name="description"
            placeholder="e.g. 50 copies of the attached PDF, A4 size, colored, double-sided."
            value={form.description}
            onChange={handleChange}
            rows={4}
            className={cn(
              "resize-none bg-zinc-50/50 dark:bg-zinc-950/50 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-300 transition-all border-zinc-200 dark:border-zinc-800 p-3 leading-relaxed",
              errors.description && "border-rose-500 focus-visible:ring-rose-500 bg-rose-50/50 dark:bg-rose-950/20"
            )}
          />
          {errors.description && <p className="text-xs text-rose-500 font-medium">{errors.description}</p>}
        </div>

        {prefillBanner && (
          <div className="flex items-start gap-3 p-4 rounded-xl border border-blue-200 bg-blue-50/80 dark:bg-blue-950/20 dark:border-blue-900/50 text-sm text-blue-900 dark:text-blue-100">
            <CheckCircleIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <p>
              Print options match your previous order. Update anything that&apos;s different for this job, then add new files and instructions.
            </p>
          </div>
        )}

        {/* Print Specifications Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-zinc-50/50 dark:bg-zinc-900/30 rounded-xl border border-zinc-200/60 dark:border-zinc-800">
          
          <div className="space-y-2">
            <Label className="text-zinc-700 dark:text-zinc-300 font-medium">
              Paper Size <span className="text-rose-500">*</span>
            </Label>
            <Select 
              value={form.paperSize || ""} 
              onValueChange={(val) => {
                setForm(p => ({ ...p, paperSize: val }));
                setErrors(p => ({ ...p, paperSize: undefined }));
              }}
            >
              <SelectTrigger className={cn(
                "h-11 bg-white dark:bg-zinc-950",
                errors.paperSize && "border-rose-500 focus:ring-rose-500"
              )}>
                <SelectValue placeholder="Select paper size" />
              </SelectTrigger>
              <SelectContent>
                {PAPER_SIZES.map(s => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.paperSize && <p className="text-xs text-rose-500 font-medium">{errors.paperSize}</p>}
          </div>

          <div className="space-y-2">
            <Label className="text-zinc-700 dark:text-zinc-300 font-medium">
              Print Type <span className="text-rose-500">*</span>
            </Label>
            <Select 
              value={form.printType || ""} 
              onValueChange={(val) => {
                setForm(p => ({ ...p, printType: val }));
                setErrors(p => ({ ...p, printType: undefined }));
              }}
            >
              <SelectTrigger className={cn(
                "h-11 bg-white dark:bg-zinc-950",
                errors.printType && "border-rose-500 focus:ring-rose-500"
              )}>
                <SelectValue placeholder="Select print type" />
              </SelectTrigger>
              <SelectContent>
                {PRINT_TYPES.map(t => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.printType && <p className="text-xs text-rose-500 font-medium">{errors.printType}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity" className="text-zinc-700 dark:text-zinc-300 font-medium">
              Quantity
            </Label>
            <Input
              id="quantity"
              name="quantity"
              type="number"
              min="1"
              value={form.quantity}
              onChange={(e) => setForm(p => ({ ...p, quantity: Math.max(1, parseInt(e.target.value) || 1) }))}
              className="h-11 bg-white dark:bg-zinc-950"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-zinc-700 dark:text-zinc-300 font-medium">
              Finishing
            </Label>
            <Select 
              value={form.finishing || "NONE"} 
              onValueChange={(val) => setForm(p => ({ ...p, finishing: val }))}
            >
              <SelectTrigger className="h-11 bg-white dark:bg-zinc-950">
                <SelectValue placeholder="Select finishing" />
              </SelectTrigger>
              <SelectContent>
                {FINISHING_OPTIONS.map(f => (
                  <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

        </div>

        {/* File Upload Zone */}
        <div className="space-y-3 pt-2">
          <Label htmlFor="file" className="text-zinc-700 dark:text-zinc-300 font-medium flex justify-between">
            <span>Attach Files</span>
            <span className="text-zinc-400 font-normal">Max 5 files (20MB each)</span>
          </Label>
          
          {/* List of selected files */}
          {form.files.length > 0 && (
            <div className="flex flex-col gap-2">
              {form.files.map((file, index) => (
                <div key={`${file.name}-${index}`} className="flex items-center justify-between p-3 bg-emerald-50/30 dark:bg-emerald-950/20 border border-emerald-500/30 rounded-xl">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
                      <FileIcon className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-emerald-600/70 dark:text-emerald-500/70">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="p-1.5 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                    title="Remove file"
                  >
                    <XIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload Button / Dropzone */}
          {form.files.length < 5 && (
            <label
              htmlFor="file"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                "relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 overflow-hidden group",
                isDragging
                  ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 scale-[1.02]"
                  : "border-zinc-300 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-500"
              )}
            >
              <div className="flex flex-col items-center justify-center gap-2 z-10 p-4 text-center pointer-events-none">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm",
                  isDragging 
                    ? "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 scale-110" 
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 group-hover:scale-110"
                )}>
                  <UploadCloudIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className={cn(
                    "text-sm font-semibold",
                    isDragging ? "text-emerald-700 dark:text-emerald-400" : "text-zinc-700 dark:text-zinc-300"
                  )}>
                    {isDragging ? "Drop files here!" : "Click or drag files here"}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">
                    PDF, DOC, DOCX, or Images
                  </p>
                </div>
              </div>
              
              <input
                id="file"
                name="file"
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          )}
        </div>

        {/* Rush Order Toggle */}
        <div
          className={cn(
            "flex items-center justify-between gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 select-none",
            form.isRush
              ? "border-rose-500 bg-rose-50/50 dark:bg-rose-950/20"
              : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
          )}
          onClick={() => setForm(p => ({ ...p, isRush: !p.isRush }))}
        >
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0 transition-colors",
              form.isRush ? "bg-rose-100 dark:bg-rose-900/50" : "bg-zinc-100 dark:bg-zinc-800"
            )}>
              ⚡
            </div>
            <div>
              <p className={cn(
                "text-sm font-semibold",
                form.isRush ? "text-rose-700 dark:text-rose-400" : "text-zinc-900 dark:text-zinc-100"
              )}>
                Rush / Priority Order
              </p>
              <p className="text-xs text-zinc-500">
                Adds ₱{pricingConfig.rushFee.toFixed(2)} — your job will be printed first
              </p>
            </div>
          </div>
          {/* Toggle indicator */}
          <div className={cn(
            "relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200",
            form.isRush ? "bg-rose-500" : "bg-zinc-200 dark:bg-zinc-700"
          )}>
            <span className={cn(
              "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition-transform duration-200",
              form.isRush ? "translate-x-5" : "translate-x-0"
            )} />
          </div>
        </div>

        {/* Live Price Estimate */}
        {estimatedPrice > 0 && (
          <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <CalculatorIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">Estimated Total</p>
                <p className="text-xs text-emerald-700/70 dark:text-emerald-400/70">
                  This is an estimate only. Final price will be confirmed by shop staff.
                </p>
              </div>
            </div>
            <div className="text-2xl font-bold tracking-tight text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
              ₱{estimatedPrice.toFixed(2)}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-4">
          <Button
            type="submit"
            className="w-full h-12 text-base font-semibold bg-zinc-950 hover:bg-zinc-800 text-white dark:bg-zinc-50 dark:hover:bg-zinc-200 dark:text-zinc-950 transition-all hover:translate-y-[-1px] hover:shadow-lg hover:shadow-zinc-950/20 dark:hover:shadow-zinc-50/10"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2Icon className="w-5 h-5 animate-spin" />
                Processing...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Submit Order
                <ArrowRightIcon className="w-4 h-4" />
              </span>
            )}
          </Button>
          <p className="text-center text-xs text-zinc-500 mt-4 font-medium flex items-center justify-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Secure submission. No account required.
          </p>
        </div>

      </form>
    </div>
  );
}
