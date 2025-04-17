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
  const accessCode = import.meta.env.VITE_ACCESS_CODE;
  const onSubmit = (data) => {
    if (data.pin === accessCode) {
      toast.success("Login Successful");
      setAuth(true);
      localStorage.setItem("register", false);
      localStorage.setItem("team1", "");
      localStorage.setItem("team2", "");
      localStorage.setItem("auth", true);
    } else {
      toast.error("Invalid Access Code");
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h2>
          <p className="text-gray-600">Enter your access code to continue</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="pin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 text-lg font-semibold">
                    Access Code
                  </FormLabel>
                  <FormControl>
                    <InputOTP
                      maxLength={6}
                      {...field}
                      pattern={REGEXP_ONLY_DIGITS}
                      className="mt-4"
                    >
                      <InputOTPGroup className="gap-1">
                        <InputOTPSlot
                          index={0}
                          className="h-13 w-13 text-xl rounded-lg border-2 border-gray-200 bg-white text-gray-800 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        />
                        <InputOTPSlot
                          index={1}
                          className="h-13 w-13 text-xl rounded-lg border-2 border-gray-200 bg-white text-gray-800 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        />
                      </InputOTPGroup>
                      <InputOTPSeparator className="text-gray-400" />
                      <InputOTPGroup className="gap-1">
                        <InputOTPSlot
                          index={2}
                          className="h-13 w-13 text-xl rounded-lg border-2 border-gray-200 bg-white text-gray-800 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        />
                        <InputOTPSlot
                          index={3}
                          className="h-13 w-13 text-xl rounded-lg border-2 border-gray-200 bg-white text-gray-800 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        />
                      </InputOTPGroup>
                      <InputOTPSeparator className="text-gray-400" />
                      <InputOTPGroup className="gap-1">
                        <InputOTPSlot
                          index={4}
                          className="h-13 w-13 text-xl rounded-lg border-2 border-gray-200 bg-white text-gray-800 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        />
                        <InputOTPSlot
                          index={5}
                          className="h-13 w-13 text-xl rounded-lg border-2 border-gray-200 bg-white text-gray-800 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        />
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormDescription className="text-gray-500 text-center mt-4">
                    Please enter the 6-digit access code
                  </FormDescription>
                  <FormMessage className="text-red-500 text-center mt-2" />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-center mt-8">
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-200"
              >
                Continue
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
