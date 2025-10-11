import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Database, Loader2 } from "lucide-react";

export function DataImporter() {
  const [importing, setImporting] = useState(false);
  const { toast } = useToast();

  const handleImport = async () => {
    setImporting(true);
    try {
      const { data, error } = await supabase.functions.invoke('import-countries');

      if (error) throw error;

      toast({
        title: "Import Successful!",
        description: `${data.count} countries imported successfully.`,
      });

      // Reload the page to show the new data
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import Failed",
        description: "Failed to import country data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Import Country Data
        </CardTitle>
        <CardDescription>
          Click below to import all country information into the database
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={handleImport} 
          disabled={importing}
          className="w-full"
          size="lg"
        >
          {importing ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Importing...
            </>
          ) : (
            "Import Data Now"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
