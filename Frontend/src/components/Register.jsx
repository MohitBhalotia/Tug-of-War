import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const FormSchema = z.object({
  team1: z.string().min(2, {
    message: "Team 1 name must be at least 2 characters.",
  }),
  team2: z.string().min(2, {
    message: "Team 2 name must be at least 2 characters.",
  }),
});

export default function Register({ setRegistered }) {
  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      team1: "",
      team2: "",
    },
  });

  const onSubmit = (data) => {
    localStorage.setItem("team1", data.team1);
    localStorage.setItem("team2", data.team2);
    localStorage.setItem("register", "true");

    toast.success("Teams registered successfully!", {
      description: `${data.team1} vs ${data.team2}`,
    });

    setRegistered(true);
  };

  return (
    <div className="h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Team Registration</h2>
          <p className="text-gray-600">Enter the names of both teams to start the quiz</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="team1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 text-lg font-semibold">Team 1</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter name of team 1"
                      className="h-12 text-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="team2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 text-lg font-semibold">Team 2</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter name of team 2"
                      className="h-12 text-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-center mt-8">
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-200"
              >
                Start Quiz
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
