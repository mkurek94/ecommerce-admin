"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Store } from "@prisma/client";
import { Trash } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import axios from "axios";
import toast from "react-hot-toast";
import { useParams, useRouter } from "next/navigation";
import { AlertModal } from "@/components/modals/alert-modal";
import { ApiAlert } from "@/components/ui/api-alert";

interface SettingsFormProps {
  initialData: Store;
}

const formSchema = z.object({
  name: z.string().min(1),
});

type SettingFormValues = z.infer<typeof formSchema>;

export const SettingsForm: React.FC<SettingsFormProps> = ({ initialData }) => {
  const params = useParams();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SettingFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  });

  const onSubmit = async (values: SettingFormValues) => {
    setIsLoading(true);

    axios
      .patch(`/api/stores/${params.storeId}`, values)
      .then(() => {
        router.refresh();
        toast.success("Store updated.");
      })
      .catch(() => {
        toast.error("Something went wrong");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const onDelete = async () => {
    setIsLoading(true);
    axios.delete(`/api/stores/${params.storeId}`).then(() => {
      router.refresh();
      router.push('/');
      toast.success("Store deleted");
    }).catch(() => {
      toast.error("Make sure you removed all products and categories first");
    }).finally(() => {
      setIsLoading(false);
      setIsOpen(false);
    });
  }

  return (
    <>
      <AlertModal
        isLoading={isLoading}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={onDelete}
      />
      <div className="flex items-center justify-between">
        <Heading title="Settings" description="Manage store preferences" />
        <Button
          disabled={isLoading}
          variant="destructive"
          size="sm"
          onClick={() => {
            setIsOpen(true);
          }}
        >
          <Trash className="h-4 w-4" />
        </Button>
      </div>
      <Separator />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 w-full"
        >
          <div className="grid grid-cols-3 gap-8">
            <FormField
              name="name"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      placeholder="Store name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button disabled={isLoading} type="submit">
            Save changes
          </Button>
        </form>
      </Form>
      <Separator/>
      <ApiAlert title="NEXT_PUBLIC_API_URL" description={`${origin}/api/${params.storeId}`} variant="public"/>
    </>
  );
};
