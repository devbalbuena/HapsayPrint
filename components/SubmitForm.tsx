"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SubmitSuccess } from "./SubmitSuccess";
import { PrinterIcon, UploadIcon } from "lucide-react";
import { uploadFiles } from "@/lib/uploadthing";
import { submitPrintJob } from "@/app/actions";
import { toast } from "sonner";

interface FormData {
  name: string;
  contact: string;
  email: string;
  description: string;
  file: File | null;
}

interface FormErrors {
  name?: string;
  contact?: string;
  description?: string;
}

export function SubmitForm() {
  const [form, setForm] = useState<FormData>({
    name: "",
    contact: "",
    email: "",
    description: "",
    file: null,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  function validate(): FormErrors {
    const errs: FormErrors = {};
    if (!form.name.trim()) errs.name = "Full name is required.";
    if (!form.contact.trim()) errs.contact = "Contact number is required.";
    if (!form.description.trim())
      errs.description = "Job description is required.";
    return errs;
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // clear error on change
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setForm((prev) => ({ ...prev, file }));
    setFileName(file?.name ?? null);
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
      let fileData = undefined;
      
      // 1. Upload file if selected
      if (form.file) {
        toast.loading("Uploading file...", { id: "submit-toast" });
        const res = await uploadFiles("printJobFile", {
          files: [form.file],
        });
        
        if (res && res.length > 0) {
          fileData = {
            url: res[0].url,
            originalName: res[0].name,
            fileType: res[0].type,
          };
        }
      } else {
        toast.loading("Submitting your order...", { id: "submit-toast" });
      }

      // 2. Submit to Server Action
      const result = await submitPrintJob({
        name: form.name,
        contact: form.contact,
        email: form.email || null,
        description: form.description,
        file: fileData,
      });

      if (result.success) {
        toast.success("Order submitted successfully!", { id: "submit-toast" });
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
        onReset={() => {
          setForm({ name: "", contact: "", email: "", description: "", file: null });
          setFileName(null);
          setErrors({});
          setSubmitted(false);
        }}
      />
    );
  }

  return (
    <Card className="w-full shadow-lg border-0 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-2 rounded-lg bg-primary/10">
            <PrinterIcon className="w-5 h-5 text-primary" />
          </div>
          <CardTitle className="text-xl">Submit a Print Job</CardTitle>
        </div>
        <CardDescription className="text-sm leading-relaxed">
          Fill in your details and describe what you need printed. We&apos;ll
          contact you when it&apos;s ready for pickup.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* Full Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g. Maria Santos"
              value={form.name}
              onChange={handleChange}
              aria-describedby={errors.name ? "name-error" : undefined}
              aria-invalid={!!errors.name}
              className={errors.name ? "border-destructive focus-visible:ring-destructive/30" : ""}
            />
            {errors.name && (
              <p id="name-error" className="text-xs text-destructive flex items-center gap-1 mt-1">
                <span>⚠</span> {errors.name}
              </p>
            )}
          </div>

          {/* Contact Number */}
          <div className="space-y-1.5">
            <Label htmlFor="contact">
              Contact Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="contact"
              name="contact"
              type="tel"
              placeholder="e.g. 09171234567"
              value={form.contact}
              onChange={handleChange}
              aria-describedby={errors.contact ? "contact-error" : undefined}
              aria-invalid={!!errors.contact}
              className={errors.contact ? "border-destructive focus-visible:ring-destructive/30" : ""}
            />
            {errors.contact && (
              <p id="contact-error" className="text-xs text-destructive flex items-center gap-1 mt-1">
                <span>⚠</span> {errors.contact}
              </p>
            )}
          </div>

          {/* Email (optional) */}
          <div className="space-y-1.5">
            <Label htmlFor="email">
              Email{" "}
              <span className="text-muted-foreground font-normal text-xs">(optional)</span>
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="e.g. maria@email.com"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          {/* Job Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description">
              Job Description / Instructions <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              name="description"
              placeholder='e.g. "50 copies of resume, short bond paper, 1 side, black &amp; white"'
              value={form.description}
              onChange={handleChange}
              rows={4}
              aria-describedby={errors.description ? "description-error" : undefined}
              aria-invalid={!!errors.description}
              className={`resize-none ${errors.description ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
            />
            {errors.description && (
              <p id="description-error" className="text-xs text-destructive flex items-center gap-1 mt-1">
                <span>⚠</span> {errors.description}
              </p>
            )}
          </div>

          {/* File Upload */}
          <div className="space-y-1.5">
            <Label htmlFor="file">
              Attach File{" "}
              <span className="text-muted-foreground font-normal text-xs">(optional — photo, PDF, or design file)</span>
            </Label>
            <label
              htmlFor="file"
              className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-lg cursor-pointer transition-colors border-border hover:border-primary/50 hover:bg-primary/5 bg-muted/30"
            >
              <div className="flex flex-col items-center justify-center gap-1.5">
                <UploadIcon className="w-6 h-6 text-muted-foreground" />
                {fileName ? (
                  <p className="text-sm font-medium text-foreground px-2 text-center truncate max-w-[200px]">
                    {fileName}
                  </p>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Tap to upload a file
                    </p>
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG, PDF, DOCX up to 20MB
                    </p>
                  </>
                )}
              </div>
              <input
                id="file"
                name="file"
                type="file"
                accept="image/*,.pdf,.doc,.docx"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full h-11 text-base font-semibold"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                Submitting…
              </span>
            ) : (
              "Submit Print Job"
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground pt-1">
            No account needed. We&apos;ll reach out via your contact number.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
