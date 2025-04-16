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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
    // Save team names to localStorage
    localStorage.setItem("team1", data.team1);
    localStorage.setItem("team2", data.team2);
    localStorage.setItem("register", "true");

    toast.success("Teams registered successfully!", {
      description: `${data.team1} vs ${data.team2}`,
    });

    // Set auth to true to show the quiz
    setRegistered(true);
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl border border-slate-800 rounded-2xl bg-slate-900 text-white">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-white text-center my-4">
          Register Teams
        </CardTitle>
        <CardDescription className="text-slate-400 text-md mt-2">
          Enter the names of both teams to start the quiz
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="team1"
              render={({ field }) => (
                <FormItem className="mb-8">
                  <FormLabel className="text-white text-lg">Team 1</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter name of team 1 "
                      className="bg-slate-800 text-white border-slate-700 placeholder:text-slate-500"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="team2"
              render={({ field }) => (
                <FormItem className="mb-8">
                  <FormLabel className="text-white text-lg">Team 2</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter name of team 2"
                      className="bg-slate-800 text-white border-slate-700 placeholder:text-slate-500"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="w-full flex justify-center">
              <Button
                type="submit"
                className=" bg-blue-600 hover:bg-blue-700 transition-colors text-xl p-6"
              >
                Start Quiz
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
