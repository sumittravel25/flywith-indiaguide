import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, CreditCard, Languages, Building2, Plane, FileText } from "lucide-react";

interface CountryData {
  country_name: string;
  official_languages: string;
  currency: string;
  visa_requirement: string;
  embassy_presence: string;
  flight_options: string;
}

interface CountryInfoProps {
  country: CountryData;
}

export function CountryInfo({ country }: CountryInfoProps) {
  const getVisaBadgeVariant = (visa: string) => {
    if (visa.toLowerCase().includes("visa-free")) return "default";
    if (visa.toLowerCase().includes("visa on arrival") || visa.toLowerCase().includes("evisa")) return "secondary";
    return "outline";
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="shadow-card border-2 overflow-hidden">
        <CardHeader className="bg-gradient-hero text-white">
          <CardTitle className="text-3xl font-bold flex items-center gap-3">
            <Globe className="h-8 w-8" />
            {country.country_name}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Currency */}
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <CreditCard className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">Currency</h3>
              <p className="text-muted-foreground">{country.currency}</p>
            </div>
          </div>

          {/* Languages */}
          <div className="flex items-start gap-4">
            <div className="p-3 bg-accent/10 rounded-lg">
              <Languages className="h-6 w-6 text-accent" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">Official Language(s)</h3>
              <p className="text-muted-foreground">{country.official_languages}</p>
            </div>
          </div>

          {/* Visa Requirement */}
          <div className="flex items-start gap-4">
            <div className="p-3 bg-secondary/10 rounded-lg">
              <FileText className="h-6 w-6 text-secondary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">Visa Status for Indian Travelers</h3>
              <Badge variant={getVisaBadgeVariant(country.visa_requirement)} className="text-base px-4 py-1.5">
                {country.visa_requirement}
              </Badge>
            </div>
          </div>

          {/* Embassy */}
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">Indian Embassy/High Commission</h3>
              <p className="text-muted-foreground">{country.embassy_presence}</p>
            </div>
          </div>

          {/* Flight Options */}
          <div className="flex items-start gap-4">
            <div className="p-3 bg-accent/10 rounded-lg">
              <Plane className="h-6 w-6 text-accent" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">Flight Connectivity from India</h3>
              <p className="text-muted-foreground">{country.flight_options}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
