import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Database, Loader2, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";

export function DataImporter() {
  const [importing, setImporting] = useState(false);
  const { toast } = useToast();

  const parseExcel = async () => {
    const res = await fetch("/data/country_list_with_all_details.xlsx");
    if (!res.ok) throw new Error("Excel file not found");
    const ab = await res.arrayBuffer();
    const wb = XLSX.read(ab, { type: "array" });
    const sheetName = wb.SheetNames[0];
    const ws = wb.Sheets[sheetName];
    const json: any[] = XLSX.utils.sheet_to_json(ws, { defval: "" });

    // Map headers to our schema
    const rows = json.map((row) => ({
      country_name: row["Country"] || row["Country Name"] || row.country_name || row.country,
      capital_city: row["Capital City"] || row.capital_city || "",
      official_languages: row["Official Languages"] || row.official_languages || "",
      currency: row["Currency"] || row.currency || "",
      time_difference: row["Time Difference from IST"] || row.time_difference || "",
      popular_destinations: row["Popular Destinations"] || row.popular_destinations || "",
      major_airports: row["Major International Airport(s)"] || row.major_airports || "",
      visa_portal_link: row["Actual Visa Application Link/Portal (for Indian Citizens)"] || row.visa_portal_link || "",
      visa_requirement: row["Visa Requirement"] || row["Visa Requirement for Indians"] || row.visa_requirement || "",
      indian_embassy: row["Indian Embassy"] || row["Indian Embassy/High Commission"] || row.indian_embassy || "",
      flight_options: row["Flight Options"] || row["Flight Options from India"] || row.flight_options || "",
    })).filter((r) => !!r.country_name);

    return rows;
  };

  const handleImport = async () => {
    setImporting(true);
    try {
      const rows = await parseExcel();

      const { data, error } = await supabase.functions.invoke('import-countries', {
        body: { rows },
      });

      if (error) throw error;

      toast({
        title: "Import Successful!",
        description: `${data?.count ?? rows.length} countries imported successfully.`,
      });

      // Reload the page to show the new data
      setTimeout(() => window.location.reload(), 1200);
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to import country data.",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <Card className="w-full max-w-xl mx-auto shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Import Country Data (from Excel)
        </CardTitle>
        <CardDescription className="flex items-center gap-2">
          <FileSpreadsheet className="h-4 w-4" />
          Click below to import all countries from the provided Excel file
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
