import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface CountryData {
  country_name: string;
  capital_city: string;
  official_languages: string;
  currency: string;
  time_difference: string;
  popular_destinations: string;
  major_airports: string;
  visa_requirement: string;
  indian_embassy: string;
  flight_options: string;
}

interface CountryInfoTableProps {
  country: CountryData;
}

export function CountryInfoTable({ country }: CountryInfoTableProps) {
  const [exchangeRates, setExchangeRates] = useState<Record<string, number> | null>(null);
  const [loadingRates, setLoadingRates] = useState(false);
  const singleRate = exchangeRates ? Object.entries(exchangeRates)[0] : null;

  useEffect(() => {
    const fetchExchangeRates = async () => {
      // Extract currency code from the currency string (e.g., "Afghan afghani (AFN)" -> "AFN")
      const currencyMatch = country.currency.match(/\(([A-Z]{3})\)/);
      if (!currencyMatch) return;

      const currencyCode = currencyMatch[1];
      setLoadingRates(true);

      try {
        const { data, error } = await supabase.functions.invoke('get-exchange-rates', {
          body: { currencyCode }
        });

        if (error) throw error;

        if (data?.rates) {
          const inrPerUnitOfCountry = data.rates.INR;
          if (typeof inrPerUnitOfCountry === 'number' && inrPerUnitOfCountry > 0) {
            const oneINRInCountry = 1 / inrPerUnitOfCountry;
            setExchangeRates({ [currencyCode]: oneINRInCountry });
          }
        }
      } catch (error) {
        console.error('Error fetching exchange rates:', error);
      } finally {
        setLoadingRates(false);
      }
    };

    fetchExchangeRates();
  }, [country.currency]);

  const getVisaBadgeVariant = (visa: string) => {
    const lowerVisa = visa.toLowerCase();
    if (lowerVisa.includes("visa-free") || lowerVisa.includes("visa free")) {
      return "default";
    }
    if (lowerVisa.includes("visa on arrival") || lowerVisa.includes("evisa")) {
      return "secondary";
    }
    return "destructive";
  };

  const formatExchangeRate = (rate: number) => {
    return rate.toFixed(2);
  };

  // Extract currency name and code
  const currencyMatch = country.currency.match(/^(.*)\s*\(([A-Z]{3})\)$/);
  const currencyName = currencyMatch ? currencyMatch[1] : country.currency;
  const currencyCode = currencyMatch ? currencyMatch[2] : "";

  const tableData = [
    { label: "Capital City", value: country.capital_city },
    { label: "Official Languages", value: country.official_languages },
    { label: "Currency", value: country.currency },
    { label: "Time Difference from IST", value: country.time_difference },
    { label: "Popular Destinations", value: country.popular_destinations },
    { label: "Major International Airport(s)", value: country.major_airports },
    { 
      label: "Visa Requirement for Indians", 
      value: country.visa_requirement,
      isBadge: true 
    },
    { label: "Indian Embassy/High Commission", value: country.indian_embassy },
    { label: "Flight Options from India", value: country.flight_options },
  ];

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="text-3xl">{country.country_name}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/3 font-semibold">Category</TableHead>
              <TableHead className="font-semibold">Information</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableData.map((row, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{row.label}</TableCell>
                <TableCell>
                  {row.isBadge ? (
                    <Badge variant={getVisaBadgeVariant(row.value)}>
                      {row.value}
                    </Badge>
                  ) : (
                    row.value
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {currencyCode && (
          <div className="mt-6 pt-6 border-t">
            <h3 className="text-lg font-semibold mb-4">Exchange Rates (1 INR)</h3>
            {loadingRates ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : exchangeRates ? (
              singleRate ? (
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <div className="text-sm text-muted-foreground">1 INR equals</div>
                  <div className="text-2xl font-bold">
                    {formatExchangeRate(singleRate[1])} {singleRate[0]}
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Exchange rates unavailable</p>
              )
            ) : (
              <p className="text-muted-foreground">Exchange rates unavailable</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
