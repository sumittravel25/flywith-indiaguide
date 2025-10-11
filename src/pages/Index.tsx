import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CountrySelector } from "@/components/CountrySelector";
import { CountryInfo } from "@/components/CountryInfo";
import { DataImporter } from "@/components/DataImporter";
import { Button } from "@/components/ui/button";
import { Loader2, Globe2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Country {
  id: string;
  country_name: string;
  official_languages: string;
  currency: string;
  visa_requirement: string;
  embassy_presence: string;
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
  const { toast } = useToast();

  useEffect(() => {
    fetchCountries();
  }, []);

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
            <Globe2 className="h-16 w-16" />
          </div>
          <h1 className="text-5xl font-bold">Country Info Explorer</h1>
          <p className="text-xl text-white/90">
            Discover essential travel information for Indian travelers worldwide
          </p>
        </div>
      </div>

      {/* Search Section */}
      <div className="max-w-4xl mx-auto px-4 -mt-8 space-y-6">
        {countries.length === 0 && !loading && (
          <DataImporter />
        )}
        
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
          <CountryInfo country={countryData} />
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
