import Link from 'next/link';
import { AuthForm } from '@/components/auth/auth-forms';
import { KalaConnectLogo } from '@/components/icons';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center text-center">
            <Link href="/" className="flex items-center gap-2 mb-4">
                <KalaConnectLogo className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold font-headline">KalaConnect</h1>
            </Link>
            <p className="text-muted-foreground">Welcome back! Sign in to continue.</p>
        </div>
        
        <Tabs defaultValue="customer" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="customer">Customer Login</TabsTrigger>
            <TabsTrigger value="seller">Seller Login</TabsTrigger>
          </TabsList>
          <TabsContent value="customer">
            <AuthForm type="login" role="user" />
            <Card className="mt-4 border-dashed">
              <CardHeader className="p-4">
                <CardTitle className="text-sm font-medium">Demo Credentials</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 text-sm text-muted-foreground">
                <p><strong>Email:</strong> user@example.com</p>
                <p><strong>Password:</strong> password</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="seller">
            <AuthForm type="login" role="shopper" />
             <Card className="mt-4 border-dashed">
              <CardHeader className="p-4">
                <CardTitle className="text-sm font-medium">Demo Credentials</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 text-sm text-muted-foreground">
                <p><strong>Email:</strong> seller@gmail.com</p>
                <p><strong>Password:</strong> ruchika</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link href="/signup" className="font-semibold text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
