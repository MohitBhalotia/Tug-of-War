import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";

const FormSchema = z.object({
  pin: z.string().min(6, {
    message: "Your access-code must be 6 characters.",
  }),
});

export default function InputOTPForm({ setAuth }) {
  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      pin: "",
    },
  });
  const accessCode= import.meta.env.VITE_ACCESS_CODE
  const onSubmit = (data) => {
    if (data.pin === accessCode) {
      toast.success("Login Successful");
      setAuth(true);
      localStorage.setItem("auth", true);
    }
    else{
      toast.error("Invalid Access Code");
    }
  };

  return (
    <div className="flex items-center justify-center p-20 bg-gradient-to-br from-gray-950 to-gray-900 rounded-2xl">
      <div className="w-full  rounded-2xl border border-gray-800 bg-gray-900 p-8 shadow-xl">
        <h2 className="mb-6 text-2xl font-semibold text-white text-center">
          Enter the Code
        </h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="pin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-md text-gray-300">
                    Access Code
                  </FormLabel>
                  <FormControl className="mt-4">
                    <InputOTP
                      maxLength={6}
                      {...field}
                      pattern={REGEXP_ONLY_DIGITS}
                      className="  mt-4"
                    >
                      <InputOTPGroup className="gap-2">
                        <InputOTPSlot
                          index={0}
                          className="h-16 w-16 text-lg rounded-xl border border-gray-700 bg-gray-800 text-white shadow-sm focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                        <InputOTPSlot
                          index={1}
                          className="h-16 w-16 text-lg rounded-xl border border-gray-700 bg-gray-800 text-white shadow-sm focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                      </InputOTPGroup>
                      <InputOTPSeparator className="text-gray-400" />
                      <InputOTPGroup className="gap-2">
                        <InputOTPSlot
                          index={2}
                          className="h-16 w-16 text-lg rounded-xl border border-gray-700 bg-gray-800 text-white shadow-sm focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                        <InputOTPSlot
                          index={3}
                          className="h-16 w-16 text-lg rounded-xl border border-gray-700 bg-gray-800 text-white shadow-sm focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                      </InputOTPGroup>
                      <InputOTPSeparator className="text-gray-400" />

                      <InputOTPGroup className="gap-2">
                        <InputOTPSlot
                          index={4}
                          className="h-16 w-16 text-lg rounded-xl border border-gray-700 bg-gray-800 text-white shadow-sm focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                        <InputOTPSlot
                          index={5}
                          className="h-16 w-16 text-lg rounded-xl border border-gray-700 bg-gray-800 text-white shadow-sm focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormDescription className="text-md text-gray-400 text-center mt-4">
                    Please enter the Access Code
                  </FormDescription>
                  <FormMessage className="text-md text-center mt-2"/>
                </FormItem>
              )}
            />

            <div className="flex items-center justify-center mt-6">
              <Button
                type="submit"
                className=" rounded-xl bg-blue-600 hover:bg-blue-700 transition-colors text-white text-lg py-6 px-6"
              >
                Submit
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
