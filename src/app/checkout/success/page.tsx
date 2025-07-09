
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CheckoutSuccessPage() {
    return (
        <div className="container mx-auto px-4 py-16 flex items-center justify-center">
            <Card className="max-w-lg w-full text-center">
                <CardHeader className="items-center">
                    <div className="p-4 bg-green-100 rounded-full">
                        <CheckCircle2 className="h-12 w-12 text-green-600" />
                    </div>
                    <CardTitle className="font-headline text-3xl mt-4">Order Placed Successfully!</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                        Thank you for your purchase. A confirmation email has been sent to you. You can view your order history in your account.
                    </p>
                    <Button asChild size="lg">
                        <Link href="/">
                            Continue Shopping
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
