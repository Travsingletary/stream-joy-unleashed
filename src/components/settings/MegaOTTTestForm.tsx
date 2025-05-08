
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from '../../hooks/use-toast';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { testMegaOTTConnection } from '../../services/megaOTTService';

const MegaOTTTestForm: React.FC = () => {
  const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [testResult, setTestResult] = useState<any>(null);

  // MegaOTT form schema
  const megaOTTSchema = z.object({
    apiKey: z.string().min(1, 'API Key is required')
  });

  const megaOTTForm = useForm<z.infer<typeof megaOTTSchema>>({
    resolver: zodResolver(megaOTTSchema),
    defaultValues: {
      apiKey: ''
    }
  });

  const onMegaOTTTest = async (data: z.infer<typeof megaOTTSchema>) => {
    try {
      setTestStatus('loading');
      
      toast({
        title: "Testing MegaOTT API",
        description: "Please wait while we test the connection...",
      });
      
      const result = await testMegaOTTConnection(data.apiKey);
      setTestResult(result);
      
      if (result.status) {
        setTestStatus('success');
        toast({
          title: "Connection successful",
          description: `Credits available: ${result.data?.credits || 'Unknown'}`,
        });
      } else {
        setTestStatus('error');
        toast({
          variant: "destructive",
          title: "Connection failed",
          description: result.message || "Failed to connect to MegaOTT API",
        });
      }
    } catch (error: any) {
      console.error("MegaOTT API test error:", error);
      setTestStatus('error');
      setTestResult({ error: error.message });
      
      toast({
        variant: "destructive",
        title: "Test failed",
        description: error.message || "Failed to test MegaOTT API connection",
      });
    }
  };

  return (
    <div className="mt-6 pt-4 border-t border-steadystream-gold/10">
      <h3 className="text-steadystream-gold-light text-lg mb-2">Test MegaOTT API Connection</h3>
      <p className="text-steadystream-secondary mb-4 text-sm">
        Test your connection to the MegaOTT service API
      </p>
      
      {testStatus === 'error' && testResult && (
        <Alert variant="destructive" className="mb-4 bg-red-900/20 border-red-700">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Connection Error</AlertTitle>
          <AlertDescription>
            {testResult.message || "Failed to connect to MegaOTT API"}
          </AlertDescription>
          
          {testResult.error && (
            <div className="mt-2 text-xs bg-red-900/10 p-2 rounded">
              <code>{testResult.error}</code>
            </div>
          )}
        </Alert>
      )}
      
      {testStatus === 'success' && testResult && (
        <Alert className="mb-4 bg-green-900/20 border-green-700">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Connection Successful</AlertTitle>
          <AlertDescription>
            Successfully connected to MegaOTT API.
            {testResult.data?.credits !== undefined && (
              <div className="mt-1">Credits available: <span className="font-medium">{testResult.data.credits}</span></div>
            )}
          </AlertDescription>
        </Alert>
      )}
      
      <Form {...megaOTTForm}>
        <form onSubmit={megaOTTForm.handleSubmit(onMegaOTTTest)} className="space-y-4">
          <FormField
            control={megaOTTForm.control}
            name="apiKey"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-steadystream-gold-light">MegaOTT API Key</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter your MegaOTT API key" 
                    className="bg-steadystream-black border-steadystream-gold/30 text-white"
                    defaultValue="338|fB64PDKNmVFjbHXhCV7sf4GmCYTZKP5xApf8IC0D371dc28d"
                    {...field} 
                  />
                </FormControl>
                <FormDescription className="text-steadystream-secondary">
                  Enter your MegaOTT API key to test the connection
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            className="bg-gold-gradient hover:bg-gold-gradient-hover text-black"
            disabled={testStatus === 'loading'}
          >
            {testStatus === 'loading' ? 'Testing...' : 'Test Connection'}
          </Button>
        </form>
      </Form>
      
      {testStatus === 'success' && testResult && (
        <div className="mt-4 text-sm">
          <h4 className="text-steadystream-gold-light mb-1">API Response Details:</h4>
          <div className="bg-gray-900/40 p-2 rounded overflow-auto max-h-40">
            <pre className="text-xs text-gray-300">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default MegaOTTTestForm;
