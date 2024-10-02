import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Zap, Lock, DollarSign } from 'lucide-react';

export default function PDFGeneratorLandingPage() {
  return (
    <div className='min-h-screen bg-gradient-to-b from-gray-100 to-white'>
      <main className='container mx-auto px-4 py-16'>
        {/* Hero Section */}
        <section className='text-center mb-16'>
          <h2 className='text-4xl font-bold mb-4'>
            Generate Professional PDFs in Seconds
          </h2>
          <p className='text-xl text-muted-foreground mb-8'>
            Transform your data into beautifully formatted PDF documents with
            ease.
          </p>
          <Button size='lg' className='text-lg px-8'>
            Start Free Trial
          </Button>
        </section>

        {/* Key Features */}
        <section className='mb-16'>
          <h3 className='text-2xl font-semibold text-center mb-8'>
            Key Features
          </h3>
          <div className='grid md:grid-cols-3 gap-8'>
            <FeatureCard
              icon={<FileText className='h-10 w-10 text-primary' />}
              title='Multiple Templates'
              description='Choose from a variety of professional templates for any use case.'
            />
            <FeatureCard
              icon={<Zap className='h-10 w-10 text-primary' />}
              title='Lightning Fast'
              description='Generate PDFs in milliseconds, no matter the complexity.'
            />
            <FeatureCard
              icon={<Lock className='h-10 w-10 text-primary' />}
              title='Secure & Compliant'
              description='Bank-level encryption and GDPR compliant data handling.'
            />
          </div>
        </section>

        {/* How It Works */}
        <section className='mb-16'>
          <h3 className='text-2xl font-semibold text-center mb-8'>
            How It Works
          </h3>
          <div className='flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-8'>
            <div className='text-center'>
              <div className='bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2'>
                1
              </div>
              <p>Upload your data</p>
            </div>
            <div className='text-center'>
              <div className='bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2'>
                2
              </div>
              <p>Choose a template</p>
            </div>
            <div className='text-center'>
              <div className='bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2'>
                3
              </div>
              <p>Generate PDF</p>
            </div>
          </div>
        </section>

        {/* Pricing Plans */}
        <section className='mb-16'>
          <h3 className='text-2xl font-semibold text-center mb-8'>
            Pricing Plans
          </h3>
          <div className='grid md:grid-cols-3 gap-8'>
            <PricingCard
              title='Basic'
              price='$9'
              features={['100 PDFs/month', '5 Templates', 'Email Support']}
            />
            <PricingCard
              title='Pro'
              price='$29'
              features={['1000 PDFs/month', '20 Templates', 'Priority Support']}
              highlighted={true}
            />
            <PricingCard
              title='Enterprise'
              price='Custom'
              features={['Unlimited PDFs', 'Custom Templates', '24/7 Support']}
            />
          </div>
        </section>

        {/* Call to Action */}
        <section className='text-center'>
          <h3 className='text-2xl font-semibold mb-4'>Ready to Get Started?</h3>
          <p className='text-muted-foreground mb-8'>
            Join thousands of businesses that trust PDFGenius for their document
            needs.
          </p>
          <Button size='lg' className='text-lg px-8'>
            Start Your Free Trial
          </Button>
        </section>
      </main>

      <footer className='bg-gray-100 py-8'>
        <div className='container mx-auto px-4 text-center text-muted-foreground'>
          © 2023 PDFGenius. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center space-x-2'>
          {icon}
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p>{description}</p>
      </CardContent>
    </Card>
  );
}

function PricingCard({ title, price, features, highlighted = false }: any) {
  return (
    <Card className={highlighted ? 'border-primary shadow-lg' : ''}>
      <CardHeader>
        <CardTitle className='text-center'>
          <h4 className='text-xl mb-2'>{title}</h4>
          <p className='text-3xl font-bold'>
            {price}
            {price !== 'Custom' && (
              <span className='text-base font-normal'>/month</span>
            )}
          </p>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className='space-y-2'>
          {features.map((feature: any, index: any) => (
            <li key={index} className='flex items-center'>
              <DollarSign className='h-5 w-5 text-primary mr-2' />
              {feature}
            </li>
          ))}
        </ul>
        <Button
          className='w-full mt-4'
          variant={highlighted ? 'default' : 'outline'}
        >
          Choose Plan
        </Button>
      </CardContent>
    </Card>
  );
}
