
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { GoogleIcon } from './google-icon';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import type { UserRole } from '@/lib/types';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

const signupSchema = loginSchema.extend({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.'}),
  role: z.enum(['user', 'shopper'], { required_error: 'You must select a role.' }),
});

type AuthFormProps = {
  type: 'login' | 'signup';
  role?: UserRole;
};

export function AuthForm({ type, role }: AuthFormProps) {
  const router = useRouter();
  const { login, signup, logout } = useAuth();
  const { toast } = useToast();
  const schema = type === 'login' ? loginSchema : signupSchema;

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
      ...(type === 'signup' && { name: '', role: 'user' as UserRole }),
    },
  });

  async function onSubmit(values: z.infer<typeof schema>) {
    if (type === 'login') {
      try {
        const user = await login(values.email, values.password);

        if (role && user.role !== role) {
          logout();
          toast({
            title: 'Incorrect Login Form',
            description: `You're registered as a ${user.role}. Please use the ${user.role === 'user' ? 'Customer' : 'Seller'} login tab.`,
            variant: 'destructive',
          });
          return;
        }

        toast({ title: 'Welcome back!' });
        const redirectPath = new URLSearchParams(window.location.search).get('redirect');
        if (user.role === 'shopper') {
          router.push(redirectPath || '/dashboard');
        } else {
          router.push(redirectPath || '/');
        }
      } catch (error: any) {
        toast({
          title: 'Authentication Failed',
          description: error.message || 'Please check your credentials and try again.',
          variant: 'destructive',
        });
      }
    } else if (type === 'signup') {
      try {
        const { name, email, password, role } = values as z.infer<typeof signupSchema>;
        await signup(name, email, password, role);
        toast({ title: 'Account created!', description: 'You can now log in.' });
        router.push('/login');
      } catch (error: any) {
        toast({
          title: 'Signup Failed',
          description: error.message || 'An account with this email may already exist.',
          variant: 'destructive',
        });
      }
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              {type === 'signup' && (
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {type === 'signup' && (
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>I am a...</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="user" />
                            </FormControl>
                            <FormLabel className="font-normal">User (Customer)</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="shopper" />
                            </FormControl>
                            <FormLabel className="font-normal">Shopper (Seller)</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {type === 'login' ? 'Login' : 'Create Account'}
            </Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>
            <Button variant="outline" className="w-full" type="button">
              <GoogleIcon className="mr-2 h-4 w-4" />
              Google
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
