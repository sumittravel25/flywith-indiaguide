import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CountrySelector } from "@/components/CountrySelector";
import { CountryInfoTable } from "@/components/CountryInfoTable";
import { DataImporter } from "@/components/DataImporter";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import traviloLogo from "@/assets/travilo-logo.png";

interface Country {
  id: string;
  country_name: string;
  capital_city: string;
  official_languages: string;
  currency: string;
  time_difference: string;
  popular_destinations: string;
  major_airports: string;
  visa_portal_link: string;
  visa_requirement: string;
  indian_embassy: string;
  flight_options: string;
}

interface CountryListItem {
  id: string;
  country_name: string;
}

const Index = () => {
  const [countries, setCountries] = useState<CountryListItem[]>([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [countryData, setCountryData] = useState<Country | null>(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [showImporter, setShowImporter] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCountries();
    importCountriesData();
  }, []);

  const importCountriesData = async () => {
    try {
      const { count } = await supabase
        .from("countries")
        .select("*", { count: "exact", head: true });

      // Re-import if dataset is incomplete OR visa portal links are missing
      const { data: missingLinks } = await supabase
        .from("countries")
        .select("id")
        .or('visa_portal_link.is.null,visa_portal_link.eq.', { foreignTable: undefined })
        .limit(1);

      const shouldImport = !count || count < 195 || (missingLinks && missingLinks.length > 0);
      if (!shouldImport) {
        return;
      }

      const response = await fetch('/data/detail_info_about_all_contries.xlsx');
      const arrayBuffer = await response.arrayBuffer();
      const XLSX = await import('xlsx');
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet);

      await supabase.functions.invoke("import-countries", {
        body: { rows: jsonData },
      });

      await fetchCountries();
    } catch (error) {
      console.error("Error importing countries:", error);
    }
  };

  const fetchCountries = async () => {
    try {
      const { data, error } = await supabase
        .from("countries")
        .select("id, country_name")
        .order("country_name");

      if (error) throw error;

      setCountries(data || []);
    } catch (error) {
      console.error("Error fetching countries:", error);
      toast({
        title: "Error",
        description: "Failed to load countries. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGetInfo = async () => {
    if (!selectedCountry) {
      toast({
        title: "No country selected",
        description: "Please select a country first.",
        variant: "destructive",
      });
      return;
    }

    setSearching(true);
    try {
      const { data, error } = await supabase
        .from("countries")
        .select("*")
        .eq("country_name", selectedCountry)
        .single();

      if (error) throw error;

      setCountryData(data);
    } catch (error) {
      console.error("Error fetching country data:", error);
      toast({
        title: "Error",
        description: "Failed to load country information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSearching(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-hero text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="flex justify-center mb-4">
            <img src={traviloLogo} alt="TRAVILO Logo" className="h-24 w-auto" />
          </div>
          <p className="text-xl text-white/90">
            Discover essential travel information for Indian travelers worldwide
          </p>
        </div>
      </div>

      {/* Search Section */}
      <div className="max-w-4xl mx-auto px-4 -mt-8 space-y-6">
        {countries.length > 0 && (
          <div className="bg-card rounded-xl shadow-card p-8 space-y-6">
            <div className="space-y-4">
              <label className="text-lg font-semibold text-foreground">
                Select a Country
              </label>
              <CountrySelector
                countries={countries}
                value={selectedCountry}
                onValueChange={setSelectedCountry}
              />
            </div>

            <Button
              onClick={handleGetInfo}
              disabled={!selectedCountry || searching}
              className="w-full h-14 text-lg font-semibold"
              size="lg"
            >
              {searching ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Loading...
                </>
              ) : (
                "Get Info"
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Results Section */}
      {countryData && (
        <div className="max-w-4xl mx-auto px-4 py-12">
          <CountryInfoTable country={countryData} />
        </div>
      )}

      {/* Footer */}
      <footer className="py-8 text-center text-muted-foreground">
        <p>Travel information for Indian passport holders</p>
      </footer>
    </div>
  );
};

export default Index;
