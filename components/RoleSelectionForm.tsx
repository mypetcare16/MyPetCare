"use client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ROLES } from "@/lib/constants";
import { Button } from "@/components/ui/button";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Save } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  role: z.enum(["Doctor", "Patient"], {
    required_error: "You need to select a role.",
  }),
});

export default function RoleSelectionForm() {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const updateUserRole = useMutation(api.users.updateUserRole);

  const onSubmit = async ({ role }: z.infer<typeof formSchema>) => {
    await updateUserRole({ role });
    router.push("/dashboard");
  };

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select a role</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex space-x-4 items-center justify-between w-full"
                >
                  {ROLES.map((role) => (
                    <div
                      className="flex-1 w-full h-20 flex justify-center items-center"
                      key={role.id}
                    >
                      <RadioGroupItem
                        value={role.value}
                        id={role.id}
                        className="hidden"
                      />
                      <label
                        htmlFor={role.id}
                        className={`p-2 w-full h-full flex justify-center items-center border rounded-md cursor-pointer transition-colors
                          ${field.value === role.value ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"}
                          hover:bg-blue-600 hover:text-white`}
                      >
                        {role.label}
                      </label>
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="w-full flex justify-between gap-1">
          <Button
            aria-label="generate plan"
            type="submit"
            // disabled={!form.formState.isValid}
            className="w-full"
          >
            <Save />
            Save
          </Button>
        </div>
      </form>
    </Form>
  );
}
