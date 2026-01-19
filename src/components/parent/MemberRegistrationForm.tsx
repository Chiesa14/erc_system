import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const memberFormSchema = z.object({
  // Basic Information
  name: z.string().min(2, "Name must be at least 2 characters"),
  id_name: z.string().optional(),
  deliverance_name: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  dateOfBirth: z.date({
    required_error: "Date of birth is required",
  }),
  gender: z.enum(["Male", "Female"]),

  // Residence Details
  home_address: z.string().optional(),
  district: z.string().optional(),
  sector: z.string().optional(),
  cell: z.string().optional(),
  village: z.string().optional(),
  living_arrangement: z.string().optional(),

  // BCC Classes
  educationLevel: z.enum(["None", "Primary", "Secondary", "Tertiary", "Other"]).optional(),
  bcc_class_participation: z.boolean().optional(),
  bcc_class_status: z.enum(["Graduate", "Ongoing", "Not yet Started"]).optional(),
  graduationYear: z.string().optional(),
  graduationMode: z.enum(["Online", "Physical"]).optional(),

  // Commission and Parent/Guardian
  commission: z.string().optional(),
  parent_guardian_status: z.enum([
    "Both Parents",
    "One Parent",
    "Stepfamily",
    "Grandparents",
    "Guardian (Non-relative)",
    "None"
  ]).optional(),

  // Occupation
  employment_type: z.enum([
    "Full-Time Employed",
    "Full-Time Self-Employed",
    "Freelance",
    "Part-Time",
    "Temporary",
    "Contract for a Specific Period",
    "Unemployed",
    "Student"
  ]).optional(),
  job_title: z.string().optional(),
  organization: z.string().optional(),
  business_type: z.string().optional(),
  business_name: z.string().optional(),
  work_type: z.string().optional(),
  work_description: z.string().optional(),
  work_location: z.string().optional(),

  // Student Fields
  institution: z.string().optional(),
  program: z.string().optional(),
  student_level: z.string().optional(),
});

type MemberFormData = z.infer<typeof memberFormSchema>;

interface MemberRegistrationFormProps {
  onClose: () => void;
}

