import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CountrySelector } from "@/components/CountrySelector";
import { CountryInfoTable } from "@/components/CountryInfoTable";
import { DataImporter } from "@/components/DataImporter";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import traviloLogo from "@/assets/travilo-logo.png";

interface TravelInfo {
  id: string;
  home_country: string;
  destination_country: string;
  capital_city: string;
  official_languages: string;
  currency: string;
  time_difference: string;
  popular_destinations: string;
  major_airports: string;
  visa_portal_link: string;
  visa_requirement: string;
  embassy_info: string;
  flight_options: string;
}

interface CountryListItem {
  country_name: string;
}

const Index = () => {
  const [homeCountries, setHomeCountries] = useState<CountryListItem[]>([]);
  const [destinationCountries, setDestinationCountries] = useState<CountryListItem[]>([]);
  const [selectedHomeCountry, setSelectedHomeCountry] = useState("India");
  const [selectedDestination, setSelectedDestination] = useState("");
  const [travelData, setTravelData] = useState<TravelInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAllCountries();
    importCountriesData();
  }, []);

  const importCountriesData = async () => {
    try {
      const { count } = await supabase
        .from("travel_information")
        .select("*", { count: "exact", head: true })
        .eq("home_country", "India");

      const { data: missingLinks } = await supabase
        .from("travel_information")
        .select("id")
        .eq("home_country", "India")
        .or('visa_portal_link.is.null,visa_portal_link.eq.')
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
        body: { rows: jsonData, homeCountry: "India" },
      });

      await fetchAllCountries();
    } catch (error) {
      console.error("Error importing countries:", error);
    }
  };

  const fetchAllCountries = async () => {
    try {
      // Get unique home countries
      const { data: homeData, error: homeError } = await supabase
        .from("travel_information")
        .select("home_country")
        .order("home_country");

      if (homeError) throw homeError;

      const uniqueHome = Array.from(new Set(homeData?.map(c => c.home_country) || []))
        .map(name => ({ country_name: name }));
      setHomeCountries(uniqueHome);

      // Get unique destination countries
      const { data: destData, error: destError } = await supabase
        .from("travel_information")
        .select("destination_country")
        .order("destination_country");

      if (destError) throw destError;

      const uniqueDest = Array.from(new Set(destData?.map(c => c.destination_country) || []))
        .map(name => ({ country_name: name }));
      setDestinationCountries(uniqueDest);
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
    if (!selectedDestination) {
      toast({
        title: "No destination selected",
        description: "Please select a destination country.",
        variant: "destructive",
      });
      return;
    }

    setSearching(true);
    try {
      const { data, error } = await supabase
        .from("travel_information")
        .select("*")
        .eq("home_country", selectedHomeCountry)
        .eq("destination_country", selectedDestination)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast({
          title: "No data available",
          description: `Travel information for ${selectedHomeCountry} → ${selectedDestination} is not available yet.`,
          variant: "destructive",
        });
        setTravelData(null);
        return;
      }

      setTravelData(data);
    } catch (error) {
      console.error("Error fetching travel data:", error);
      toast({
        title: "Error",
        description: "Failed to load travel information. Please try again.",
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
            Discover essential travel information for travelers worldwide
          </p>
        </div>
      </div>

      {/* Search Section */}
      <div className="max-w-4xl mx-auto px-4 -mt-8 space-y-6">
        {homeCountries.length > 0 && destinationCountries.length > 0 && (
          <div className="bg-card rounded-xl shadow-card p-8 space-y-6">
            <div className="space-y-4">
              <label className="text-lg font-semibold text-foreground">
                Your Nationality
              </label>
              <CountrySelector
                countries={homeCountries}
                value={selectedHomeCountry}
                onValueChange={setSelectedHomeCountry}
              />
            </div>

            <div className="space-y-4">
              <label className="text-lg font-semibold text-foreground">
                Destination Country
              </label>
              <CountrySelector
                countries={destinationCountries}
                value={selectedDestination}
                onValueChange={setSelectedDestination}
              />
            </div>

            <Button
              onClick={handleGetInfo}
              disabled={!selectedDestination || searching}
              className="w-full h-14 text-lg font-semibold"
              size="lg"
            >
              {searching ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Loading...
                </>
              ) : (
                "Get Travel Info"
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Results Section */}
      {travelData && (
        <div className="max-w-4xl mx-auto px-4 py-12">
          <CountryInfoTable country={travelData} />
        </div>
      )}

      {/* Footer */}
      <footer className="py-8 text-center text-muted-foreground">
        <p>Travel information for all nationalities</p>
      </footer>
    </div>
  );
};

export default Index;