export function MemberRegistrationForm({
  onClose,
}: MemberRegistrationFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<MemberFormData>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: {
      bcc_class_participation: false,
      bcc_class_status: "Not yet Started",
      graduationMode: "Physical",
      parent_guardian_status: "Both Parents",
    },
  });

  const watchEmploymentType = form.watch("employment_type");
  const watchBccParticipation = form.watch("bcc_class_participation");

  const onSubmit = async (data: MemberFormData) => {
    setIsSubmitting(true);

    try {
      // Format data for API
      const apiData = {
        name: data.name,
        id_name: data.id_name || null,
        deliverance_name: data.deliverance_name || null,
        phone: data.phone,
        email: data.email || null,
        date_of_birth: format(data.dateOfBirth, "yyyy-MM-dd"),
        gender: data.gender,
        home_address: data.home_address || null,
        district: data.district || null,
        sector: data.sector || null,
        cell: data.cell || null,
        village: data.village || null,
        living_arrangement: data.living_arrangement || null,
        education_level: data.educationLevel || null,
        bcc_class_participation: data.bcc_class_participation || false,
        bcc_class_status: data.bcc_class_status || null,
        year_of_graduation: data.graduationYear ? parseInt(data.graduationYear) : null,
        graduation_mode: data.graduationMode || null,
        commission: data.commission || null,
        parent_guardian_status: data.parent_guardian_status || null,
        parental_status: data.parent_guardian_status !== "None",
        employment_type: data.employment_type || null,
        employment_status: data.employment_type || null,
        job_title: data.job_title || null,
        organization: data.organization || null,
        business_type: data.business_type || null,
        business_name: data.business_name || null,
        work_type: data.work_type || null,
        work_description: data.work_description || null,
        work_location: data.work_location || null,
        institution: data.institution || null,
        program: data.program || null,
        student_level: data.student_level || null,
      };

      // Get token from localStorage
      const token = localStorage.getItem("access_token");

      const response = await fetch("/api/family/family-members/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        throw new Error("Failed to add member");
      }

      toast({
        title: "Member added successfully",
        description: `${data.name} has been added to your family.`,
      });

      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add member. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
        <Accordion type="multiple" defaultValue={["basic", "residence", "bcc", "occupation"]} className="w-full">

          {/* Basic Information */}
          <AccordionItem value="basic">
            <AccordionTrigger className="text-lg font-semibold">Basic Information</AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                {/* Full Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* ID Name */}
                <FormField
                  control={form.control}
                  name="id_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ID Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Name on ID card" {...field} />
                      </FormControl>
                      <FormDescription>Name as it appears on official ID</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Deliverance Name */}
                <FormField
                  control={form.control}
                  name="deliverance_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deliverance Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Spiritual/Deliverance name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Phone */}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="+250..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email (Optional)</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="email@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Date of Birth */}
                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date of Birth *</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Gender */}
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Parent/Guardian Status */}
                <FormField
                  control={form.control}
                  name="parent_guardian_status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parent/Guardian Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Both Parents">Both Parents</SelectItem>
                          <SelectItem value="One Parent">One Parent</SelectItem>
                          <SelectItem value="Stepfamily">Stepfamily</SelectItem>
                          <SelectItem value="Grandparents">Grandparents</SelectItem>
                          <SelectItem value="Guardian (Non-relative)">Guardian (Non-relative)</SelectItem>
                          <SelectItem value="None">None</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Commission */}
                <FormField
                  control={form.control}
                  name="commission"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Church Commission</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select commission" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Worship">Worship</SelectItem>
                          <SelectItem value="Intercession">Intercession</SelectItem>
                          <SelectItem value="Evangelism">Evangelism</SelectItem>
                          <SelectItem value="Social">Social</SelectItem>
                          <SelectItem value="Fellowship">Fellowship</SelectItem>
                          <SelectItem value="Ushering">Ushering</SelectItem>
                          <SelectItem value="Technical">Technical</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Residence Details */}
          <AccordionItem value="residence">
            <AccordionTrigger className="text-lg font-semibold">Residence Details</AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <FormField
                  control={form.control}
                  name="district"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>District</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Gasabo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sector"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sector</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Kimironko" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cell"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cell</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Kibagabaga" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="village"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Village</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter village name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="living_arrangement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Living Arrangement</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select arrangement" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="With Family">With Family</SelectItem>
                          <SelectItem value="Alone">Alone</SelectItem>
                          <SelectItem value="With Roommates">With Roommates</SelectItem>
                          <SelectItem value="Dormitory">Dormitory</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="home_address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Address</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter complete home address" className="min-h-[60px]" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* BCC Classes */}
          <AccordionItem value="bcc">
            <AccordionTrigger className="text-lg font-semibold">BCC Classes</AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <FormField
                  control={form.control}
                  name="educationLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Education Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="None">None</SelectItem>
                          <SelectItem value="Primary">Primary</SelectItem>
                          <SelectItem value="Secondary">Secondary</SelectItem>
                          <SelectItem value="Tertiary">Tertiary</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bcc_class_status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>BCC Class Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Graduate">Graduate</SelectItem>
                          <SelectItem value="Ongoing">Ongoing</SelectItem>
                          <SelectItem value="Not yet Started">Not yet Started</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bcc_class_participation"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 md:col-span-2">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>BCC Class Graduate</FormLabel>
                        <FormDescription>Has completed the BCC program</FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {watchBccParticipation && (
                  <>
                    <FormField
                      control={form.control}
                      name="graduationYear"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Year of Graduation</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 2024" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="graduationMode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Graduation Mode</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select mode" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Online">Online</SelectItem>
                              <SelectItem value="Physical">Physical</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Occupation */}
          <AccordionItem value="occupation">
            <AccordionTrigger className="text-lg font-semibold">Occupation</AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <FormField
                  control={form.control}
                  name="employment_type"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Employment Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select employment type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Full-Time Employed">Full-Time Employed</SelectItem>
                          <SelectItem value="Full-Time Self-Employed">Full-Time Self-Employed</SelectItem>
                          <SelectItem value="Freelance">Freelance</SelectItem>
                          <SelectItem value="Part-Time">Part-Time</SelectItem>
                          <SelectItem value="Temporary">Temporary</SelectItem>
                          <SelectItem value="Contract for a Specific Period">Contract for a Specific Period</SelectItem>
                          <SelectItem value="Unemployed">Unemployed</SelectItem>
                          <SelectItem value="Student">Student</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Employed Fields */}
                {(watchEmploymentType === "Full-Time Employed" ||
                  watchEmploymentType === "Part-Time" ||
                  watchEmploymentType === "Contract for a Specific Period") && (
                    <>
                      <FormField
                        control={form.control}
                        name="job_title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Job Title</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Software Developer" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="organization"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Organization</FormLabel>
                            <FormControl>
                              <Input placeholder="Company name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="work_location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Work Location</FormLabel>
                            <FormControl>
                              <Input placeholder="City, District" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                {/* Self-Employed Fields */}
                {watchEmploymentType === "Full-Time Self-Employed" && (
                  <>
                    <FormField
                      control={form.control}
                      name="business_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Type</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Retail, Services" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="business_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your business name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="work_location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Location</FormLabel>
                          <FormControl>
                            <Input placeholder="City, District" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {/* Freelance Fields */}
                {watchEmploymentType === "Freelance" && (
                  <>
                    <FormField
                      control={form.control}
                      name="work_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type of Work</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Web Development" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="work_description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Work Description</FormLabel>
                          <FormControl>
                            <Input placeholder="Brief description" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {/* Student Fields */}
                {watchEmploymentType === "Student" && (
                  <>
                    <FormField
                      control={form.control}
                      name="institution"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Institution</FormLabel>
                          <FormControl>
                            <Input placeholder="School/University name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="program"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Program</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Computer Science" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="student_level"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Level</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Year 3, S6" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              "Add Member"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
